import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.roles import ROLE_GUEST
from app.core.security import ALGORITHM, SECRET_KEY
from app.db import get_db
from app.models import Session as SessionModel
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
    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid token subject")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    # Verify role claim if present, and ensure guest users always have valid guest role claim
    token_role = payload.get("role")
    if token_role is not None and user.role != token_role:
        raise HTTPException(status_code=401, detail="Invalid token role claim")
    if user.role == ROLE_GUEST and token_role != ROLE_GUEST:
        raise HTTPException(status_code=401, detail="Invalid token role claim")

    user.token_payload = payload
    user._jwt_claims = payload  # type: ignore[attr-defined]
    return user


def get_verified_session(
    session_id: int,
    current_user: User,
    db: Session,
) -> SessionModel:
    """
    Retrieves the session ensuring:
    1. For guest users (ROLE_GUEST), the token must have a valid 'session_id' claim
       matching the requested session_id. Missing, malformed, or mismatched session_id
       claims raise HTTP 404 to avoid leaking session existence.
    2. The session must exist in the database and belong to the authenticated user.
       Raises HTTP 404 if not found or owned by another user.
    """
    if current_user.role == ROLE_GUEST:
        payload = getattr(current_user, "token_payload", None)
        if not payload or "session_id" not in payload:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        bound_session_id = payload.get("session_id")
        if isinstance(bound_session_id, bool) or bound_session_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        try:
            parsed_bound_id = int(bound_session_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        if parsed_bound_id != session_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )

    session = db.get(SessionModel, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return session


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

