
# Speaker types allowed in courtroom trial turns
SPEAKER_LEARNER = "learner"
SPEAKER_JUDGE = "judge"
SPEAKER_OPPOSING_COUNSEL = "opposing_counsel"
SPEAKER_WITNESS = "witness"

VALID_SPEAKER_TYPES: set[str] = {
    SPEAKER_LEARNER,
    SPEAKER_JUDGE,
    SPEAKER_OPPOSING_COUNSEL,
    SPEAKER_WITNESS,
}

# Objection types allowed during trial proceedings
OBJECTION_HEARSAY = "hearsay"
OBJECTION_LEADING = "leading"
OBJECTION_RELEVANCE = "relevance"
OBJECTION_SPECULATION = "speculation"
OBJECTION_ARGUMENTATIVE = "argumentative"
OBJECTION_OTHER = "other"

VALID_OBJECTION_TYPES: set[str] = {
    OBJECTION_HEARSAY,
    OBJECTION_LEADING,
    OBJECTION_RELEVANCE,
    OBJECTION_SPECULATION,
    OBJECTION_ARGUMENTATIVE,
    OBJECTION_OTHER,
}

# Objection rulings
RULING_PENDING = "pending"
RULING_SUSTAINED = "sustained"
RULING_OVERRULED = "overruled"

VALID_RULINGS: set[str] = {
    RULING_PENDING,
    RULING_SUSTAINED,
    RULING_OVERRULED,
}

# Stage constraints
MIN_STAGE = 0
MAX_STAGE = 5


def advance_stage(current: int) -> int:
    """
    Advances the trial proceeding to the next stage index, capped at MAX_STAGE (5).
    """
    if current < MAX_STAGE:
        return current + 1
    return MAX_STAGE


def is_session_active(status: str) -> bool:
    """
    Verifies that a trial session is in an active (IN_PROGRESS) state.
    """
    return status.upper() == "IN_PROGRESS"
