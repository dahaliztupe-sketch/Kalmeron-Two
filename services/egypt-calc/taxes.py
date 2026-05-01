"""
Egyptian income tax & social insurance calculator.

Rates encoded here reflect Law 91/2005 with the most recent amendments
(personal-income brackets reshaped in FY 2023/2024). Always cross-check
with `AS_OF` before relying on the output for filings — tax law in Egypt
changes more often than once a year.

This module is INTENTIONALLY pure-functional and deterministic so it can
be exhaustively tested with `hypothesis` (see tests/test_taxes.py). No
LLM is involved — the CFO Agent calls this for the actual numbers and
narrates them in Arabic separately.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

AS_OF = "2025-06-01"  # Bracket configuration valid up to this date.

# ──────────────── Income Tax ────────────────────────────────────────────
# Annual brackets (EGP). Each bracket is (upper_bound_inclusive, marginal_rate).
# A None upper bound means "everything above the previous bracket".
INCOME_TAX_BRACKETS: list[tuple[float | None, float]] = [
    (40_000, 0.00),
    (55_000, 0.10),
    (70_000, 0.15),
    (200_000, 0.20),
    (400_000, 0.225),
    (1_200_000, 0.25),
    (None, 0.275),
]

# Annual personal exemption added on top of bracket-0.
PERSONAL_EXEMPTION = 20_000

# ──────────────── Social Insurance ──────────────────────────────────────
# Egyptian Social Insurance Law 148/2019 — simplified for the most common
# private-sector salaried case. The actual law has many edge cases for
# bonuses, overtime, foreign employees, etc., that we do NOT model here.
SI_EMPLOYEE_RATE = 0.11      # 11 % of insurable wage from employee
SI_EMPLOYER_RATE = 0.1875    # 18.75 % of insurable wage from employer
# Insurable wage caps (monthly, EGP) — recalculated annually by NOSI.
SI_MIN_MONTHLY = 2_000
SI_MAX_MONTHLY = 14_500


# ──────────────── Public API ────────────────────────────────────────────

@dataclass
class IncomeTaxResult:
    annual_gross: float
    taxable_after_exemption: float
    annual_tax: float
    monthly_tax: float
    effective_rate: float            # tax / gross
    marginal_rate: float             # rate of the highest bracket the income reached
    breakdown: list[dict] = field(default_factory=list)
    as_of: str = AS_OF


def income_tax(annual_gross: float) -> IncomeTaxResult:
    """
    Compute Egyptian personal income tax on an annual gross figure (EGP).
    Returns a structured result with bracket-by-bracket breakdown.
    """
    if annual_gross < 0:
        raise ValueError("annual_gross cannot be negative")

    taxable = max(0.0, annual_gross - PERSONAL_EXEMPTION)
    remaining = taxable
    prev_top = 0.0
    total_tax = 0.0
    breakdown: list[dict] = []
    marginal = 0.0

    for upper, rate in INCOME_TAX_BRACKETS:
        if remaining <= 0:
            break
        slice_top = float("inf") if upper is None else float(upper)
        slice_size = max(0.0, slice_top - prev_top)
        slice_taxable = min(remaining, slice_size)
        slice_tax = slice_taxable * rate
        if slice_taxable > 0:
            breakdown.append({
                "from": prev_top,
                "to": None if upper is None else upper,
                "rate": rate,
                "taxable_in_bracket": round(slice_taxable, 2),
                "tax_in_bracket": round(slice_tax, 2),
            })
            marginal = rate
        total_tax += slice_tax
        remaining -= slice_taxable
        prev_top = slice_top

    effective = (total_tax / annual_gross) if annual_gross > 0 else 0.0
    return IncomeTaxResult(
        annual_gross=round(annual_gross, 2),
        taxable_after_exemption=round(taxable, 2),
        annual_tax=round(total_tax, 2),
        monthly_tax=round(total_tax / 12, 2),
        effective_rate=round(effective, 6),
        marginal_rate=marginal,
        breakdown=breakdown,
    )


@dataclass
class SocialInsuranceResult:
    monthly_wage: float
    insurable_wage: float
    employee_contribution: float
    employer_contribution: float
    total_contribution: float
    employer_total_cost: float       # gross + employer SI
    net_after_employee_si: float     # gross − employee SI (no income tax yet)
    notes: str
    as_of: str = AS_OF


def social_insurance(monthly_wage: float) -> SocialInsuranceResult:
    """
    Compute monthly social insurance contributions on a single salary.
    Caps the insurable wage at SI_MAX_MONTHLY; floors at SI_MIN_MONTHLY.
    """
    if monthly_wage < 0:
        raise ValueError("monthly_wage cannot be negative")

    insurable = max(SI_MIN_MONTHLY, min(SI_MAX_MONTHLY, monthly_wage))
    emp = insurable * SI_EMPLOYEE_RATE
    er = insurable * SI_EMPLOYER_RATE

    notes_parts = []
    if monthly_wage > SI_MAX_MONTHLY:
        notes_parts.append(
            f"insurable wage capped at {SI_MAX_MONTHLY} EGP "
            f"(actual {round(monthly_wage)} EGP)"
        )
    if monthly_wage < SI_MIN_MONTHLY:
        notes_parts.append(
            f"insurable wage raised to floor {SI_MIN_MONTHLY} EGP"
        )

    return SocialInsuranceResult(
        monthly_wage=round(monthly_wage, 2),
        insurable_wage=round(insurable, 2),
        employee_contribution=round(emp, 2),
        employer_contribution=round(er, 2),
        total_contribution=round(emp + er, 2),
        employer_total_cost=round(monthly_wage + er, 2),
        net_after_employee_si=round(monthly_wage - emp, 2),
        notes="; ".join(notes_parts) or "standard calculation",
    )


@dataclass
class TotalCostResult:
    monthly_gross: float
    annual_gross: float
    income_tax: IncomeTaxResult
    social_insurance: SocialInsuranceResult
    monthly_net: float           # take-home after employee SI + monthly income tax
    annual_net: float            # take-home for the year
    total_employer_monthly: float
    total_employer_annual: float
    as_of: str = AS_OF


def total_cost(monthly_gross: float,
               months: Literal[12, 13, 14] = 12) -> TotalCostResult:
    """
    End-to-end calculator: monthly gross → take-home + true employer cost.
    `months` accounts for 13th/14th salary practices common in Egypt.
    """
    if monthly_gross < 0:
        raise ValueError("monthly_gross cannot be negative")

    annual_gross = monthly_gross * months
    it = income_tax(annual_gross)
    si = social_insurance(monthly_gross)

    monthly_net = monthly_gross - si.employee_contribution - it.monthly_tax
    annual_net = monthly_net * months
    employer_monthly = monthly_gross + si.employer_contribution
    employer_annual = employer_monthly * months

    return TotalCostResult(
        monthly_gross=round(monthly_gross, 2),
        annual_gross=round(annual_gross, 2),
        income_tax=it,
        social_insurance=si,
        monthly_net=round(monthly_net, 2),
        annual_net=round(annual_net, 2),
        total_employer_monthly=round(employer_monthly, 2),
        total_employer_annual=round(employer_annual, 2),
    )


# ──────────────── VAT Calculator ────────────────────────────────────────
# Egyptian VAT Law 67/2016 — standard rate 14% since July 2017.
# Reduced rate 5% applies to certain goods (basic food items excluded from VAT).
STANDARD_VAT_RATE = 0.14   # 14% — general rate
REDUCED_VAT_RATE  = 0.05   # 5% — selected goods / services


@dataclass
class VATResult:
    base_amount: float
    vat_rate: float
    vat_amount: float
    total_with_vat: float
    is_inclusive: bool       # True: base already includes VAT
    net_before_vat: float    # actual pre-tax amount
    as_of: str = AS_OF


def vat(amount: float, rate: float = STANDARD_VAT_RATE, inclusive: bool = False) -> VATResult:
    """
    Compute VAT on an amount.
    `inclusive=True` means `amount` already contains the VAT (reverse-calculate).
    """
    if amount < 0:
        raise ValueError("amount cannot be negative")
    if not (0 < rate < 1):
        raise ValueError("rate must be between 0 and 1 exclusive")

    if inclusive:
        net_before = amount / (1 + rate)
        vat_amount = amount - net_before
        total = amount
    else:
        net_before = amount
        vat_amount = amount * rate
        total = amount + vat_amount

    return VATResult(
        base_amount=round(amount, 2),
        vat_rate=rate,
        vat_amount=round(vat_amount, 2),
        total_with_vat=round(total, 2),
        is_inclusive=inclusive,
        net_before_vat=round(net_before, 2),
    )


# ──────────────── Fawry Payment Fees ───────────────────────────────────
# Fawry fees are charged to payers at point of collection (not to merchant
# directly). This is a simplified model — actual fees vary by agreement.
FAWRY_FEE_MIN = 1.50          # EGP — minimum flat fee
FAWRY_FEE_MAX = 15.00         # EGP — per-transaction cap
FAWRY_FEE_RATE = 0.01         # 1% of transaction value
FAWRY_VAT_ON_FEE_RATE = 0.14  # 14% VAT on the Fawry service fee itself

# Instapay / Meeza typical inter-bank fee structure
INSTAPAY_FEE_RATE = 0.005   # 0.5%
INSTAPAY_FEE_MAX  = 10.0    # EGP cap


@dataclass
class PaymentFeeResult:
    transaction_amount: float
    service: str
    fee_before_vat: float
    vat_on_fee: float
    total_fee: float
    payer_pays: float        # amount + total_fee
    merchant_receives: float # amount − merchant_discount (for MDR-based fees)
    notes: str
    as_of: str = AS_OF


def fawry_fee(transaction_amount: float, merchant_discount_rate: float = 0.015) -> PaymentFeeResult:
    """
    Estimate Fawry payer-side fee + MDR deducted from merchant proceeds.
    `merchant_discount_rate` defaults to 1.5% (typical Fawry Plus agreement).
    """
    if transaction_amount < 0:
        raise ValueError("transaction_amount cannot be negative")

    raw_fee = max(FAWRY_FEE_MIN, min(FAWRY_FEE_MAX, transaction_amount * FAWRY_FEE_RATE))
    vat_on_fee = raw_fee * FAWRY_VAT_ON_FEE_RATE
    total_fee = raw_fee + vat_on_fee
    payer_pays = transaction_amount + total_fee

    mdr = transaction_amount * merchant_discount_rate
    merchant_receives = transaction_amount - mdr

    return PaymentFeeResult(
        transaction_amount=round(transaction_amount, 2),
        service="Fawry",
        fee_before_vat=round(raw_fee, 2),
        vat_on_fee=round(vat_on_fee, 2),
        total_fee=round(total_fee, 2),
        payer_pays=round(payer_pays, 2),
        merchant_receives=round(merchant_receives, 2),
        notes=f"MDR {merchant_discount_rate*100:.1f}% | fee capped at {FAWRY_FEE_MAX} EGP",
    )


def instapay_fee(transaction_amount: float) -> PaymentFeeResult:
    """Estimate InstaPay inter-bank transfer fee (0.5%, capped at 10 EGP)."""
    if transaction_amount < 0:
        raise ValueError("transaction_amount cannot be negative")

    raw_fee = min(INSTAPAY_FEE_MAX, transaction_amount * INSTAPAY_FEE_RATE)
    vat_on_fee = raw_fee * FAWRY_VAT_ON_FEE_RATE
    total_fee = raw_fee + vat_on_fee

    return PaymentFeeResult(
        transaction_amount=round(transaction_amount, 2),
        service="InstaPay",
        fee_before_vat=round(raw_fee, 2),
        vat_on_fee=round(vat_on_fee, 2),
        total_fee=round(total_fee, 2),
        payer_pays=round(transaction_amount + total_fee, 2),
        merchant_receives=round(transaction_amount, 2),  # InstaPay: payer bears fee
        notes=f"0.5% capped at {INSTAPAY_FEE_MAX} EGP + 14% VAT on fee",
    )
