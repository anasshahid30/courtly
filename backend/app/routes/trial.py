from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session as DbSession

from app.core.trial import (
    RULING_PENDING,
    SPEAKER_LEARNER,
    VALID_OBJECTION_TYPES,
    advance_stage,
)
from app.db import get_db
from app.deps import get_current_user
from app.models import Objection, Turn, User
from app.models import Session as SessionModel

router = APIRouter(prefix="/api/v1/sessions", tags=["trial"])


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class TurnCreateIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Dialogue utterance from learner")


class TurnOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    sequence_no: int
    speaker_type: str
    stage_index: int
    text: str
    created_at: datetime


class ObjectionCreateIn(BaseModel):
    turn_id: int
    objection_type: str
    grounds: str = Field(..., min_length=1, description="Grounds justifying the objection")


class ObjectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    turn_id: int
    objection_type: str
    grounds: str
    ruling: str
    reasoning: str | None = None
    created_at: datetime


class StageAdvanceOut(BaseModel):
    current_stage: int
    stage: int


# ---------------------------------------------------------------------------
# Ownership Helper
# ---------------------------------------------------------------------------

def _get_owned_session(session_id: int, user_id: int, db: DbSession) -> SessionModel:
    """
    Retrieves the session ensuring it belongs to the authenticated user.
    Returns 404 if the session does not exist or belongs to another user.
    """
    session = db.get(SessionModel, session_id)
    if not session or session.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return session


# ---------------------------------------------------------------------------
# Trial Proceeding Routes
# ---------------------------------------------------------------------------

@router.post("/{id}/turns", response_model=TurnOut, status_code=status.HTTP_201_CREATED)
def add_turn(
    id: int,
    data: TurnCreateIn,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """
    Records a learner dialogue turn at the session's current stage.
    Only permitted while the session is IN_PROGRESS.
    """
    session = _get_owned_session(id, current_user.id, db)

    if session.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot add turns to a session that is not in progress.",
        )

    # Determine sequence number for the next turn
    last_turn = (
        db.query(Turn)
        .filter(Turn.session_id == session.id)
        .order_by(Turn.sequence_no.desc())
        .first()
    )
    next_seq = (last_turn.sequence_no + 1) if last_turn else 1

    turn = Turn(
        session_id=session.id,
        sequence_no=next_seq,
        speaker_type=SPEAKER_LEARNER,
        stage_index=session.current_stage,
        text=data.text.strip(),
    )
    db.add(turn)
    db.commit()
    db.refresh(turn)

    # =========================================================================
    # AI INTEGRATION POINT (Phase 6 / Future):
    # Here is where the AI judge, opposing counsel, or witness response
    # pipeline will plug in. It will consume the updated transcript history,
    # generate appropriate counter-turns or rulings, and persist them.
    # =========================================================================

    return turn


@router.get("/{id}/turns", response_model=list[TurnOut])
def get_transcript(
    id: int,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """
    Returns the ordered courtroom trial transcript turns for the session.
    """
    session = _get_owned_session(id, current_user.id, db)

    turns = (
        db.query(Turn)
        .filter(Turn.session_id == session.id)
        .order_by(Turn.sequence_no.asc())
        .all()
    )
    return turns


@router.post("/{id}/objections", response_model=ObjectionOut, status_code=status.HTTP_201_CREATED)
def raise_objection(
    id: int,
    data: ObjectionCreateIn,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """
    Raises a formal evidentiary objection against a specific turn in this session.
    The objection ruling is created strictly as 'pending' with no automatic AI ruling.
    """
    session = _get_owned_session(id, current_user.id, db)

    # The objected turn must exist and belong to this session
    turn = db.get(Turn, data.turn_id)
    if not turn or turn.session_id != session.id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Turn id {data.turn_id} does not belong to session {session.id}.",
        )

    # Validate objection type against recognized legal evidentiary categories
    norm_type = data.objection_type.lower().strip()
    if norm_type not in VALID_OBJECTION_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid objection_type '{data.objection_type}'. Valid options: {sorted(VALID_OBJECTION_TYPES)}",
        )

    objection = Objection(
        session_id=session.id,
        turn_id=turn.id,
        objection_type=norm_type,
        grounds=data.grounds.strip(),
        ruling=RULING_PENDING,
        reasoning=None,
    )
    db.add(objection)
    db.commit()
    db.refresh(objection)

    # =========================================================================
    # AI INTEGRATION POINT (Phase 6 / Future):
    # Here is where the AI presiding judge will later evaluate the objection,
    # review the case facts and legal grounds, and render a ruling ('sustained'
    # or 'overruled') with legal reasoning.
    # =========================================================================

    return objection


@router.post("/{id}/advance", response_model=StageAdvanceOut)
def advance_session_stage(
    id: int,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """
    Advances the trial session to the next stage (0 to 5). Cannot exceed 5.
    Returns the new current_stage.
    """
    session = _get_owned_session(id, current_user.id, db)

    session.current_stage = advance_stage(session.current_stage)
    db.commit()
    db.refresh(session)

    return {
        "current_stage": session.current_stage,
        "stage": session.current_stage,
    }
