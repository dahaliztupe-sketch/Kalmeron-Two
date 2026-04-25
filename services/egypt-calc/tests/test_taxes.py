"""
Property-based + golden tests for the Egyptian tax calculator.

Run from the service root:
    cd services/egypt-calc && python -m pytest tests/ -q
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import pytest
from hypothesis import HealthCheck, given, settings, strategies as st

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from taxes import (  # noqa: E402
    INCOME_TAX_BRACKETS,
    PERSONAL_EXEMPTION,
    SI_EMPLOYEE_RATE,
    SI_EMPLOYER_RATE,
    SI_MAX_MONTHLY,
    SI_MIN_MONTHLY,
    income_tax,
    social_insurance,
    total_cost,
)

# ──────────────── Income Tax ────────────────

@given(annual=st.floats(min_value=0, max_value=10_000_000, allow_nan=False, allow_infinity=False))
@settings(max_examples=200, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_income_tax_monotonic(annual: float) -> None:
    """Tax must never decrease as income rises."""
    a = income_tax(annual).annual_tax
    b = income_tax(annual + 1_000).annual_tax
    assert b >= a - 0.01  # 0.01 tolerance for float math


@given(annual=st.floats(min_value=0, max_value=10_000_000, allow_nan=False, allow_infinity=False))
@settings(max_examples=200)
def test_income_tax_bounded(annual: float) -> None:
    """Effective rate stays under the top marginal rate of the brackets."""
    top_rate = max(r for _, r in INCOME_TAX_BRACKETS)
    res = income_tax(annual)
    if annual > 0:
        assert res.effective_rate <= top_rate + 1e-6


def test_income_tax_below_exemption_is_zero() -> None:
    assert income_tax(PERSONAL_EXEMPTION - 1).annual_tax == 0.0
    assert income_tax(0).annual_tax == 0.0


def test_income_tax_negative_raises() -> None:
    with pytest.raises(ValueError):
        income_tax(-1)


def test_income_tax_known_values() -> None:
    """
    Hand-computed reference checks. If the brackets are edited, these will
    fail intentionally so the caller updates the table consciously.
    """
    # 60k → after 20k exemption = 40k taxable
    #   bracket 0  (0–40k): 0%               on 40k → 0
    # remaining 0 → tax = 0
    assert income_tax(60_000).annual_tax == 0.00

    # 100k → after exemption = 80k taxable
    #   bracket 0  (0–40k):  0%    on 40k = 0
    #   bracket 1 (40–55k): 10%    on 15k = 1500
    #   bracket 2 (55–70k): 15%    on 15k = 2250
    #   bracket 3 (70–200k): 20%   on 10k = 2000
    #   total = 5750
    assert income_tax(100_000).annual_tax == pytest.approx(5_750.00, abs=0.5)

    # 220k → after exemption = 200k taxable
    #   0%(40k)=0, 10%(15k)=1500, 15%(15k)=2250, 20%(130k)=26000 → 29 750
    assert income_tax(220_000).annual_tax == pytest.approx(29_750.00, abs=0.5)


# ──────────────── Social Insurance ────────────────

@given(wage=st.floats(min_value=0, max_value=200_000, allow_nan=False, allow_infinity=False))
@settings(max_examples=200)
def test_si_caps_and_floors(wage: float) -> None:
    res = social_insurance(wage)
    assert SI_MIN_MONTHLY <= res.insurable_wage <= SI_MAX_MONTHLY


def test_si_at_cap() -> None:
    res = social_insurance(50_000)
    assert res.insurable_wage == SI_MAX_MONTHLY
    assert res.employee_contribution == pytest.approx(SI_MAX_MONTHLY * SI_EMPLOYEE_RATE, abs=0.01)
    assert res.employer_contribution == pytest.approx(SI_MAX_MONTHLY * SI_EMPLOYER_RATE, abs=0.01)


def test_si_at_floor() -> None:
    res = social_insurance(500)
    assert res.insurable_wage == SI_MIN_MONTHLY


# ──────────────── Total Cost ────────────────

@given(monthly=st.floats(min_value=2_000, max_value=200_000, allow_nan=False, allow_infinity=False))
@settings(max_examples=100)
def test_total_cost_employer_ge_gross(monthly: float) -> None:
    """Employer cost is always ≥ gross salary."""
    res = total_cost(monthly)
    assert res.total_employer_monthly >= res.monthly_gross - 0.01


@given(monthly=st.floats(min_value=2_000, max_value=200_000, allow_nan=False, allow_infinity=False))
@settings(max_examples=100)
def test_total_cost_net_le_gross(monthly: float) -> None:
    """Take-home is always ≤ gross salary."""
    res = total_cost(monthly)
    assert res.monthly_net <= res.monthly_gross + 0.01


def test_total_cost_components_consistent() -> None:
    res = total_cost(15_000, months=12)
    # gross − employee SI − monthly tax = monthly net
    expected_net = (15_000
                    - res.social_insurance.employee_contribution
                    - res.income_tax.monthly_tax)
    assert math.isclose(res.monthly_net, expected_net, abs_tol=0.05)
