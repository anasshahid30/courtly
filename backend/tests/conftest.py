import pytest
from app.core.rate_limit import clear_all_rate_limits

@pytest.fixture(autouse=True)
def reset_rate_limits_fixture():
    clear_all_rate_limits()
    yield
    clear_all_rate_limits()
