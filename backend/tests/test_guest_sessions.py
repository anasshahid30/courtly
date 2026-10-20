import uuid
from datetime import UTC, datetime, timedelta

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.rate_limit import clear_all_rate_limits
from app.core.security import ALGORITHM, SECRET_KEY
from app.db import SessionLocal
from app.main import app
from app.models import Session as SessionModel
from app.seed import seed

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Ensure database has seeded cases/levels and clear rate limits before each test."""
    seed()
    clear_all_rate_limits()
    yield
    clear_all_rate_limits()


def create_guest_session(case_slug: str = "contract_breach_demo") -> dict:
    """Helper to create a guest session and return response JSON."""
    res = client.post("/api/v1/auth/guest", json={"case_slug": case_slug})
    return res


def register_learner(prefix: str = "learner") -> tuple[str, str]:
    """Helper to register and login a regular learner, returning (token, email)."""
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@courtly.legal"
    password = "StrongPassword123!"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Registered Learner"},
    )
    assert reg_res.status_code == 201
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    return login_res.json()["access_token"], email


# ---------------------------------------------------------------------------
# 1. Successful Guest Session Creation
# ---------------------------------------------------------------------------

def test_successful_guest_session_creation():
    """Unauthenticated visitor creates a temporary Foundation courtroom session."""
    res = create_guest_session("contract_breach_demo")
    assert res.status_code == 201
    data = res.json()

    # JWT & Expiration
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 7200  # 2 hours

    # Guest identity
    assert "guest_id" in data
    assert data["guest_user"]["id"] == data["guest_id"]
    assert data["guest_user"]["role"] == "guest"
    assert data["guest_user"]["full_name"] == "Guest Advocate"
    assert data["guest_user"]["email"].startswith("guest_")
    assert data["guest_user"]["email"].endswith("@guest.courtly.internal")

    # Session & Case details
    assert isinstance(data["session_id"], int)
    assert data["case_slug"] == "contract_breach_demo"
    assert data["level_number"] == 1
    assert data["level"] == 1
    assert data["status"] == "IN_PROGRESS"
    assert data["current_stage"] == 0

    # Verify decoded JWT payload
    payload = jwt.decode(data["access_token"], SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == str(data["guest_id"])
    assert payload["role"] == "guest"
    assert payload["session_id"] == data["session_id"]
    assert payload["case_slug"] == "contract_breach_demo"


# ---------------------------------------------------------------------------
# 2. Foundation-Only Case Restriction
# ---------------------------------------------------------------------------

def test_foundation_only_case_restriction():
    """Guests can only access the Foundation case 'contract_breach_demo'. Other cases rejected."""
    # Attempt Level 2 case
    res_lvl2 = create_guest_session("level2_mock_case")
    assert res_lvl2.status_code == 403
    assert "contract_breach_demo" in res_lvl2.json()["detail"]

    # Attempt Level 3 case
    res_lvl3 = create_guest_session("level3_direct_case")
    assert res_lvl3.status_code == 403

    # Attempt non-existent case
    res_unknown = create_guest_session("non_existent_case")
    assert res_unknown.status_code == 403


# ---------------------------------------------------------------------------
# 3. Guest Token Expiration
# ---------------------------------------------------------------------------

def test_guest_token_expiration():
    """Expired guest tokens are rejected with 401 Unauthorized."""
    res = create_guest_session("contract_breach_demo")
    assert res.status_code == 201
    session_id = res.json()["session_id"]
    guest_id = res.json()["guest_id"]

    # Create an expired token (expired 30 minutes ago)
    expired_payload = {
        "sub": str(guest_id),
        "role": "guest",
        "session_id": session_id,
        "exp": datetime.now(UTC) - timedelta(minutes=30),
    }
    expired_token = jwt.encode(expired_payload, SECRET_KEY, algorithm=ALGORITHM)

    headers = {"Authorization": f"Bearer {expired_token}"}
    access_res = client.get(f"/api/v1/sessions/{session_id}/turns", headers=headers)
    assert access_res.status_code == 401
    assert "Invalid or expired token" in access_res.json()["detail"]


# ---------------------------------------------------------------------------
# 4. Guest Isolation from Other Guests
# ---------------------------------------------------------------------------

def test_guest_isolation_from_other_guests():
    """Guest A cannot access, view, or post turns to Guest B's session."""
    guest_a = create_guest_session("contract_breach_demo").json()
    guest_b = create_guest_session("contract_breach_demo").json()

    assert guest_a["session_id"] != guest_b["session_id"]
    assert guest_a["guest_id"] != guest_b["guest_id"]

    headers_a = {"Authorization": f"Bearer {guest_a['access_token']}"}
    headers_b = {"Authorization": f"Bearer {guest_b['access_token']}"}

    # Guest A tries to read Guest B's session details -> 404
    res_read = client.get(f"/api/v1/sessions/{guest_b['session_id']}", headers=headers_a)
    assert res_read.status_code == 404

    # Guest A tries to read Guest B's transcript -> 404
    res_turns = client.get(f"/api/v1/sessions/{guest_b['session_id']}/turns", headers=headers_a)
    assert res_turns.status_code == 404

    # Guest A tries to post a turn to Guest B's session -> 404
    res_post = client.post(
        f"/api/v1/sessions/{guest_b['session_id']}/turns",
        headers=headers_a,
        json={"text": "Intruder utterance"},
    )
    assert res_post.status_code == 404

    # Vice versa: Guest B cannot access Guest A's session -> 404
    res_b_on_a = client.get(f"/api/v1/sessions/{guest_a['session_id']}/turns", headers=headers_b)
    assert res_b_on_a.status_code == 404


