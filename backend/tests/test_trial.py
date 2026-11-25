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


def test_whitespace_only_turn_returns_422():
    """Whitespace-only turn submissions must be rejected with 422."""
    token, _ = register_and_login("whitespace_turn")
    session_id = create_session(token)

    res = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "   \n\t  "},
    )
    assert res.status_code == 422


def test_invalid_token_on_turn_returns_401():
    """Invalid or expired JWT must be rejected with 401 on turn submission."""
    token, _ = register_and_login("bad_token_turn")
    session_id = create_session(token)

    res = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": "Bearer invalid.jwt.token"},
        json={"text": "May it please the Court."},
    )
    assert res.status_code == 401


def test_guest_auth_creates_session_and_bound_jwt():
    """POST /api/v1/auth/guest creates a guest user, Foundation session, and 2h bound JWT."""
    import jwt
    from app.core.security import ALGORITHM, SECRET_KEY
    from app.seed import seed

    seed()
    res = client.post("/api/v1/auth/guest")
    assert res.status_code == 201
    data = res.json()

    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 7200
    assert data["case_slug"] == "contract_breach_demo"
    assert data["level_number"] == 1
    assert data["user"]["role"] == "guest"

    claims = jwt.decode(data["access_token"], SECRET_KEY, algorithms=[ALGORITHM])
    assert claims["role"] == "guest"
    assert claims["is_guest"] is True
    assert claims["session_id"] == data["session_id"]


def test_guest_can_submit_turn_and_retrieve_transcript():
    """A guest with a valid guest JWT can submit turns and retrieve the persisted transcript."""
    from app.seed import seed

    seed()
    guest_res = client.post("/api/v1/auth/guest")
    assert guest_res.status_code == 201
    token = guest_res.json()["access_token"]
    session_id = guest_res.json()["session_id"]

    turn_res = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "Claimant relies on the Master Freight Agreement executed on March 1, 2025."},
    )
    assert turn_res.status_code == 201
    turn_data = turn_res.json()
    assert turn_data["session_id"] == session_id
    assert turn_data["speaker_type"] == "learner"
    assert "Master Freight Agreement" in turn_data["text"]

    transcript_res = client.get(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert transcript_res.status_code == 200
    turns = transcript_res.json()
    assert len(turns) == 1
    assert turns[0]["id"] == turn_data["id"]


def test_guest_jwt_session_binding_rejects_other_session():
    """A guest JWT bound to one session cannot access or submit turns to another session."""
    from app.seed import seed

    seed()
    guest_a = client.post("/api/v1/auth/guest").json()
    token_a = guest_a["access_token"]

    # Create a second session for the same guest user via POST /api/v1/sessions
    other_sess = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"case_slug": "contract_breach_demo"},
    )
    assert other_sess.status_code == 201
    other_session_id = other_sess.json()["id"]

    # Attempting to post a turn to the unbound session with token_a must return 403
    res = client.post(
        f"/api/v1/sessions/{other_session_id}/turns",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"text": "Attempting cross-session turn."},
    )
    assert res.status_code == 403


def test_guest_cannot_start_higher_level_session():
    """Guest users are restricted to Level 1 (Foundation) simulations."""
    from app.db import SessionLocal
    from app.models import Case
    from app.seed import seed

    seed()
    db = SessionLocal()
    try:
        if not db.query(Case).filter(Case.slug == "level_2_demo").first():
            db.add(
                Case(
                    slug="level_2_demo",
                    title="Level 2 Test Case",
                    jurisdiction="Demo",
                    domain_slug="contract",
                    level_number=2,
                    case_json="{}",
                )
            )
            db.commit()
    finally:
        db.close()

    guest = client.post("/api/v1/auth/guest").json()
    res = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {guest['access_token']}"},
        json={"case_slug": "level_2_demo"},
    )
    assert res.status_code == 403


