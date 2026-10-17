
CRITERION_WEIGHTS: dict[str, int] = {
    "anticipating_counter_moves": 12,
    "knowing_when_not_to_fight": 10,
    "radical_clarity": 15,
    "commercial_acumen": 12,
    "unshakable_credibility": 13,
    "empathy_self_control": 8,
    "fact_nuance": 15,
    "evidence_handling": 15,
}

REQUIRED_CRITERIA = set(CRITERION_WEIGHTS.keys())
PASS_OVERALL_THRESHOLD = 85.0
MIN_CRITERION_SCORE = 40.0


def calculate_overall_score(criterion_scores: dict[str, float]) -> float:
    """
    Calculates overall score: sum(weight * score) / 100
    """
    total = sum(CRITERION_WEIGHTS[code] * criterion_scores[code] for code in CRITERION_WEIGHTS)
    return round(total / 100.0, 4)


def is_session_passed(criterion_scores: dict[str, float]) -> tuple[bool, float]:
    """
    A session passes only if overall >= 85 AND no criterion is below 40.
    Returns (passed, overall_score).
    """
    overall = calculate_overall_score(criterion_scores)
    no_criterion_below_min = all(score >= MIN_CRITERION_SCORE for score in criterion_scores.values())
    passed = (overall >= PASS_OVERALL_THRESHOLD) and no_criterion_below_min
    return passed, overall
