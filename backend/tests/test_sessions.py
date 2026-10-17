import uuid
from datetime import UTC

import pytest
from fastapi.testclient import TestClient

from app.core.scoring import (
    REQUIRED_CRITERIA,
    is_session_passed,
)
from app.db import SessionLocal
from app.main import app
from app.models import Case
from app.seed import seed

client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_db_seeded():
    """Ensure database has levels and cases seeded."""
    seed()


def register_and_login(prefix: str = "advocate", password: str = "StrongPassword123!") -> str:
    """Helper to register and login a user with an isolated unique email, returning access token."""
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@courtly.legal"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Advocate User"},
    )
    assert reg_res.status_code == 201
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    return login_res.json()["access_token"]


def make_scores_payload(score_val: float) -> list:
    """Generates valid 8-criteria payload with uniform scores."""
    return [
        {
            "criterion_code": code,
            "score": score_val,
            "explanation": f"Evaluation for {code}",
        }
        for code in sorted(REQUIRED_CRITERIA)
    ]


# ------------------------------------------------------------
# Core Scoring Unit Tests
# ------------------------------------------------------------

def test_scoring_overall_84_9_fails():
    """Overall 84.9 does not pass."""
    scores = {code: 84.9 for code in REQUIRED_CRITERIA}
    passed, overall = is_session_passed(scores)
    assert overall == 84.9
    assert passed is False


def test_scoring_overall_85_0_with_no_criterion_below_40_passes():
    """Overall 85.0 passes when no criterion is below 40."""
    scores = {code: 85.0 for code in REQUIRED_CRITERIA}
    passed, overall = is_session_passed(scores)
    assert overall == 85.0
    assert passed is True


def test_scoring_one_criterion_at_39_fails_even_when_overall_is_90():
    """A criterion at 39 fails even with overall 90."""
    # 7 criteria at 95 (weights sum to 92: 92 * 95 = 8740)
    # 1 criterion (empathy_self_control, weight 8) at 39: 8 * 39 = 312
    # Total = (8740 + 312) / 100 = 90.52
    scores = {code: 95.0 for code in REQUIRED_CRITERIA}
    scores["empathy_self_control"] = 39.0

    passed, overall = is_session_passed(scores)
    assert overall >= 90.0
    assert passed is False, "Session with a criterion score at 39 must fail"


# ------------------------------------------------------------
# Sessions API & Lifecycle Tests
# ------------------------------------------------------------

