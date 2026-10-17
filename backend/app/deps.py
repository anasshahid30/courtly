import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import ALGORITHM, SECRET_KEY
from app.db import get_db
from app.models import User

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.get(User, int(payload["sub"]))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_role(*roles: str):
    """
    FastAPI dependency factory enforcing that the authenticated user
    possesses at least one of the specified roles. Raises HTTP 403 otherwise.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden: user role '{current_user.role}' does not have sufficient permissions.",
            )
        return current_user

    return role_checker