# ---------------------------------------------------------------------------
# 5. Guest Isolation from Registered Users
# ---------------------------------------------------------------------------

def test_guest_isolation_from_registered_users():
    """Guests cannot access registered users' sessions and vice versa."""
    # Registered learner creates a session
    learner_token, _ = register_learner()
    learner_headers = {"Authorization": f"Bearer {learner_token}"}
    learner_sess_res = client.post(
        "/api/v1/sessions",
        headers=learner_headers,
        json={"case_slug": "contract_breach_demo"},
    )
    assert learner_sess_res.status_code == 201
    learner_session_id = learner_sess_res.json()["id"]

    # Guest creates a session
    guest = create_guest_session("contract_breach_demo").json()
    guest_headers = {"Authorization": f"Bearer {guest['access_token']}"}

    # Guest tries to read learner's session -> 404
    res_guest_on_learner = client.get(f"/api/v1/sessions/{learner_session_id}", headers=guest_headers)
    assert res_guest_on_learner.status_code == 404

    # Guest tries to post turn to learner's session -> 404
    res_guest_post = client.post(
        f"/api/v1/sessions/{learner_session_id}/turns",
        headers=guest_headers,
        json={"text": "Guest interference"},
    )
    assert res_guest_post.status_code == 404

    # Learner tries to read guest's session -> 404
    res_learner_on_guest = client.get(f"/api/v1/sessions/{guest['session_id']}", headers=learner_headers)
    assert res_learner_on_guest.status_code == 404


# ---------------------------------------------------------------------------
# 6. Unauthorized Session Creation
# ---------------------------------------------------------------------------

def test_unauthorized_session_creation():
    """Guests cannot create new unrestricted sessions via POST /api/v1/sessions."""
    guest = create_guest_session("contract_breach_demo").json()
    guest_headers = {"Authorization": f"Bearer {guest['access_token']}"}

    res_create = client.post(
        "/api/v1/sessions",
        headers=guest_headers,
        json={"case_slug": "contract_breach_demo"},
    )
    assert res_create.status_code == 403
    assert "Guests cannot create unrestricted sessions" in res_create.json()["detail"]


# ---------------------------------------------------------------------------
# 7. Guest Transcript Access & Turn Posting to Own Session
# ---------------------------------------------------------------------------

def test_guest_transcript_access_and_turn_posting_to_own_session():
    """Guest can successfully post turns and fetch transcript for their own assigned session."""
    guest = create_guest_session("contract_breach_demo").json()
    headers = {"Authorization": f"Bearer {guest['access_token']}"}
    session_id = guest["session_id"]

    # Post turn
    turn_text = "May it please the court, I appear on behalf of the claimant Nova Systems."
    post_res = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers=headers,
        json={"text": turn_text},
    )
    assert post_res.status_code == 201
    turn_data = post_res.json()
    assert turn_data["session_id"] == session_id
    assert turn_data["speaker_type"] == "learner"
    assert turn_data["sequence_no"] == 1
    assert turn_data["text"] == turn_text

    # Fetch transcript
    transcript_res = client.get(f"/api/v1/sessions/{session_id}/turns", headers=headers)
    assert transcript_res.status_code == 200
    transcript = transcript_res.json()
    assert len(transcript) == 1
    assert transcript[0]["text"] == turn_text


