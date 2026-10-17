from collections import defaultdict
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException

# In-memory storage of failed login attempt timestamps per email.
# Maps normalized lowercase email -> list of failure UTC datetimes.
#
# NOTE: This in-memory store resets whenever the server restarts and is
# not shared across multiple worker processes. A production system would
# store these attempt records in a persistent store or distributed cache
# such as Redis or PostgreSQL.
_failed_attempts: dict[str, list[datetime]] = defaultdict(list)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_WINDOW = timedelta(minutes=15)


def check_login_rate_limit(email: str) -> None:
    """
    Checks if an email has accumulated 5 or more failed login attempts
    within the last 15 minutes. If so, raises HTTP 429.
    """
    normalized = email.lower().strip()
    now = datetime.now(UTC)
    cutoff = now - LOCKOUT_WINDOW

    # Filter out timestamps older than 15 minutes
    valid_attempts = [ts for ts in _failed_attempts[normalized] if ts > cutoff]
    _failed_attempts[normalized] = valid_attempts

    if len(valid_attempts) >= MAX_FAILED_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Too many failed login attempts. Please try again in 15 minutes.",
        )


def record_failed_login(email: str) -> None:
    """
    Records a failed login attempt timestamp for an email.
    """
    normalized = email.lower().strip()
    now = datetime.now(UTC)
    cutoff = now - LOCKOUT_WINDOW
    valid_attempts = [ts for ts in _failed_attempts[normalized] if ts > cutoff]
    valid_attempts.append(now)
    _failed_attempts[normalized] = valid_attempts


def reset_failed_logins(email: str) -> None:
    """
    Resets the failed login counter for an email upon a successful login.
    """
    normalized = email.lower().strip()
    _failed_attempts.pop(normalized, None)


def clear_all_rate_limits() -> None:
    """
    Clears all recorded rate limits. Useful for test cleanup.
    """
    _failed_attempts.clear()