def test_user_registration_initializes_five_levels_not_started():
    """When a user registers, five LevelProgress rows are created, all NOT_STARTED."""
    token = register_and_login("init_progress")
    res = client.get("/api/v1/levels", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    levels = res.json()
    assert len(levels) == 5
    for lvl in levels:
        assert lvl["status"] == "NOT_STARTED"
        assert lvl["best_score"] is None
        assert lvl["attempts"] == 0


def test_existing_user_without_rows_initializes_on_levels_route():
    """For existing users who have missing rows, create them the first time levels route is called."""
    from datetime import datetime, timedelta

    import jwt
    from argon2 import PasswordHasher

    from app.core.security import ALGORITHM, SECRET_KEY
    from app.models import User

    ph = PasswordHasher()
    db = SessionLocal()
    unique_email = f"direct_db_{uuid.uuid4().hex[:8]}@courtly.legal"
    existing_user = User(
        email=unique_email,
        password_hash=ph.hash("Password123!"),
        full_name="Direct DB User",
    )
    db.add(existing_user)
    db.commit()
    db.refresh(existing_user)
    user_id = existing_user.id
    db.close()

    # Generate token directly
    payload = {"sub": str(user_id), "exp": datetime.now(UTC) + timedelta(minutes=15)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # Call /api/v1/levels
    res = client.get("/api/v1/levels", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    levels = res.json()
    assert len(levels) == 5
    for lvl in levels:
        assert lvl["status"] == "NOT_STARTED"


def test_user_can_start_level_3_before_completing_levels_1_and_2():
    """A user can start Level 3 before completing Levels 1 and 2 (no level locking)."""
    # Seed a case for level 3 if not present
    db = SessionLocal()
    case_l3 = db.query(Case).filter(Case.slug == "level3_direct_case").first()
    if not case_l3:
        case_l3 = Case(
            slug="level3_direct_case",
            title="Level 3 Direct Case",
            jurisdiction="Demo jurisdiction",
            domain_slug="contract",
            level_number=3,
            case_json="{}",
        )
        db.add(case_l3)
        db.commit()
    db.close()

    # Brand new user with levels 1 and 2 NOT_STARTED
    token = register_and_login("direct_level3_user")
    headers = {"Authorization": f"Bearer {token}"}

    # Start session on Level 3 immediately
    res_sess = client.post(
        "/api/v1/sessions",
        json={"case_slug": "level3_direct_case"},
        headers=headers,
    )
    assert res_sess.status_code == 201
    assert res_sess.json()["level_number"] == 3
    assert res_sess.json()["status"] == "IN_PROGRESS"

    # Level 3 is now IN_PROGRESS, while Levels 1 and 2 remain NOT_STARTED
    res_levels = client.get("/api/v1/levels", headers=headers)
    levels = res_levels.json()
    assert levels[0]["status"] == "NOT_STARTED"  # Level 1
    assert levels[1]["status"] == "NOT_STARTED"  # Level 2
    assert levels[2]["status"] == "IN_PROGRESS"  # Level 3


def test_session_lifecycle_and_score_updates():
    """
    Tests:
    - POST /api/v1/sessions marks level IN_PROGRESS
    - Failing session keeps level IN_PROGRESS, updates attempts and best_score
    - Passing session sets level to PASSED, updates attempts and best_score
    """
    token = register_and_login("advocate_lifecycle")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start session on Level 1
    res_sess = client.post(
        "/api/v1/sessions",
        json={"case_slug": "contract_breach_demo"},
        headers=headers,
    )
    assert res_sess.status_code == 201
    session_id = res_sess.json()["id"]

    # Level 1 is IN_PROGRESS
    res_levels1 = client.get("/api/v1/levels", headers=headers)
    assert res_levels1.json()[0]["status"] == "IN_PROGRESS"

    # 2. Complete session with 84.9 (fails)
    fail_scores = make_scores_payload(84.9)
    res_fail = client.post(
        f"/api/v1/sessions/{session_id}/complete",
        json=fail_scores,
        headers=headers,
    )
    assert res_fail.status_code == 200
    assert res_fail.json()["passed"] is False

    # Level 1 remains IN_PROGRESS, attempts = 1, best_score = 84.9
    res_levels2 = client.get("/api/v1/levels", headers=headers)
    lvl1 = res_levels2.json()[0]
    assert lvl1["status"] == "IN_PROGRESS"
    assert lvl1["attempts"] == 1
    assert lvl1["best_score"] == 84.9

    # 3. Retry session and complete with 88.0 (passes)
    res_retry = client.post(
        "/api/v1/sessions",
        json={"case_slug": "contract_breach_demo"},
        headers=headers,
    )
    retry_id = res_retry.json()["id"]

    pass_scores = make_scores_payload(88.0)
    res_pass = client.post(
        f"/api/v1/sessions/{retry_id}/complete",
        json=pass_scores,
        headers=headers,
    )
    assert res_pass.status_code == 200
    assert res_pass.json()["passed"] is True

    # Level 1 is now PASSED, attempts = 2, best_score = 88.0
    res_levels3 = client.get("/api/v1/levels", headers=headers)
    lvl1_updated = res_levels3.json()[0]
    assert lvl1_updated["status"] == "PASSED"
    assert lvl1_updated["attempts"] == 2
    assert lvl1_updated["best_score"] == 88.0


def test_user_cannot_read_another_users_session():
    """A user cannot read another user's session (returns 404)."""
    token_owner = register_and_login("owner")
    token_stranger = register_and_login("stranger")

    # Owner creates session
    res = client.post(
        "/api/v1/sessions",
        json={"case_slug": "contract_breach_demo"},
        headers={"Authorization": f"Bearer {token_owner}"},
    )
    assert res.status_code == 201
    session_id = res.json()["id"]

    # Owner can read it
    res_owner_read = client.get(
        f"/api/v1/sessions/{session_id}",
        headers={"Authorization": f"Bearer {token_owner}"},
    )
    assert res_owner_read.status_code == 200
    assert res_owner_read.json()["id"] == session_id

    # Stranger tries to read it -> 404
    res_stranger_read = client.get(
        f"/api/v1/sessions/{session_id}",
        headers={"Authorization": f"Bearer {token_stranger}"},
    )
    assert res_stranger_read.status_code == 404, "Other user's session must return 404"


def test_complete_session_criterion_validation():
    """Missing or extra criterion codes return 422."""
    token = register_and_login("validation_user")
    headers = {"Authorization": f"Bearer {token}"}

    res_sess = client.post(
        "/api/v1/sessions",
        json={"case_slug": "contract_breach_demo"},
        headers=headers,
    )
    session_id = res_sess.json()["id"]

    # Missing criterion (7 instead of 8)
    incomplete_scores = [
        {"criterion_code": "anticipating_counter_moves", "score": 85.0, "explanation": "test"}
    ]
    res_missing = client.post(
        f"/api/v1/sessions/{session_id}/complete",
        json=incomplete_scores,
        headers=headers,
    )
    assert res_missing.status_code == 422

    # Extra unknown criterion
    extra_scores = make_scores_payload(85.0)
    extra_scores.append({"criterion_code": "unknown_extra_code", "score": 85.0, "explanation": "bad"})
    res_extra = client.post(
        f"/api/v1/sessions/{session_id}/complete",
        json=extra_scores,
        headers=headers,
    )
    assert res_extra.status_code == 422
