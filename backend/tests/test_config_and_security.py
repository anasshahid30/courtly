import subprocess
import sys
import uuid

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.config import DEV_DEFAULT_SECRET, Settings
from app.core.rate_limit import clear_all_rate_limits
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def cleanup_rate_limits():
    """Ensure in-memory rate limits are clean before and after each test."""
    clear_all_rate_limits()
    yield
    clear_all_rate_limits()


def test_production_without_jwt_secret_fails_to_start():
    """App/Settings must refuse to start in production if JWT_SECRET is missing or default."""
    # 1. Missing / empty secret in production
    with pytest.raises(ValidationError) as exc_empty:
        Settings(COURTLY_ENV="production", JWT_SECRET="")
    assert "Production configuration error" in str(exc_empty.value)

    # 2. Development default secret in production
    with pytest.raises(ValidationError) as exc_default:
        Settings(COURTLY_ENV="production", JWT_SECRET=DEV_DEFAULT_SECRET)
    assert "Production configuration error" in str(exc_default.value)

    # 3. Subprocess verification that app fails to import/start under production without secret
    python_code = "import os; os.environ['COURTLY_ENV'] = 'production'; os.environ.pop('JWT_SECRET', None); from app.core.config import Settings; Settings()"
    res = subprocess.run(
        [sys.executable, "-c", python_code],
        capture_output=True,
        text=True,
        check=False,
    )
    assert res.returncode != 0
    assert "Production configuration error" in res.stderr


def test_production_with_valid_jwt_secret_succeeds():
    """Settings initializes cleanly in production when a secure custom secret is supplied."""
    cfg = Settings(COURTLY_ENV="production", JWT_SECRET="production-super-secret-key-32chars")
    assert cfg.COURTLY_ENV == "production"
    assert cfg.JWT_SECRET == "production-super-secret-key-32chars"


def test_invalid_email_in_register_returns_422():
    """Registering with an invalid email address format returns HTTP 422."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-a-valid-email",
            "password": "StrongPassword123!",
            "full_name": "Invalid Email User",
        },
    )
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_sixth_failed_login_returns_429():
    """After 5 failed login attempts for the same email within 15 minutes, the 6th returns 429."""
    email = f"ratelimit_{uuid.uuid4().hex[:8]}@courtly.dev"
    password = "CorrectPassword123!"

    # Register user
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Rate Limit Test"},
    )
    assert reg.status_code == 201

    # First 5 failed login attempts return 401
    for attempt in range(1, 6):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "WrongPassword!"},
        )
        assert res.status_code == 401, f"Attempt {attempt} should return 401, got {res.status_code}"
        assert res.json()["detail"] == "Invalid email or password"

    # Sixth failed login attempt returns 429
    res6 = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword!"},
    )
    assert res6.status_code == 429
    assert "Too many failed login attempts" in res6.json()["detail"]


def test_successful_login_resets_rate_limit_count():
    """A successful login resets the failed login attempt counter."""
    email = f"reset_limit_{uuid.uuid4().hex[:8]}@courtly.dev"
    password = "CorrectPassword123!"

    # Register user
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Reset Count User"},
    )
    assert reg.status_code == 201

    # 4 failed attempts
    for _ in range(4):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "WrongPassword!"},
        )
        assert res.status_code == 401

    # Successful login resets the counter
    success_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert success_res.status_code == 200
    assert "access_token" in success_res.json()

    # The next failed attempt should return 401, NOT 429, since counter was reset
    post_reset_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword!"},
    )
    assert post_reset_res.status_code == 401