# ---------------------------------------------------------------------------
# 8. Guest Rejection from Privileged Operations
# ---------------------------------------------------------------------------

def test_guest_rejection_from_privileged_operations():
    """Guests are rejected from certificates, appeals, progress, and admin routes."""
    guest = create_guest_session("contract_breach_demo").json()
    headers = {"Authorization": f"Bearer {guest['access_token']}"}
    session_id = guest["session_id"]

    # Certificate issuance -> 403
    cert_res = client.post("/api/v1/certificates/claim", headers=headers)
    assert cert_res.status_code == 403

    # Appeals -> 403
    appeal_res = client.post(
        f"/api/v1/sessions/{session_id}/appeal",
        headers=headers,
        json={"reason": "Contesting evidentiary ruling"},
    )
    assert appeal_res.status_code == 403

    # Persistent learning progress -> 403
    progress_res = client.get("/api/v1/me/progress", headers=headers)
    assert progress_res.status_code == 403

    # Admin dashboard -> 403
    admin_dash_res = client.get("/api/v1/admin/dashboard", headers=headers)
    assert admin_dash_res.status_code == 403

    # Admin appeals list -> 403
    admin_appeals_res = client.get("/api/v1/admin/appeals", headers=headers)
    assert admin_appeals_res.status_code == 403


# ---------------------------------------------------------------------------
# 9. Registered User Authentication Still Working
# ---------------------------------------------------------------------------

def test_registered_user_authentication_still_working():
    """Regular learner registration, login, profile, session creation, and progress remain functional."""
    token, email = register_learner(prefix="advocate_user")
    headers = {"Authorization": f"Bearer {token}"}

    # /auth/me returns learner role
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "learner"
    assert me_res.json()["email"] == email

    # Learner can create regular session
    sess_res = client.post(
        "/api/v1/sessions",
        headers=headers,
        json={"case_slug": "contract_breach_demo"},
    )
    assert sess_res.status_code == 201

    # Learner can fetch progress
    prog_res = client.get("/api/v1/me/progress", headers=headers)
    assert prog_res.status_code == 200
    assert "levels" in prog_res.json()
    assert len(prog_res.json()["levels"]) == 5


# ---------------------------------------------------------------------------
# 10. Rate Limiting Behavior
# ---------------------------------------------------------------------------

def test_guest_rate_limiting():
    """IP rate limiting blocks automated guest session creation after 5 requests within 15 minutes."""
    clear_all_rate_limits()

    # 5 allowed creations
    for i in range(5):
        res = create_guest_session("contract_breach_demo")
        assert res.status_code == 201, f"Attempt {i+1} failed"

    # 6th attempt is throttled
    throttled_res = create_guest_session("contract_breach_demo")
    assert throttled_res.status_code == 429
    assert "Too many guest session creation attempts" in throttled_res.json()["detail"]

    # Clear limits restores ability
    clear_all_rate_limits()
    retry_res = create_guest_session("contract_breach_demo")
    assert retry_res.status_code == 201


# ---------------------------------------------------------------------------
# 11. Guest Can Access Own Token-Bound Session
# ---------------------------------------------------------------------------

def test_guest_can_access_own_token_bound_session():
    """Guest can access, read, add turns, and advance their token-bound session."""
    guest = create_guest_session("contract_breach_demo").json()
    headers = {"Authorization": f"Bearer {guest['access_token']}"}
    session_id = guest["session_id"]

    # 1. Read session details
    read_res = client.get(f"/api/v1/sessions/{session_id}", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["id"] == session_id

    # 2. Get transcript
    transcript_res = client.get(f"/api/v1/sessions/{session_id}/turns", headers=headers)
    assert transcript_res.status_code == 200

    # 3. Add dialogue turn
    turn_res = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers=headers,
        json={"text": "May it please the court, opening submissions for Claimant."},
    )
    assert turn_res.status_code == 201

    # 4. Advance stage
    advance_res = client.post(f"/api/v1/sessions/{session_id}/advance", headers=headers)
    assert advance_res.status_code == 200
    assert advance_res.json()["current_stage"] == 1


