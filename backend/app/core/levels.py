from collections.abc import Iterable

PASS_THRESHOLD = 85
CERTIFICATE_THRESHOLD = 90
FINAL_LEVEL = 5


def level_passed(score: float | None) -> bool:
    """
    Check if a given score passes a level threshold (>= 85).
    """
    if score is None:
        return False
    return score >= PASS_THRESHOLD


def certificate_eligible(
    passed_levels: Iterable[int] | None,
    best_scores: list[float | int] | None,
) -> bool:
    """
    Returns True only if {1, 2, 3, 4, 5} is a subset of the passed set
    AND the average of the best scores is at least 90.
    """
    if not passed_levels or not best_scores:
        return False

    required_levels = {1, 2, 3, 4, 5}
    if not required_levels.issubset(set(passed_levels)):
        return False

    if len(best_scores) == 0:
        return False

    average_score = sum(best_scores) / len(best_scores)
    return average_score >= CERTIFICATE_THRESHOLD


def initialize_user_progress(db, user_id: int):
    """
    Initializes LevelProgress rows for a user (levels 1 to 5, status NOT_STARTED).
    For existing users with missing rows, creates the missing rows.
    """
    from app.models import LevelProgress

    existing = (
        db.query(LevelProgress)
        .filter(LevelProgress.user_id == user_id)
        .order_by(LevelProgress.level_number.asc())
        .all()
    )
    existing_levels = {p.level_number for p in existing}

    created_any = False
    progress_rows = list(existing)
    for level_num in range(1, FINAL_LEVEL + 1):
        if level_num not in existing_levels:
            progress = LevelProgress(
                user_id=user_id,
                level_number=level_num,
                status="NOT_STARTED",
                best_score=None,
                attempts=0,
            )
            db.add(progress)
            progress_rows.append(progress)
            created_any = True

    if created_any:
        db.commit()
        for p in progress_rows:
            db.refresh(p)

    return sorted(progress_rows, key=lambda p: p.level_number)
