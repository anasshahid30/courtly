import secrets
import uuid
from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session

from app.core.rate_limit import (
    check_login_rate_limit,
    record_failed_login,
    reset_failed_logins,
)
from app.core.roles import ROLE_GUEST
from app.core.security import ALGORITHM, SECRET_KEY
from app.db import get_db
from app.deps import get_current_user
from app.models import Case, User
from app.models import Session as SessionModel

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
ph = PasswordHasher()


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip() if isinstance(v, str) else v


class LoginIn(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip() if isinstance(v, str) else v


@router.post("/register", status_code=201)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    email = data.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=email, password_hash=ph.hash(data.password), full_name=data.full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    from app.core.levels import initialize_user_progress

    initialize_user_progress(db, user.id)
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}


@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    check_login_rate_limit(email)

    user = db.query(User).filter(User.email == email).first()
    if not user:
        record_failed_login(email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    try:
        ph.verify(user.password_hash, data.password)
    except VerifyMismatchError:
        record_failed_login(email)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    reset_failed_logins(email)
    payload = {"sub": str(user.id), "exp": datetime.now(UTC) + timedelta(minutes=15)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def read_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }


@router.post("/guest", status_code=201)
def create_guest_session(db: Session = Depends(get_db)):
    """
    Creates an isolated guest user and Foundation-only (level 1) trial session
    for `contract_breach_demo`, returning a 2-hour JWT bound to that session.
    """
    case = (
        db.query(Case)
        .filter(Case.slug == "contract_breach_demo")
        .first()
    )
    if not case:
        raise HTTPException(
            status_code=404,
            detail="Foundation simulation case 'contract_breach_demo' is not available.",
        )

    guest_email = f"guest_{uuid.uuid4().hex[:12]}@guest.courtly.local"
    guest_user = User(
        email=guest_email,
        password_hash=ph.hash(secrets.token_urlsafe(32)),
        full_name="Guest Advocate",
        role=ROLE_GUEST,
    )
    db.add(guest_user)
    db.flush()

    guest_session = SessionModel(
        user_id=guest_user.id,
        case_slug=case.slug,
        level_number=case.level_number,
        status="IN_PROGRESS",
        created_at=datetime.now(UTC),
    )
    db.add(guest_session)
    db.commit()
    db.refresh(guest_user)
    db.refresh(guest_session)

    expires_in_seconds = 2 * 60 * 60
    payload = {
        "sub": str(guest_user.id),
        "role": ROLE_GUEST,
        "is_guest": True,
        "session_id": guest_session.id,
        "exp": datetime.now(UTC) + timedelta(seconds=expires_in_seconds),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": expires_in_seconds,
        "session_id": guest_session.id,
        "case_slug": guest_session.case_slug,
        "level_number": guest_session.level_number,
        "user": {
            "id": guest_user.id,
            "email": guest_user.email,
            "full_name": guest_user.full_name,
            "role": guest_user.role,
        },
    }

