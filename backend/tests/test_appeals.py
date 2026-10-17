import uuid

from fastapi.testclient import TestClient

from app.core.roles import ROLE_ADMIN, ROLE_EDUCATOR
from app.core.scoring import REQUIRED_CRITERIA
from app.db import SessionLocal
from app.main import app
from app.models import User

client = TestClient(app)


def register_and_login(prefix: str = "appeal_advocate", role: str = "learner") -> tuple[str, int]:
    """Helper to register and login a user with an optional specific role."""
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@courtly.dev"
    password = "StrongPassword123!"
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Advocate Appeal"},
    )
    user_id = reg.json()["id"]

    if role != "learner":
        db = SessionLocal()
        u = db.get(User, user_id)
        u.role = role
        db.commit()
        db.close()

    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login.json()["access_token"]
    return token, user_id


def create_and_complete_session(token: str) -> int:
    """Helper to start and complete a trial session."""
    create_res = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {token}"},
        json={"case_slug": "contract-breach-demo"},
    )
    assert create_res.status_code == 201
    session_id = create_res.json()["id"]

    passing_scores = [
        {"criterion_code": c, "score": 85.0, "explanation": f"Note for {c}"}
        for c in REQUIRED_CRITERIA
    ]
    comp_res = client.post(
        f"/api/v1/sessions/{session_id}/complete",
        headers={"Authorization": f"Bearer {token}"},
        json=passing_scores,
    )
    assert comp_res.status_code == 200
    return session_id


def test_appeal_on_in_progress_session_returns_409():
    """An appeal on an in-progress session returns 409 Conflict."""
    token, _ = register_and_login("in_progress_appeal")

    create_res = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {token}"},
        json={"case_slug": "contract-breach-demo"},
    )
    session_id = create_res.json()["id"]

    res = client.post(
        f"/api/v1/sessions/{session_id}/appeal",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "The witness testimony was interrupted improperly."},
    )
    assert res.status_code == 409
    assert "only permitted for COMPLETED" in res.json()["detail"]


def test_learner_can_appeal_completed_session():
    """A session owner can submit an appeal on a completed session."""
    token, user_id = register_and_login("valid_appeal")
    session_id = create_and_complete_session(token)

    res = client.post(
        f"/api/v1/sessions/{session_id}/appeal",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "Evidentiary ruling on hearsay was overly strict."},
    )
    assert res.status_code == 201
    appeal = res.json()
    assert appeal["session_id"] == session_id
    assert appeal["user_id"] == user_id
    assert appeal["status"] == "open"
    assert appeal["reason"] == "Evidentiary ruling on hearsay was overly strict."
    assert appeal["resolved_at"] is None


def test_second_open_appeal_returns_409():
    """Only one open appeal is permitted per session; a second returns 409 Conflict."""
    token, _ = register_and_login("duplicate_appeal")
    session_id = create_and_complete_session(token)

    # First appeal
    res1 = client.post(
        f"/api/v1/sessions/{session_id}/appeal",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "Initial appeal justification."},
    )
    assert res1.status_code == 201

    # Second appeal while first is open
    res2 = client.post(
        f"/api/v1/sessions/{session_id}/appeal",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "Duplicate appeal attempt."},
    )
    assert res2.status_code == 409
    assert "An open appeal already exists" in res2.json()["detail"]


def test_learner_cannot_resolve_appeal():
    """A learner cannot list appeals (403) or resolve an appeal (403)."""
    token_learner, _ = register_and_login("learner_actor", role="learner")
    session_id = create_and_complete_session(token_learner)

    # Create appeal
    appeal_res = client.post(
        f"/api/v1/sessions/{session_id}/appeal",
        headers={"Authorization": f"Bearer {token_learner}"},
        json={"reason": "Review request."},
    )
    appeal_id = appeal_res.json()["id"]

    # Learner tries to list appeals
    list_res = client.get(
        "/api/v1/admin/appeals",
        headers={"Authorization": f"Bearer {token_learner}"},
    )
    assert list_res.status_code == 403

    # Learner tries to resolve appeal
    resolve_res = client.post(
        f"/api/v1/admin/appeals/{appeal_id}/resolve",
        headers={"Authorization": f"Bearer {token_learner}"},
        json={"decision": "upheld", "resolution_note": "Self-upheld attempt"},
    )
    assert resolve_res.status_code == 403


def test_educator_can_list_appeals_but_cannot_resolve():
    """An educator can list open appeals, but only an admin can resolve them."""
    token_learner, _ = register_and_login("learner_subj")
    token_educator, _ = register_and_login("educator_reviewer", role=ROLE_EDUCATOR)

    session_id = create_and_complete_session(token_learner)
    appeal_res = client.post(
        f"/api/v1/sessions/{session_id}/appeal",
        headers={"Authorization": f"Bearer {token_learner}"},
        json={"reason": "Educator review required."},
    )
    appeal_id = appeal_res.json()["id"]

    # Educator lists appeals -> 200
    edu_list = client.get(
        "/api/v1/admin/appeals",
        headers={"Authorization": f"Bearer {token_educator}"},
    )
    assert edu_list.status_code == 200
    assert any(a["id"] == appeal_id for a in edu_list.json())

    # Educator attempts resolve -> 403 (admin only)
    edu_resolve = client.post(
        f"/api/v1/admin/appeals/{appeal_id}/resolve",
        headers={"Authorization": f"Bearer {token_educator}"},
        json={"decision": "upheld", "resolution_note": "Educator approval"},
    )
    assert edu_resolve.status_code == 403


def test_admin_can_resolve_appeal():
    """An administrator can resolve an open appeal to upheld or rejected, setting resolved_at."""
    token_learner, _ = register_and_login("learner_admin_test")
    token_admin, _ = register_and_login("admin_actor", role=ROLE_ADMIN)

    session_id = create_and_complete_session(token_learner)
    appeal_res = client.post(
        f"/api/v1/sessions/{session_id}/appeal",
        headers={"Authorization": f"Bearer {token_learner}"},
        json={"reason": "Please reconsider the commercial acumen score."},
    )
    appeal_id = appeal_res.json()["id"]

    # Admin resolves to upheld
    res = client.post(
        f"/api/v1/admin/appeals/{appeal_id}/resolve",
        headers={"Authorization": f"Bearer {token_admin}"},
        json={"decision": "upheld", "resolution_note": "Re-evaluated and sustained the objection argument."},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == appeal_id
    assert data["status"] == "upheld"
    assert "Re-evaluated" in data["resolution_note"]
    assert data["resolved_at"] is not None
