from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session as DbSession

from app.core.levels import FINAL_LEVEL, certificate_eligible, initialize_user_progress
from app.core.scoring import (
    REQUIRED_CRITERIA,
    is_session_passed,
)
from app.db import get_db
from app.deps import get_current_user
from app.models import Appeal, Case, LevelProgress, SessionScore, User
from app.models import Session as SessionModel

router = APIRouter(prefix="/api/v1", tags=["sessions"])


class CreateSessionIn(BaseModel):
    case_slug: str


class CriterionScoreIn(BaseModel):
    criterion_code: str
    score: float
    explanation: str = ""


class CriterionReportItem(BaseModel):
    criterion_code: str
    score: float
    explanation: str


class SessionReportOut(BaseModel):
    case_slug: str
    level: int
    level_number: int
    criterion_scores: list[CriterionReportItem]
    overall_score: float
    passed: bool


class LevelProgressItem(BaseModel):
    level_number: int
    level: int
    status: str
    best_score: float | None = None
    attempts: int


class OverallProgress(BaseModel):
    levels_passed: int
    certificate_eligible: bool


class UserProgressOut(BaseModel):
    levels: list[LevelProgressItem]
    overall: OverallProgress


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
def create_session(
    data: CreateSessionIn,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Creates a new proceeding session for the authenticated user and marks the level IN_PROGRESS.
    The level must be UNLOCKED or IN_PROGRESS, otherwise returns 403.
    """
    # Find the case
    case = (
        db.query(Case)
        .filter(
            (Case.slug == data.case_slug)
            | (Case.slug == data.case_slug.replace("-", "_"))
            | (Case.slug == data.case_slug.replace("_", "-"))
        )
        .first()
    )
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with slug '{data.case_slug}' not found",
        )

    # Ensure level is between 1 and 5
    if case.level_number < 1 or case.level_number > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Simulation case level must be between 1 and 5",
        )

    # Initialize user's progress if missing
    initialize_user_progress(db, current_user.id)

    # Check the user's progress for this level
    progress = (
        db.query(LevelProgress)
        .filter(
            LevelProgress.user_id == current_user.id,
            LevelProgress.level_number == case.level_number,
        )
        .first()
    )

    if not progress:
        progress = LevelProgress(
            user_id=current_user.id,
            level_number=case.level_number,
            status="NOT_STARTED",
            attempts=0,
            best_score=None,
        )
        db.add(progress)

    # Starting a session sets that level to IN_PROGRESS unless it is already PASSED
    if progress.status != "PASSED":
        progress.status = "IN_PROGRESS"
        db.add(progress)

    # Create new session
    session = SessionModel(
        user_id=current_user.id,
        case_slug=case.slug,
        level_number=case.level_number,
        status="IN_PROGRESS",
        created_at=datetime.now(UTC),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "user_id": session.user_id,
        "case_slug": session.case_slug,
        "level_number": session.level_number,
        "status": session.status,
        "created_at": session.created_at.isoformat() if session.created_at else None,
    }


@router.get("/sessions/{id}")
def get_session(
    id: int,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Returns session details. Only the session owner can view it; others get 404.
    """
    session = db.get(SessionModel, id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    scores = db.query(SessionScore).filter(SessionScore.session_id == session.id).all()

    return {
        "id": session.id,
        "user_id": session.user_id,
        "case_slug": session.case_slug,
        "level_number": session.level_number,
        "status": session.status,
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "scores": [
            {
                "id": s.id,
                "criterion_code": s.criterion_code,
                "score": s.score,
                "explanation": s.explanation,
            }
            for s in scores
        ],
    }


@router.post("/sessions/{id}/complete")
def complete_session(
    id: int,
    body: Any = Body(...),
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Completes a session and records the 8 criterion scores.
    The 8 codes must be exactly:
    anticipating_counter_moves, knowing_when_not_to_fight, radical_clarity,
    commercial_acumen, unshakable_credibility, empathy_self_control,
    fact_nuance, evidence_handling. Missing or extra codes return 422.
    """
    session = db.get(SessionModel, id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status == "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session already completed",
        )

    # Parse body (accepts direct list or {"scores": [...]})
    if isinstance(body, dict) and "scores" in body:
        items = body["scores"]
    elif isinstance(body, list):
        items = body
    else:
        raise HTTPException(
            status_code=422,
            detail="Body must be a list of criterion scores or an object with 'scores'",
        )

    scores_list: list[CriterionScoreIn] = []
    for item in items:
        if isinstance(item, dict):
            try:
                scores_list.append(CriterionScoreIn(**item))
            except (TypeError, ValueError) as e:
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid score item: {e}",
                )
        elif isinstance(item, CriterionScoreIn):
            scores_list.append(item)
        else:
            raise HTTPException(
                status_code=422,
                detail="Invalid score item type",
            )

    # Validate the 8 codes: exact match, no missing, no extra, no duplicates
    provided_codes = [s.criterion_code for s in scores_list]
    if len(provided_codes) != len(REQUIRED_CRITERIA) or set(provided_codes) != REQUIRED_CRITERIA:
        raise HTTPException(
            status_code=422,
            detail=(
                "Must provide exactly the 8 required criterion codes without duplicates or extras: "
                f"{sorted(REQUIRED_CRITERIA)}"
            ),
        )

    # Validate score range (0 to 100)
    for s in scores_list:
        if s.score < 0.0 or s.score > 100.0:
            raise HTTPException(
                status_code=422,
                detail=f"Score for {s.criterion_code} must be between 0 and 100 (got {s.score})",
            )

    # Calculate scoring and pass/fail evaluation
    scores_dict = {s.criterion_code: float(s.score) for s in scores_list}
    passed, overall = is_session_passed(scores_dict)

    # Store criterion scores
    for s in scores_list:
        score_record = SessionScore(
            session_id=session.id,
            criterion_code=s.criterion_code,
            score=float(s.score),
            explanation=s.explanation or "",
        )
        db.add(score_record)

    # Mark session COMPLETED
    session.status = "COMPLETED"
    db.add(session)

    # Update LevelProgress
    lp = (
        db.query(LevelProgress)
        .filter(
            LevelProgress.user_id == current_user.id,
            LevelProgress.level_number == session.level_number,
        )
        .first()
    )
    if not lp:
        lp = LevelProgress(
            user_id=current_user.id,
            level_number=session.level_number,
            status="IN_PROGRESS",
            attempts=0,
            best_score=None,
        )
        db.add(lp)

    lp.attempts += 1
    if lp.best_score is None or overall > lp.best_score:
        lp.best_score = overall

    if passed:
        lp.status = "PASSED"
    else:
        # If not passed, keep the level IN_PROGRESS so user can retry
        if lp.status != "PASSED":
            lp.status = "IN_PROGRESS"

    db.commit()

    return {
        "session_id": session.id,
        "status": session.status,
        "overall_score": overall,
        "passed": passed,
        "level_number": session.level_number,
    }


@router.get("/sessions/{id}/report", response_model=SessionReportOut)
def get_session_report(
    id: int,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """
    Returns the comprehensive assessment report for a completed session.
    Only the session owner can view it; others get 404.
    If the session is not COMPLETED, returns 409 Conflict.
    """
    session = db.get(SessionModel, id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session report is only available for COMPLETED sessions.",
        )

    scores = db.query(SessionScore).filter(SessionScore.session_id == session.id).all()
    scores_dict = {s.criterion_code: s.score for s in scores}
    passed, overall = is_session_passed(scores_dict)

    return {
        "case_slug": session.case_slug,
        "level": session.level_number,
        "level_number": session.level_number,
        "criterion_scores": [
            {
                "criterion_code": s.criterion_code,
                "score": s.score,
                "explanation": s.explanation,
            }
            for s in scores
        ],
        "overall_score": overall,
        "passed": passed,
    }


@router.get("/me/progress", response_model=UserProgressOut)
def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """
    Returns the user's progress across all 5 levels with status, best score,
    and attempts, plus an overall block with levels passed count and certificate eligibility.
    """
    progress_rows = initialize_user_progress(db, current_user.id)
    progress_by_level = {p.level_number: p for p in progress_rows}

    level_items = []
    passed_levels = []
    best_scores = []

    for level_num in range(1, FINAL_LEVEL + 1):
        p = progress_by_level.get(level_num)
        status_val = p.status if p else "NOT_STARTED"
        best_score_val = p.best_score if p else None
        attempts_val = p.attempts if p else 0

        if status_val == "PASSED":
            passed_levels.append(level_num)
            if best_score_val is not None:
                best_scores.append(best_score_val)

        level_items.append(
            {
                "level_number": level_num,
                "level": level_num,
                "status": status_val,
                "best_score": best_score_val,
                "attempts": attempts_val,
            }
        )

    eligible = certificate_eligible(passed_levels, best_scores)

    return {
        "levels": level_items,
        "overall": {
            "levels_passed": len(passed_levels),
            "certificate_eligible": eligible,
        },
    }


class AppealCreateIn(BaseModel):
    reason: str = Field(..., min_length=1, max_length=1000, description="Reason justifying the appeal")


class AppealOut(BaseModel):
    id: int
    session_id: int
    user_id: int
    reason: str
    status: str
    resolution_note: str | None = None
    created_at: datetime
    resolved_at: datetime | None = None


@router.post("/sessions/{id}/appeal", response_model=AppealOut, status_code=status.HTTP_201_CREATED)
def create_session_appeal(
    id: int,
    data: AppealCreateIn,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """
    Creates an open appeal for a completed session.
    Only the session owner can appeal. Only for COMPLETED sessions.
    Only one open appeal per session; a second open appeal returns 409 Conflict.
    """
    session = db.get(SessionModel, id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Appeals are only permitted for COMPLETED sessions.",
        )

    # Check for existing open appeal on this session
    existing_open = (
        db.query(Appeal)
        .filter(Appeal.session_id == session.id, Appeal.status == "open")
        .first()
    )
    if existing_open:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An open appeal already exists for this session.",
        )

    appeal = Appeal(
        session_id=session.id,
        user_id=current_user.id,
        reason=data.reason.strip(),
        status="open",
        resolution_note=None,
        resolved_at=None,
    )
    db.add(appeal)
    db.commit()
    db.refresh(appeal)

    return appeal


