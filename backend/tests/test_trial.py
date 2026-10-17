import uuid

from fastapi.testclient import TestClient

from app.core.scoring import REQUIRED_CRITERIA
from app.main import app

client = TestClient(app)


def register_and_login(prefix: str = "trial_user") -> tuple[str, int]:
    """Helper to register and login a user, returning (token, user_id)."""
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@courtly.dev"
    password = "StrongPassword123!"
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Trial Advocate"},
    )
    user_id = reg.json()["id"]
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login.json()["access_token"]
    return token, user_id


def create_session(token: str, case_slug: str = "contract-breach-demo") -> int:
    """Helper to create a session for testing."""
    res = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {token}"},
        json={"case_slug": case_slug},
    )
    assert res.status_code == 201
    return res.json()["id"]


def test_learner_can_add_turn_and_fetch_transcript():
    """A learner can append dialogue turns and retrieve the ordered transcript."""
    token, _ = register_and_login("transcript_owner")
    session_id = create_session(token)

    # 1. Add first turn
    res1 = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "May it please the court, plaintiff is ready for opening statements."},
    )
    assert res1.status_code == 201
    turn1 = res1.json()
    assert turn1["session_id"] == session_id
    assert turn1["sequence_no"] == 1
    assert turn1["speaker_type"] == "learner"
    assert turn1["stage_index"] == 0
    assert "plaintiff is ready" in turn1["text"]

    # 2. Add second turn
    res2 = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "We intend to demonstrate deliberate breach of section 4.2."},
    )
    assert res2.status_code == 201
    turn2 = res2.json()
    assert turn2["sequence_no"] == 2

    # 3. Retrieve transcript in order
    transcript_res = client.get(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert transcript_res.status_code == 200
    transcript = transcript_res.json()
    assert len(transcript) == 2
    assert transcript[0]["sequence_no"] == 1
    assert transcript[1]["sequence_no"] == 2


def test_another_user_gets_404_on_same_session():
    """A user attempting to access turns, objections, or advance on another user's session gets 404."""
    token_owner, _ = register_and_login("session_owner")
    token_stranger, _ = register_and_login("session_stranger")

    session_id = create_session(token_owner)

    # Stranger attempts to add turn
    res_turn = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token_stranger}"},
        json={"text": "I am an interloper trying to speak."},
    )
    assert res_turn.status_code == 404
    assert res_turn.json()["detail"] == "Session not found"

    # Stranger attempts to read transcript
    res_transcript = client.get(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token_stranger}"},
    )
    assert res_transcript.status_code == 404

    # Stranger attempts to advance stage
    res_advance = client.post(
        f"/api/v1/sessions/{session_id}/advance",
        headers={"Authorization": f"Bearer {token_stranger}"},
    )
    assert res_advance.status_code == 404

    # Stranger attempts to post objection
    res_obj = client.post(
        f"/api/v1/sessions/{session_id}/objections",
        headers={"Authorization": f"Bearer {token_stranger}"},
        json={"turn_id": 1, "objection_type": "hearsay", "grounds": "Unauthorized"},
    )
    assert res_obj.status_code == 404


def test_turn_on_completed_session_returns_409():
    """Attempting to add a dialogue turn to a COMPLETED session returns 409 Conflict."""
    token, _ = register_and_login("completed_session_advocate")
    session_id = create_session(token)

    # Complete the session
    passing_criteria = [{"criterion_code": c, "score": 88.0, "explanation": "Solid"} for c in REQUIRED_CRITERIA]
    comp_res = client.post(
        f"/api/v1/sessions/{session_id}/complete",
        headers={"Authorization": f"Bearer {token}"},
        json=passing_criteria,
    )
    assert comp_res.status_code == 200

    # Try to add turn to completed session
    res = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "Your Honor, one final remark after adjournment."},
    )
    assert res.status_code == 409
    assert "not in progress" in res.json()["detail"]


def test_objection_on_turn_from_different_session_returns_422():
    """Raising an objection referencing a turn from a different session returns 422."""
    token, _ = register_and_login("objection_checker")

    # Session 1 with turn
    session1 = create_session(token)
    t1_res = client.post(
        f"/api/v1/sessions/{session1}/turns",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "Statement made in session 1."},
    )
    turn1_id = t1_res.json()["id"]

    # Session 2
    session2 = create_session(token)

    # Attempt to raise objection in session 2 using turn1_id from session 1
    res = client.post(
        f"/api/v1/sessions/{session2}/objections",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "turn_id": turn1_id,
            "objection_type": "hearsay",
            "grounds": "The witness heard this second-hand.",
        },
    )
    assert res.status_code == 422
    assert "does not belong to session" in res.json()["detail"]


def test_advance_stops_at_5():
    """Advancing a session increments current_stage by one and caps at 5."""
    token, _ = register_and_login("advance_advocate")
    session_id = create_session(token)

    # Initially current_stage is 0
    # Advance through stages 1 to 5
    for expected_stage in range(1, 6):
        res = client.post(
            f"/api/v1/sessions/{session_id}/advance",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["current_stage"] == expected_stage
        assert data["stage"] == expected_stage

    # 6th advance: must not exceed 5
    res6 = client.post(
        f"/api/v1/sessions/{session_id}/advance",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res6.status_code == 200
    assert res6.json()["current_stage"] == 5

    # 7th advance: remains 5
    res7 = client.post(
        f"/api/v1/sessions/{session_id}/advance",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res7.status_code == 200
    assert res7.json()["current_stage"] == 5


def test_new_objection_has_ruling_pending():
    """A newly created objection has ruling 'pending' and no automatic ruling is made."""
    token, _ = register_and_login("pending_objection_user")
    session_id = create_session(token)

    # Create a turn to object to
    turn_res = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "Mr. Smith told me that he knew the defendant breached the deal."},
    )
    turn_id = turn_res.json()["id"]

    # Raise objection
    obj_res = client.post(
        f"/api/v1/sessions/{session_id}/objections",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "turn_id": turn_id,
            "objection_type": "hearsay",
            "grounds": "Statement made out of court offered to prove the truth of the matter asserted.",
        },
    )
    assert obj_res.status_code == 201
    objection = obj_res.json()

    assert objection["session_id"] == session_id
    assert objection["turn_id"] == turn_id
    assert objection["objection_type"] == "hearsay"
    assert "out of court" in objection["grounds"]
    assert objection["ruling"] == "pending", "Initial ruling must strictly be 'pending'"
    assert objection["reasoning"] is None, "No reasoning should be auto-generated without AI judge"
