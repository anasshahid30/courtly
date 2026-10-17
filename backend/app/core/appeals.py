
APPEAL_OPEN = "open"
APPEAL_UPHELD = "upheld"
APPEAL_REJECTED = "rejected"

VALID_APPEAL_STATUSES: set[str] = {
    APPEAL_OPEN,
    APPEAL_UPHELD,
    APPEAL_REJECTED,
}

VALID_DECISIONS: set[str] = {
    APPEAL_UPHELD,
    APPEAL_REJECTED,
}


def can_appeal_session(session_status: str) -> bool:
    """
    Appeals are only permitted for sessions that have reached COMPLETED status.
    """
    return session_status.upper() == "COMPLETED"


def validate_decision(decision: str) -> str:
    """
    Validates and normalizes resolution decisions.
    Must be either 'upheld' or 'rejected'.
    """
    norm = decision.lower().strip()
    if norm not in VALID_DECISIONS:
        raise ValueError(f"Decision must be one of {sorted(VALID_DECISIONS)}, got '{decision}'")
    return norm
