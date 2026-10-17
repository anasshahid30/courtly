import secrets
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.levels import (
    CERTIFICATE_THRESHOLD,
    FINAL_LEVEL,
)
from app.db import get_db
from app.deps import get_current_user
from app.models import Certificate, LevelProgress, User

router = APIRouter(prefix="/api/v1/certificates", tags=["certificates"])


@router.post("/claim")
def claim_certificate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Authenticated endpoint: Issues a certificate if all 5 levels are PASSED and the
    average of the user's five best scores is at least 90.
    Returns the existing certificate if the user already has one.
    If any level is not PASSED, returns 403 listing the levels that are not yet passed.
    If all five are PASSED but the average is below 90, returns 403 with the actual average and the required 90.
    """
    # 1. Return existing certificate if already claimed
    existing_cert = (
        db.query(Certificate)
        .filter(Certificate.user_id == current_user.id)
        .first()
    )
    if existing_cert:
        return {
            "id": existing_cert.id,
            "user_id": existing_cert.user_id,
            "score": existing_cert.score,
            "verification_code": existing_cert.verification_code,
            "issued_at": existing_cert.issued_at.isoformat() if existing_cert.issued_at else None,
        }

    # 2. Fetch user's level progress for levels 1 to 5
    progress_rows = (
        db.query(LevelProgress)
        .filter(LevelProgress.user_id == current_user.id, LevelProgress.level_number <= FINAL_LEVEL)
        .all()
    )
    progress_by_level = {p.level_number: p for p in progress_rows}

    # Check which levels are not passed
    not_passed_levels = [
        lvl for lvl in range(1, FINAL_LEVEL + 1)
        if not (progress_by_level.get(lvl) and progress_by_level[lvl].status == "PASSED")
    ]
    if not_passed_levels:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"The following levels are not yet passed: {not_passed_levels}",
        )

    # All five levels are passed; calculate average of the five best_score values
    best_scores = [progress_by_level[lvl].best_score or 0.0 for lvl in range(1, FINAL_LEVEL + 1)]
    average_score = round(sum(best_scores) / len(best_scores), 1)

    if average_score < CERTIFICATE_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Average score is {average_score}, which is below the required {CERTIFICATE_THRESHOLD}",
        )

    # 3. Generate unique 16-character verification code using secrets module
    while True:
        code = secrets.token_hex(8).upper()
        if not db.query(Certificate).filter(Certificate.verification_code == code).first():
            break

    certificate = Certificate(
        user_id=current_user.id,
        score=average_score,
        verification_code=code,
        issued_at=datetime.now(UTC),
    )
    db.add(certificate)
    db.commit()
    db.refresh(certificate)

    return {
        "id": certificate.id,
        "user_id": certificate.user_id,
        "score": certificate.score,
        "verification_code": certificate.verification_code,
        "issued_at": certificate.issued_at.isoformat() if certificate.issued_at else None,
    }


@router.get("/{verification_code}")
def get_certificate_by_code(
    verification_code: str,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Public endpoint: Validates and returns certificate details by verification code.
    Returns 404 if verification code is not found.
    """
    cert = (
        db.query(Certificate)
        .filter(Certificate.verification_code == verification_code)
        .first()
    )
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Certificate with verification code '{verification_code}' not found",
        )

    user = db.get(User, cert.user_id)

    return {
        "id": cert.id,
        "user_id": cert.user_id,
        "recipient_name": user.full_name if user else "Verified Advocate",
        "recipient_email": user.email if user else "",
        "score": cert.score,
        "verification_code": cert.verification_code,
        "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
    }
