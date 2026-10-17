from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core.roles import ROLE_ADMIN, ROLE_EDUCATOR
from app.db import get_db
from app.deps import require_role
from app.models import Appeal, User

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


class AppealAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    user_id: int
    reason: str
    status: str
    resolution_note: str | None = None
    created_at: datetime
    resolved_at: datetime | None = None


class ResolveAppealIn(BaseModel):
    decision: str = Field(..., description="Decision: 'upheld' or 'rejected'")
    resolution_note: str | None = Field(None, description="Explanation or note for the resolution")


@router.get("/dashboard")
def admin_dashboard(current_admin: User = Depends(require_role(ROLE_ADMIN))):
    return {
        "status": "ok",
        "message": "Welcome to Admin Dashboard",
        "admin_email": current_admin.email,
        "role": current_admin.role,
    }


@router.get("/appeals", response_model=list[AppealAdminOut])
def list_open_appeals(
    current_user: User = Depends(require_role(ROLE_EDUCATOR, ROLE_ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Lists all open appeals awaiting human review.
    Accessible to educators and administrators.
    """
    return (
        db.query(Appeal)
        .filter(Appeal.status == "open")
        .order_by(Appeal.created_at.asc())
        .all()
    )


@router.post("/appeals/{id}/resolve", response_model=AppealAdminOut)
def resolve_appeal(
    id: int,
    data: ResolveAppealIn,
    current_admin: User = Depends(require_role(ROLE_ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Resolves an appeal with a decision ('upheld' or 'rejected') and sets resolved_at.
    Authorized strictly for administrators.
    """
    decision = data.decision.lower().strip()
    if decision not in ("upheld", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Decision must be either 'upheld' or 'rejected'.",
        )

    appeal = db.get(Appeal, id)
    if not appeal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appeal not found",
        )

    appeal.status = decision
    appeal.resolution_note = data.resolution_note.strip() if data.resolution_note else None
    appeal.resolved_at = datetime.now(UTC)
    db.commit()
    db.refresh(appeal)

    return appeal
