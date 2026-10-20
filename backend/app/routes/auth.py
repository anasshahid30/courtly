from datetime import UTC, datetime, timedelta
import secrets

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session

from app.core.rate_limit import (
    check_guest_rate_limit,
    check_login_rate_limit,
    record_failed_login,
    record_guest_creation,
    reset_failed_logins,
)
from app.core.roles import ROLE_GUEST
from app.core.security import ALGORITHM, SECRET_KEY
from app.db import get_db
from app.deps import get_current_user
from app.models import Case, Session as SessionModel, User

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


FOUNDATION_CASE_SLUG = "contract_breach_demo"


class GuestAuthIn(BaseModel):
    case_slug: str = FOUNDATION_CASE_SLUG


class GuestUserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str


class GuestAuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    guest_id: int
    guest_user: GuestUserOut
    session_id: int
    case_slug: str
    level_number: int
    level: int
    status: str
    current_stage: int


@router.post("/guest", response_model=GuestAuthOut, status_code=status.HTTP_201_CREATED)
def create_guest_auth(
    data: GuestAuthIn,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Creates an ephemeral guest user and initializes a single Foundation-level courtroom session.
    Strictly restricted to the existing 'contract_breach_demo' case.
    Issues a short-lived 2-hour JWT bound to this guest user and session.
    """
    client_ip = request.client.host if request.client else "unknown"
    check_guest_rate_limit(client_ip)

    # 1. Enforce Foundation demo only
    if data.case_slug != FOUNDATION_CASE_SLUG:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Guest access is strictly restricted to the Foundation case '{FOUNDATION_CASE_SLUG}'.",
        )

    # 2. Verify case exists in database
    case = db.query(Case).filter(Case.slug == FOUNDATION_CASE_SLUG).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Foundation case '{FOUNDATION_CASE_SLUG}' not found in database.",
        )

    # 3. Generate unique guest credentials with secure random identifier
    guest_hex = secrets.token_hex(12)
    guest_email = f"guest_{guest_hex}@guest.courtly.internal"
    guest_password = secrets.token_urlsafe(32)

    guest_user = User(
        email=guest_email,
        password_hash=ph.hash(guest_password),
        full_name="Guest Advocate",
        role=ROLE_GUEST,
    )
    db.add(guest_user)
    db.commit()
    db.refresh(guest_user)

    # 4. Create the demo session for this guest
    session = SessionModel(
        user_id=guest_user.id,
        case_slug=case.slug,
        level_number=case.level_number,
        status="IN_PROGRESS",
        current_stage=0,
        created_at=datetime.now(UTC),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Record rate limit attempt
    record_guest_creation(client_ip)

    # 5. Issue 2-hour JWT (7200 seconds)
    expires_in_seconds = 7200
    payload = {
        "sub": str(guest_user.id),
        "role": ROLE_GUEST,
        "session_id": session.id,
        "case_slug": session.case_slug,
        "exp": datetime.now(UTC) + timedelta(seconds=expires_in_seconds),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": expires_in_seconds,
        "guest_id": guest_user.id,
        "guest_user": {
            "id": guest_user.id,
            "email": guest_user.email,
            "full_name": guest_user.full_name,
            "role": guest_user.role,
        },
        "session_id": session.id,
        "case_slug": session.case_slug,
        "level_number": session.level_number,
        "level": session.level_number,
        "status": session.status,
        "current_stage": session.current_stage,
    }