# ---------------------------------------------------------------------------
# 12. Guest Cannot Access Another User's Session
# ---------------------------------------------------------------------------

def test_guest_cannot_access_another_users_session():
    """Guest cannot read, add turns, or advance a session owned by another user (returns 404)."""
    guest_a = create_guest_session("contract_breach_demo").json()
    guest_b = create_guest_session("contract_breach_demo").json()

    headers_a = {"Authorization": f"Bearer {guest_a['access_token']}"}
    session_b_id = guest_b["session_id"]

    # Read other guest's session -> 404
    assert client.get(f"/api/v1/sessions/{session_b_id}", headers=headers_a).status_code == 404
    # Read other guest's transcript -> 404
    assert client.get(f"/api/v1/sessions/{session_b_id}/turns", headers=headers_a).status_code == 404
    # Add turn to other guest's session -> 404
    assert client.post(
        f"/api/v1/sessions/{session_b_id}/turns",
        headers=headers_a,
        json={"text": "Unauthorized cross-tenant turn"},
    ).status_code == 404
    # Advance other guest's session -> 404
    assert client.post(f"/api/v1/sessions/{session_b_id}/advance", headers=headers_a).status_code == 404


# ---------------------------------------------------------------------------
# 13. Guest Cannot Access Different Session Owned by Same Guest Identity
# ---------------------------------------------------------------------------

def test_guest_cannot_access_different_session_owned_by_same_guest():
    """Even if multiple sessions exist for the same guest user ID in SQLite,
    the guest JWT can strictly access ONLY its bound session ID."""
    guest = create_guest_session("contract_breach_demo").json()
    headers = {"Authorization": f"Bearer {guest['access_token']}"}
    bound_session_id = guest["session_id"]
    guest_user_id = guest["guest_id"]

    # Directly create a second session in SQLite owned by the SAME guest user
    db = SessionLocal()
    try:
        second_session = SessionModel(
            user_id=guest_user_id,
            case_slug="contract_breach_demo",
            level_number=1,
            status="IN_PROGRESS",
            current_stage=0,
            created_at=datetime.now(UTC),
        )
        db.add(second_session)
        db.commit()
        db.refresh(second_session)
        second_session_id = second_session.id
    finally:
        db.close()

    assert second_session_id != bound_session_id

    # The guest token is bound to bound_session_id. Accessing second_session must return 404
    assert client.get(f"/api/v1/sessions/{second_session_id}", headers=headers).status_code == 404
    assert client.get(f"/api/v1/sessions/{second_session_id}/turns", headers=headers).status_code == 404
    assert client.post(
        f"/api/v1/sessions/{second_session_id}/turns",
        headers=headers,
        json={"text": "Attempting turn on unbound session"},
    ).status_code == 404
    assert client.post(f"/api/v1/sessions/{second_session_id}/advance", headers=headers).status_code == 404


# ---------------------------------------------------------------------------
# 14. Guest Tokens Missing session_id Are Rejected
# ---------------------------------------------------------------------------

def test_guest_tokens_missing_session_id_are_rejected():
    """Guest tokens omitting the session_id claim are rejected with 404 on session endpoints."""
    guest = create_guest_session("contract_breach_demo").json()
    session_id = guest["session_id"]

    # Craft guest token without session_id claim
    payload = {
        "sub": str(guest["guest_id"]),
        "role": "guest",
        "exp": datetime.now(UTC) + timedelta(hours=2),
    }
    token_without_session = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {token_without_session}"}

    assert client.get(f"/api/v1/sessions/{session_id}", headers=headers).status_code == 404
    assert client.get(f"/api/v1/sessions/{session_id}/turns", headers=headers).status_code == 404
    assert client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers=headers,
        json={"text": "Attempt with missing session_id claim"},
    ).status_code == 404
    assert client.post(f"/api/v1/sessions/{session_id}/advance", headers=headers).status_code == 404


# ---------------------------------------------------------------------------
# 15. Guest Tokens with Malformed session_id Are Rejected
# ---------------------------------------------------------------------------

