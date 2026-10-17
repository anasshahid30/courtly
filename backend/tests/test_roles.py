import subprocess
import sys
import uuid

from fastapi.testclient import TestClient

from app.core.roles import ROLE_ADMIN, ROLE_LEARNER
from app.main import app
from app.manage import make_admin

client = TestClient(app)


def register_and_login(email: str, password: str = "StrongPassword123!") -> str:
    """Helper to register a user and return their access token."""
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Advocate User"},
    )
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    return res.json()["access_token"]


def test_registered_user_defaults_to_learner_role():
    """Newly registered users must have role 'learner' by default."""
    email = f"learner_default_{uuid.uuid4().hex[:8]}@courtly.dev"
    token = register_and_login(email)

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["role"] == ROLE_LEARNER


def test_learner_gets_403_on_admin_route():
    """A user with role 'learner' receives 403 on an admin-only route."""
    email = f"learner_forbidden_{uuid.uuid4().hex[:8]}@courtly.dev"
    token = register_and_login(email)

    res = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_admin_gets_200_on_admin_route():
    """An admin user can successfully access an admin-only route."""
    email = f"admin_allowed_{uuid.uuid4().hex[:8]}@courtly.dev"
    token = register_and_login(email)

    # Initially learner -> gets 403
    res_before = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert res_before.status_code == 403

    # Promote to admin
    success = make_admin(email)
    assert success is True

    # Now admin -> gets 200
    res_after = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert res_after.status_code == 200
    data = res_after.json()
    assert data["status"] == "ok"
    assert data["admin_email"] == email
    assert data["role"] == ROLE_ADMIN


def test_manage_py_make_admin_cli():
    """backend/app/manage.py make-admin command from CLI promotes existing user and fails on nonexistent."""
    email = f"cli_admin_{uuid.uuid4().hex[:8]}@courtly.dev"
    token = register_and_login(email)

    # 1. Promote existing user via subprocess CLI
    res = subprocess.run(
        [sys.executable, "app/manage.py", "make-admin", email],
        capture_output=True,
        text=True,
        check=False,
    )
    assert res.returncode == 0
    assert "promoted to admin" in res.stdout

    # Verify access to admin route
    admin_check = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert admin_check.status_code == 200

    # 2. Try promoting non-existent user
    non_existent = f"ghost_{uuid.uuid4().hex[:8]}@courtly.dev"
    res_fail = subprocess.run(
        [sys.executable, "app/manage.py", "make-admin", non_existent],
        capture_output=True,
        text=True,
        check=False,
    )
    assert res_fail.returncode == 1
    assert "not found" in res_fail.stdout