def test_evidence_presentation_and_retrieval():
    """Valid case evidence can be presented, retrieved, and duplicates are rejected with 409."""
    from app.seed import seed

    seed()
    guest = client.post("/api/v1/auth/guest").json()
    token = guest["access_token"]
    session_id = guest["session_id"]

    # Present valid document from contract_breach_demo
    res = client.post(
        f"/api/v1/sessions/{session_id}/evidence",
        headers={"Authorization": f"Bearer {token}"},
        json={"evidence_id": "doc-1"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["session_id"] == session_id
    assert data["evidence_id"] == "doc-1"
    assert data["title"] == "Master Freight Agreement"

    # Duplicate presentation must return 409
    dup = client.post(
        f"/api/v1/sessions/{session_id}/evidence",
        headers={"Authorization": f"Bearer {token}"},
        json={"evidence_id": "doc-1"},
    )
    assert dup.status_code == 409

    # Retrieve presented evidence
    list_res = client.get(
        f"/api/v1/sessions/{session_id}/evidence",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) == 1
    assert items[0]["evidence_id"] == "doc-1"


def test_evidence_from_another_case_rejected():
    """Presenting an evidence_id not in the active case dossier returns 422."""
    from app.seed import seed

    seed()
    guest = client.post("/api/v1/auth/guest").json()
    res = client.post(
        f"/api/v1/sessions/{guest['session_id']}/evidence",
        headers={"Authorization": f"Bearer {guest['access_token']}"},
        json={"evidence_id": "nonexistent-doc-999"},
    )
    assert res.status_code == 422


def test_evidence_unauthorized_and_guest_binding():
    """Unauthorized users get 404/401 and bound guest tokens get 403 on other sessions."""
    from app.seed import seed

    seed()
    guest_a = client.post("/api/v1/auth/guest").json()
    token_a = guest_a["access_token"]
    session_a = guest_a["session_id"]

    # Unauthenticated user
    no_auth = client.post(
        f"/api/v1/sessions/{session_a}/evidence",
        json={"evidence_id": "doc-1"},
    )
    assert no_auth.status_code in (401, 403)

    # Another user gets 404
    other_token, _ = register_and_login("other_ev_user")
    other_res = client.post(
        f"/api/v1/sessions/{session_a}/evidence",
        headers={"Authorization": f"Bearer {other_token}"},
        json={"evidence_id": "doc-1"},
    )
    assert other_res.status_code == 404

    # Guest token bound to session_a cannot present on another session owned by same guest
    other_sess = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"case_slug": "contract_breach_demo"},
    ).json()
    cross_res = client.post(
        f"/api/v1/sessions/{other_sess['id']}/evidence",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"evidence_id": "doc-1"},
    )
    assert cross_res.status_code == 403


def test_objection_validation_retrieval_and_completed_session():
    """Objections validate grounds/type, can be retrieved, and fail with 409 on completed sessions."""
    from app.seed import seed

    seed()
    token, _ = register_and_login("obj_full")
    session_id = create_session(token)

    turn_res = client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "Witness testified about what a third party told him."},
    )
    turn_id = turn_res.json()["id"]

    # Whitespace-only grounds -> 422
    bad_grounds = client.post(
        f"/api/v1/sessions/{session_id}/objections",
        headers={"Authorization": f"Bearer {token}"},
        json={"turn_id": turn_id, "objection_type": "hearsay", "grounds": "   "},
    )
    assert bad_grounds.status_code == 422

    # Invalid objection_type -> 422
    bad_type = client.post(
        f"/api/v1/sessions/{session_id}/objections",
        headers={"Authorization": f"Bearer {token}"},
        json={"turn_id": turn_id, "objection_type": "made_up_type", "grounds": "Improper."},
    )
    assert bad_type.status_code == 422

    # Valid objection -> 201 with ruling='pending'
    ok_res = client.post(
        f"/api/v1/sessions/{session_id}/objections",
        headers={"Authorization": f"Bearer {token}"},
        json={"turn_id": turn_id, "objection_type": "hearsay", "grounds": "Out-of-court statement."},
    )
    assert ok_res.status_code == 201
    assert ok_res.json()["ruling"] == "pending"

    # Retrieval via GET /objections
    list_res = client.get(
        f"/api/v1/sessions/{session_id}/objections",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1
    assert list_res.json()[0]["objection_type"] == "hearsay"

    # Complete the session, then verify objection returns 409
    passing_criteria = [
        {"criterion_code": c, "score": 90.0, "explanation": "Solid"} for c in REQUIRED_CRITERIA
    ]
    comp = client.post(
        f"/api/v1/sessions/{session_id}/complete",
        headers={"Authorization": f"Bearer {token}"},
        json=passing_criteria,
    )
    assert comp.status_code == 200

    closed_res = client.post(
        f"/api/v1/sessions/{session_id}/objections",
        headers={"Authorization": f"Bearer {token}"},
        json={"turn_id": turn_id, "objection_type": "relevance", "grounds": "Late objection."},
    )
    assert closed_res.status_code == 409


def test_guest_objection_session_binding():
    """A guest JWT bound to session A cannot raise or list objections on session B."""
    from app.seed import seed

    seed()
    guest_a = client.post("/api/v1/auth/guest").json()
    token_a = guest_a["access_token"]

    sess_b = client.post(
        "/api/v1/sessions",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"case_slug": "contract_breach_demo"},
    ).json()

    res = client.post(
        f"/api/v1/sessions/{sess_b['id']}/objections",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"turn_id": 1, "objection_type": "hearsay", "grounds": "Cross-session test."},
    )
    assert res.status_code == 403

    get_res = client.get(
        f"/api/v1/sessions/{sess_b['id']}/objections",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert get_res.status_code == 403
