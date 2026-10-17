import uuid

from fastapi.testclient import TestClient

from app.core.levels import initialize_user_progress
from app.core.scoring import REQUIRED_CRITERIA
from app.db import SessionLocal
from app.main import app
from app.models import LevelProgress

client = TestClient(app)


def register_and_login(prefix: str = "progress_user") -> tuple[str, int]:
    """Helper to register and login a user, returning (token, user_id)."""
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@courtly.dev"
    password = "StrongPassword123!"
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Advocate Reports"},
    )
    user_id = reg.json()["id"]
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login.json()["access_token"]
    return token, user_id


def set_user_levels_progress(user_id: int, level_scores: dict[int, tuple[str, float | None]]):
    """
    Direct helper to set LevelProgress records for unit testing progress states.
    level_scores maps level_number -> (status, best_score)
    """
    db = SessionLocal()
    initialize_user_progress(db, user_id)
    rows = db.query(LevelProgress).filter(LevelProgress.user_id == user_id, LevelProgress.level_number <= 5).all()

    for p in rows:
        if p.level_number in level_scores:
            status_val, best_score_val = level_scores[p.level_number]
            p.status = status_val
            p.best_score = best_score_val
            p.attempts = 1 if best_score_val is not None else 0
            db.add(p)

    db.commit()
    db.close()


def test_report_on_in_progress_session_returns_409():
    """Requesting a session assessment report on an IN_PROGRESS session returns 409 Conflict."""
    token, _ = register_and_login("in_progress_report")

    # Create session
    create_res = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {token}"},
        json={"case_slug": "contract-breach-demo"},
    )
    assert create_res.status_code == 201
    session_id = create_res.json()["id"]

    # Attempt to fetch report
    res = client.get(
        f"/api/v1/sessions/{session_id}/report",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 409
    assert "only available for COMPLETED" in res.json()["detail"]


def test_report_on_completed_session_returns_scores():
    """A completed session returns the 8 criterion scores, overall score, and pass status."""
    token, _ = register_and_login("completed_report")

    # Create and complete session
    create_res = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {token}"},
        json={"case_slug": "contract-breach-demo"},
    )
    session_id = create_res.json()["id"]

    passing_scores = [
        {"criterion_code": c, "score": 88.0, "explanation": f"Evaluation for {c}"}
        for c in REQUIRED_CRITERIA
    ]
    comp_res = client.post(
        f"/api/v1/sessions/{session_id}/complete",
        headers={"Authorization": f"Bearer {token}"},
        json=passing_scores,
    )
    assert comp_res.status_code == 200

    # Fetch report as owner
    report_res = client.get(
        f"/api/v1/sessions/{session_id}/report",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert report_res.status_code == 200
    report = report_res.json()

    assert report["case_slug"] in ("contract-breach-demo", "contract_breach_demo")
    assert report["level"] == 1
    assert report["level_number"] == 1
    assert len(report["criterion_scores"]) == 8
    assert report["overall_score"] == 88.0
    assert report["passed"] is True

    # Other user gets 404
    token_stranger, _ = register_and_login("stranger_report")
    stranger_res = client.get(
        f"/api/v1/sessions/{session_id}/report",
        headers={"Authorization": f"Bearer {token_stranger}"},
    )
    assert stranger_res.status_code == 404


def test_progress_counts_match_user_who_passed_two_levels():
    """GET /api/v1/me/progress correctly reflects a user who has passed exactly two levels."""
    token, user_id = register_and_login("two_levels_passed")

    set_user_levels_progress(
        user_id,
        {
            1: ("PASSED", 88.0),
            2: ("PASSED", 92.0),
            3: ("NOT_STARTED", None),
            4: ("NOT_STARTED", None),
            5: ("NOT_STARTED", None),
        },
    )

    res = client.get("/api/v1/me/progress", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()

    levels = data["levels"]
    assert len(levels) == 5

    assert levels[0]["level_number"] == 1
    assert levels[0]["status"] == "PASSED"
    assert levels[0]["best_score"] == 88.0

    assert levels[1]["level_number"] == 2
    assert levels[1]["status"] == "PASSED"
    assert levels[1]["best_score"] == 92.0

    assert levels[2]["status"] == "NOT_STARTED"
    assert levels[3]["status"] == "NOT_STARTED"
    assert levels[4]["status"] == "NOT_STARTED"

    assert data["overall"]["levels_passed"] == 2
    assert data["overall"]["certificate_eligible"] is False


def test_certificate_eligibility_flag_false_until_all_five_levels_pass():
    """certificate_eligible remains False until all 5 levels are passed with average >= 90.0."""
    token, user_id = register_and_login("cert_eligibility_user")

    # 1. Levels 1 to 4 passed with 95.0, Level 5 NOT_STARTED
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
    res4 = client.get("/api/v1/me/progress", headers={"Authorization": f"Bearer {token}"})
    assert res4.status_code == 200
    assert res4.json()["overall"]["levels_passed"] == 4
    assert res4.json()["overall"]["certificate_eligible"] is False

    # 2. All 5 levels passed, but average is below 90.0 (e.g. 88.0)
    set_user_levels_progress(
        user_id,
        {
            1: ("PASSED", 88.0),
            2: ("PASSED", 88.0),
            3: ("PASSED", 88.0),
            4: ("PASSED", 88.0),
            5: ("PASSED", 88.0),
        },
    )
    res_low_avg = client.get("/api/v1/me/progress", headers={"Authorization": f"Bearer {token}"})
    assert res_low_avg.status_code == 200
    assert res_low_avg.json()["overall"]["levels_passed"] == 5
    assert res_low_avg.json()["overall"]["certificate_eligible"] is False

    # 3. All 5 levels passed with average >= 90.0 (e.g. 92.0)
    set_user_levels_progress(
        user_id,
        {
            1: ("PASSED", 92.0),
            2: ("PASSED", 92.0),
            3: ("PASSED", 92.0),
            4: ("PASSED", 92.0),
            5: ("PASSED", 92.0),
        },
    )
    res_eligible = client.get("/api/v1/me/progress", headers={"Authorization": f"Bearer {token}"})
    assert res_eligible.status_code == 200
    assert res_eligible.json()["overall"]["levels_passed"] == 5
    assert res_eligible.json()["overall"]["certificate_eligible"] is True
