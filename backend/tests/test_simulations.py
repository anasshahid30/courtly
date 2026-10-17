import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.levels import (
    CERTIFICATE_THRESHOLD,
    FINAL_LEVEL,
    PASS_THRESHOLD,
    certificate_eligible,
    level_passed,
)
from app.main import app
from app.seed import seed

client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_db_seeded():
    """Ensure database has levels and cases seeded before each test."""
    seed()


def test_core_levels_constants_and_logic():
    """Verify core levels definitions and helper functions for Phase 2A."""
    assert PASS_THRESHOLD == 85
    assert CERTIFICATE_THRESHOLD == 90
    assert FINAL_LEVEL == 5

    # level_passed tests
    assert level_passed(85) is True
    assert level_passed(90) is True
    assert level_passed(84.9) is False
    assert level_passed(0) is False
    assert level_passed(None) is False

    # certificate_eligible tests (levels 1-5 all passed, average of best_scores >= 90)
    assert certificate_eligible([1, 2, 3, 4, 5], [90.0, 90.0, 90.0, 90.0, 90.0]) is True
    assert certificate_eligible([1, 2, 3, 4, 5], [88.0, 92.0, 90.0, 91.0, 89.0]) is True  # avg = 90.0
    assert certificate_eligible([1, 2, 3, 4, 5], [85.0, 85.0, 85.0, 85.0, 85.0]) is False  # avg = 85.0 < 90
    assert certificate_eligible([1, 2, 3, 4], [95.0, 95.0, 95.0, 95.0]) is False  # missing level 5
    assert certificate_eligible([], [95.0, 95.0, 95.0, 95.0, 95.0]) is False
    assert certificate_eligible([1, 2, 3, 4, 5], None) is False


def test_list_simulations_returns_seeded_case():
    """GET /api/v1/simulations must return a list containing the seeded case."""
    response = client.get("/api/v1/simulations")
    assert response.status_code == 200
    simulations = response.json()
    assert isinstance(simulations, list)
    assert len(simulations) >= 1

    seeded = next((s for s in simulations if s["slug"] == "contract_breach_demo"), None)
    assert seeded is not None, "Seeded case 'contract_breach_demo' not found in simulations list"
    assert "id" in seeded
    assert seeded["title"] == "Nova Systems v. Solis Logistics"
    assert seeded["domain_slug"] == "contract"
    assert seeded["level_number"] == 1


def test_simulation_summary():
    """GET /api/v1/simulations/{slug} returns one case summary."""
    response = client.get("/api/v1/simulations/contract_breach_demo")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "contract_breach_demo"
    assert data["title"] == "Nova Systems v. Solis Logistics"
    assert data["jurisdiction"] == "Demo jurisdiction"
    assert data["domain_slug"] == "contract"
    assert data["level_number"] == 1
    assert "parties" in data
    assert len(data["parties"]) == 2
    assert "legal_issues" in data


def test_simulation_unknown_slug_returns_404():
    """Unknown slug returns 404 for summary and case file."""
    res_summary = client.get("/api/v1/simulations/nonexistent-case-slug-xyz")
    assert res_summary.status_code == 404

    res_case_file = client.get("/api/v1/simulations/nonexistent-case-slug-xyz/case-file")
    assert res_case_file.status_code == 404


def test_simulation_case_file():
    """GET /api/v1/simulations/{slug}/case-file returns full case JSON."""
    response = client.get("/api/v1/simulations/contract_breach_demo/case-file")
    assert response.status_code == 200
    case_file = response.json()

    assert case_file["jurisdiction"] == "Demo jurisdiction"
    assert "parties" in case_file
    assert "agreed_facts" in case_file
    assert "documents" in case_file
    assert "witnesses" in case_file
    assert "legal_issues" in case_file

    assert len(case_file["parties"]) == 2
    assert len(case_file["witnesses"]) == 2
    assert len(case_file["documents"]) >= 2
    assert len(case_file["agreed_facts"]) >= 3


def test_levels_without_token_returns_401_or_403():
    """GET /api/v1/levels without a token returns 401 or 403."""
    response = client.get("/api/v1/levels")
    assert response.status_code in [401, 403]


def test_levels_with_valid_token_returns_five_levels_with_status():
    """GET /api/v1/levels with a valid token returns exactly 5 levels with status."""
    email = f"phase2a_test_{uuid.uuid4().hex[:8]}@courtly.legal"
    password = "StrongPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Test Advocate"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    response = client.get("/api/v1/levels", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    levels = response.json()
    assert len(levels) == 5, "There must be exactly 5 levels"

    # Verify each level structure and status presence (NOT_STARTED, IN_PROGRESS, PASSED)
    for i, lvl in enumerate(levels, start=1):
        assert lvl["number"] == i
        assert "title" in lvl
        assert lvl["pass_threshold"] == 85
        assert lvl["status"] in ["NOT_STARTED", "IN_PROGRESS", "PASSED"]
        assert "best_score" in lvl
        assert "attempts" in lvl

    # Fresh user has level 1 as NOT_STARTED
    assert levels[0]["status"] == "NOT_STARTED"


def test_seed_idempotent():
    """Verifies that running seed multiple times is safe and maintains consistency."""
    seed()
    seed()
    response = client.get("/api/v1/simulations")
    assert response.status_code == 200
    simulations = response.json()
    demo_cases = [s for s in simulations if s["slug"] == "contract_breach_demo"]
    assert len(demo_cases) == 1, "Duplicate cases created during seed"
