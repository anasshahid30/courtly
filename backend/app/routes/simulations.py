import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.levels import initialize_user_progress
from app.db import get_db
from app.deps import get_current_user
from app.models import Case, Level, User

router = APIRouter(prefix="/api/v1", tags=["simulations"])


def _find_case_by_slug(db: Session, slug: str) -> Case:
    case = (
        db.query(Case)
        .filter(
            (Case.slug == slug)
            | (Case.slug == slug.replace("-", "_"))
            | (Case.slug == slug.replace("_", "-"))
        )
        .first()
    )
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with slug '{slug}' not found",
        )
    return case


@router.get("/simulations")
def list_simulations(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    """
    Public endpoint: List all available case simulations.
    Returns id, slug, title, domain_slug, and level_number for each case.
    """
    cases = db.query(Case).order_by(Case.id.asc()).all()
    return [
        {
            "id": c.id,
            "slug": c.slug,
            "title": c.title,
            "domain_slug": c.domain_slug,
            "level_number": c.level_number,
        }
        for c in cases
    ]


@router.get("/simulations/{slug}")
def get_simulation_summary(slug: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Public endpoint: Returns summary information for a single simulation case.
    """
    case = _find_case_by_slug(db, slug)

    summary_data: dict[str, Any] = {
        "id": case.id,
        "slug": case.slug,
        "title": case.title,
        "jurisdiction": case.jurisdiction,
        "domain_slug": case.domain_slug,
        "level_number": case.level_number,
    }

    try:
        raw_json = json.loads(case.case_json)
        if isinstance(raw_json, dict):
            if "parties" in raw_json:
                summary_data["parties"] = raw_json["parties"]
            if "legal_issues" in raw_json:
                summary_data["legal_issues"] = raw_json["legal_issues"]
            if "agreed_facts" in raw_json:
                summary_data["agreed_facts"] = raw_json["agreed_facts"]
            if "summary" in raw_json:
                summary_data["summary"] = raw_json["summary"]
    except (json.JSONDecodeError, TypeError):
        pass

    return summary_data


@router.get("/simulations/{slug}/case-file")
def get_simulation_case_file(slug: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Public endpoint: Returns the full case JSON file.
    """
    case = _find_case_by_slug(db, slug)
    try:
        return json.loads(case.case_json)
    except (json.JSONDecodeError, TypeError):
        return {"raw_content": case.case_json}


@router.get("/levels")
def get_levels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """
    Protected endpoint: Returns the five advocacy levels with the current user's
    status (NOT_STARTED, IN_PROGRESS, or PASSED), best_score, and attempts.
    Requires a valid bearer token.
    For existing users who have missing rows, creates them on the first call.
    """

    progress_rows = initialize_user_progress(db, current_user.id)
    progress_by_level = {p.level_number: p for p in progress_rows}

    levels = db.query(Level).filter(Level.number <= 5).order_by(Level.number.asc()).all()

    results = []
    for lvl in levels:
        lp = progress_by_level.get(lvl.number)
        status_val = lp.status if lp else "NOT_STARTED"
        best_score = lp.best_score if lp else None
        attempts = lp.attempts if lp else 0

        results.append(
            {
                "id": lvl.id,
                "number": lvl.number,
                "title": lvl.title,
                "pass_threshold": lvl.pass_threshold,
                "certificate_threshold": lvl.certificate_threshold,
                "status": status_val,
                "best_score": best_score,
                "attempts": attempts,
            }
        )

    return results
