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
from app.core.security import ALGORITHM, SECRET_KEY
from app.db import get_db
from app.deps import get_current_user
from app.models import User

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

