import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.levels import initialize_user_progress
from app.db import SessionLocal
from app.main import app
from app.models import LevelProgress
from app.seed import seed

client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_db_seeded():
    """Ensure database has levels and cases seeded."""
    seed()


def register_and_login(prefix: str = "cert_user", password: str = "StrongPassword123!") -> tuple[str, int]:
    """Helper to register and login a user, returning (token, user_id)."""
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@courtly.legal"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Senior Advocate"},
    )
    assert reg_res.status_code == 201
    user_id = reg_res.json()["id"]

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return token, user_id


def set_user_levels_progress(user_id: int, level_scores: dict[int, tuple[str, float | None]]):
    """
    Configures LevelProgress records for testing.
    level_scores maps level_number -> (status, best_score)
    """
    db = SessionLocal()
    initialize_user_progress(db, user_id)
    progress_rows = db.query(LevelProgress).filter(LevelProgress.user_id == user_id, LevelProgress.level_number <= 5).all()

    for p in progress_rows:
        if p.level_number in level_scores:
            status_val, best_score_val = level_scores[p.level_number]
            p.status = status_val
            p.best_score = best_score_val
            p.attempts = 1 if best_score_val is not None else 0
            db.add(p)

    db.commit()
    db.close()


# ------------------------------------------------------------
# Certificate Tests (Phase 2A)
# ------------------------------------------------------------

def test_no_certificate_while_any_level_is_not_passed():
    """No certificate while any level is not PASSED (returns 403 listing unpassed levels)."""
    token, user_id = register_and_login("unpassed_levels")
    # Levels 1 to 4 are PASSED with high scores, but Level 5 is NOT_STARTED
    set_user_levels_progress(
        user_id,
        {
            1: ("PASSED", 95.0),
            2: ("PASSED", 95.0),
            3: ("PASSED", 95.0),
            4: ("PASSED", 95.0),
            5: ("NOT_STARTED", None),
        },
    )

    res = client.post(
        "/api/v1/certificates/claim",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403
    assert "not yet passed: [5]" in res.json()["detail"]


def test_no_certificate_when_all_five_are_passed_but_average_is_89_9():
    """No certificate when all five are PASSED but the average is 89.9 (returns 403)."""
    token, user_id = register_and_login("avg_89_9")
    # 5 levels passed with scores averaging exactly 89.9: (90 + 90 + 90 + 90 + 89.5) / 5 = 89.9
    set_user_levels_progress(
        user_id,
        {
            1: ("PASSED", 90.0),
            2: ("PASSED", 90.0),
            3: ("PASSED", 90.0),
            4: ("PASSED", 90.0),
            5: ("PASSED", 89.5),
        },
    )

    res = client.post(
        "/api/v1/certificates/claim",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403
    detail = res.json()["detail"]
    assert "Average score is 89.9" in detail
    assert "90" in detail


def test_certificate_is_issued_when_all_five_are_passed_and_average_is_90_0():
    """A certificate is issued when all five are PASSED and the average is 90.0."""
    token, user_id = register_and_login("avg_90_0")
    # 5 levels passed with scores averaging exactly 90.0: (90 + 90 + 90 + 90 + 90) / 5 = 90.0
    set_user_levels_progress(
        user_id,
        {
            1: ("PASSED", 90.0),
            2: ("PASSED", 90.0),
            3: ("PASSED", 90.0),
            4: ("PASSED", 90.0),
            5: ("PASSED", 90.0),
        },
    )

    res = client.post(
        "/api/v1/certificates/claim",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "verification_code" in data
    assert len(data["verification_code"]) == 16
    assert data["score"] == 90.0
    assert data["user_id"] == user_id
    assert "level_number" not in data, "Certificate covers all five levels so level_number should not be present"


def test_claiming_twice_returns_the_same_certificate():
    """Claiming twice returns the same certificate."""
    token, user_id = register_and_login("claim_twice")
    set_user_levels_progress(
        user_id,
        {
            1: ("PASSED", 92.0),
            2: ("PASSED", 91.0),
            3: ("PASSED", 93.0),
            4: ("PASSED", 90.0),
            5: ("PASSED", 94.0),
        },
    )

    res1 = client.post(
        "/api/v1/certificates/claim",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res1.status_code == 200
    code1 = res1.json()["verification_code"]
    id1 = res1.json()["id"]

    res2 = client.post(
        "/api/v1/certificates/claim",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res2.status_code == 200
    code2 = res2.json()["verification_code"]
    id2 = res2.json()["id"]

    assert code1 == code2
    assert id1 == id2


def test_unknown_verification_code_returns_404_and_valid_returns_details():
    """An unknown verification code returns 404; valid code returns certificate details."""
    # 1. Unknown code returns 404
    res_unknown = client.get("/api/v1/certificates/UNKNOWN_CODE_9999")
    assert res_unknown.status_code == 404

    # 2. Valid code returns certificate details
    token, user_id = register_and_login("valid_verify")
    set_user_levels_progress(
        user_id,
        {
            1: ("PASSED", 95.0),
            2: ("PASSED", 95.0),
            3: ("PASSED", 95.0),
            4: ("PASSED", 95.0),
            5: ("PASSED", 95.0),
        },
    )

    claim_res = client.post(
        "/api/v1/certificates/claim",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert claim_res.status_code == 200
    v_code = claim_res.json()["verification_code"]

    res_valid = client.get(f"/api/v1/certificates/{v_code}")
    assert res_valid.status_code == 200
    details = res_valid.json()
    assert details["verification_code"] == v_code
    assert details["score"] == 95.0
    assert details["recipient_name"] == "Senior Advocate"
    assert "level_number" not in details