def test_guest_tokens_with_malformed_session_id_are_rejected():
    """Guest tokens with string, boolean, or null session_id claims are rejected with 404."""
    guest = create_guest_session("contract_breach_demo").json()
    session_id = guest["session_id"]

    malformed_values = ["not_an_int", True, None, "123_abc", [1, 2]]
    for malformed in malformed_values:
        payload = {
            "sub": str(guest["guest_id"]),
            "role": "guest",
            "session_id": malformed,
            "exp": datetime.now(UTC) + timedelta(hours=2),
        }
        malformed_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        headers = {"Authorization": f"Bearer {malformed_token}"}

        res_read = client.get(f"/api/v1/sessions/{session_id}", headers=headers)
        assert res_read.status_code == 404, f"Failed for malformed value: {malformed}"

        res_turn = client.post(
            f"/api/v1/sessions/{session_id}/turns",
            headers=headers,
            json={"text": "Test turn with malformed token"},
        )
        assert res_turn.status_code == 404, f"Failed turn for malformed value: {malformed}"


# ---------------------------------------------------------------------------
# 16. Guest Tokens with Mismatched session_id Are Rejected
# ---------------------------------------------------------------------------

def test_guest_tokens_with_mismatched_session_id_are_rejected():
    """Guest tokens with a valid integer session_id that does not match the requested route are rejected with 404."""
    guest = create_guest_session("contract_breach_demo").json()
    session_id = guest["session_id"]

    # Token claims session_id 999999, but route is session_id
    payload = {
        "sub": str(guest["guest_id"]),
        "role": "guest",
        "session_id": 999999,
        "exp": datetime.now(UTC) + timedelta(hours=2),
    }
    mismatched_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {mismatched_token}"}

    assert client.get(f"/api/v1/sessions/{session_id}", headers=headers).status_code == 404
    assert client.get(f"/api/v1/sessions/{session_id}/turns", headers=headers).status_code == 404
    assert client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers=headers,
        json={"text": "Test turn with mismatched token"},
    ).status_code == 404
    assert client.post(f"/api/v1/sessions/{session_id}/advance", headers=headers).status_code == 404


# ---------------------------------------------------------------------------
# 17. Registered Users Can Still Access Their Own Sessions Normally
# ---------------------------------------------------------------------------

def test_registered_users_can_still_access_their_own_sessions_normally():
    """Registered learners can create and access multiple sessions without token session binding."""
    token, _ = register_learner(prefix="unrestricted_learner")
    headers = {"Authorization": f"Bearer {token}"}

    # Verify registered token does NOT contain session_id claim
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert "session_id" not in payload

    # Create Session 1
    sess1_res = client.post(
        "/api/v1/sessions",
        headers=headers,
        json={"case_slug": "contract_breach_demo"},
    )
    assert sess1_res.status_code == 201
    sess1_id = sess1_res.json()["id"]

    # Create Session 2
    sess2_res = client.post(
        "/api/v1/sessions",
        headers=headers,
        json={"case_slug": "contract_breach_demo"},
    )
    assert sess2_res.status_code == 201
    sess2_id = sess2_res.json()["id"]

    assert sess1_id != sess2_id

    # Learner can freely read, turn, and advance Session 1
    assert client.get(f"/api/v1/sessions/{sess1_id}", headers=headers).status_code == 200
    assert client.get(f"/api/v1/sessions/{sess1_id}/turns", headers=headers).status_code == 200
    turn1_res = client.post(
        f"/api/v1/sessions/{sess1_id}/turns",
        headers=headers,
        json={"text": "Learner turn on session 1"},
    )
    assert turn1_res.status_code == 201
    assert client.post(f"/api/v1/sessions/{sess1_id}/advance", headers=headers).status_code == 200

    # Learner can also freely read, turn, and advance Session 2 with the SAME token
    assert client.get(f"/api/v1/sessions/{sess2_id}", headers=headers).status_code == 200
    assert client.get(f"/api/v1/sessions/{sess2_id}/turns", headers=headers).status_code == 200
    turn2_res = client.post(
        f"/api/v1/sessions/{sess2_id}/turns",
        headers=headers,
        json={"text": "Learner turn on session 2"},
    )
    assert turn2_res.status_code == 201
    assert client.post(f"/api/v1/sessions/{sess2_id}/advance", headers=headers).status_code == 200
