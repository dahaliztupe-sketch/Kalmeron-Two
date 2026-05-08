"""
Egyptian tax/legal calculator — FastAPI sidecar.

Endpoints:
  GET  /health                         → liveness probe
  POST /income-tax  {annual_gross}    → IncomeTaxResult
  POST /social-insurance {monthly_wage}→ SocialInsuranceResult
  POST /total-cost  {monthly_gross, months?} → TotalCostResult

Run locally:
  cd services/egypt-calc
  uvicorn main:app --host 0.0.0.0 --port 8008
"""

from __future__ import annotations

import logging
from dataclasses import asdict
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from taxes import (
    AS_OF,
    STANDARD_VAT_RATE,
    REDUCED_VAT_RATE,
    income_tax,
    social_insurance,
    total_cost,
    vat,
    fawry_fee,
    instapay_fee,
)

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("egypt-calc")

app = FastAPI(title="Kalmeron Egypt Calc", version="1.0.0")

# CORS: قابل للتكوين عبر env var. الافتراضي محصور بالـ main app
# في dev (localhost:5000) — في الإنتاج عيّن EGYPT_CALC_CORS بقيم محدّدة.
import os as _os
import time as _time
import psutil as _psutil
_START_TIME = _time.time()
_PROCESS = _psutil.Process()

_DEFAULT_CORS = (
    "http://localhost:5000,"
    "https://*.replit.dev,"
    "https://*.replit.app,"
    "https://*.repl.co"
)
# Supports shared ALLOWED_ORIGINS, then service-specific EGYPT_CALC_CORS, then default.
_raw_cors = _os.getenv("ALLOWED_ORIGINS") or _os.getenv("EGYPT_CALC_CORS", _DEFAULT_CORS)
_origins = [o.strip() for o in _raw_cors.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://.*\.(replit\.dev|replit\.app|repl\.co)$",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
log.info("CORS origins: %s (+ replit regex wildcard)", _origins)


class IncomeTaxIn(BaseModel):
    annual_gross: float = Field(..., ge=0, description="Gross annual salary in EGP")


class SocialInsuranceIn(BaseModel):
    monthly_wage: float = Field(..., ge=0, description="Monthly wage in EGP")


class TotalCostIn(BaseModel):
    monthly_gross: float = Field(..., ge=0, description="Monthly gross salary in EGP")
    months: Literal[12, 13, 14] = 12


class VATIn(BaseModel):
    amount: float = Field(..., ge=0, description="Amount in EGP")
    rate: float = Field(STANDARD_VAT_RATE, gt=0, lt=1, description="VAT rate (e.g. 0.14 for 14%)")
    inclusive: bool = Field(False, description="True if amount already includes VAT")


class FawryFeeIn(BaseModel):
    transaction_amount: float = Field(..., ge=0, description="Transaction amount in EGP")
    merchant_discount_rate: float = Field(0.015, ge=0, lt=1,
                                          description="Merchant discount rate (default 1.5%)")


class InstapayFeeIn(BaseModel):
    transaction_amount: float = Field(..., ge=0, description="Transaction amount in EGP")


@app.get("/health")
def health() -> dict:
    mem = _PROCESS.memory_info()
    return {
        "ok": True,
        "status": "ok",
        "service": "egypt-calc",
        "version": app.version,
        "uptime_seconds": round(_time.time() - _START_TIME, 1),
        "memory_rss_mb": round(mem.rss / 1024 / 1024, 1),
        "asOf": AS_OF,
        "endpoints": [
            "/income-tax", "/social-insurance", "/total-cost",
            "/vat", "/fawry-fee", "/instapay-fee",
        ],
    }


@app.post("/income-tax")
def calc_income_tax(body: IncomeTaxIn) -> dict:
    try:
        return asdict(income_tax(body.annual_gross))
    except ValueError as e:
        raise HTTPException(400, str(e)) from e


@app.post("/social-insurance")
def calc_social_insurance(body: SocialInsuranceIn) -> dict:
    try:
        return asdict(social_insurance(body.monthly_wage))
    except ValueError as e:
        raise HTTPException(400, str(e)) from e


@app.post("/total-cost")
def calc_total_cost(body: TotalCostIn) -> dict:
    try:
        return asdict(total_cost(body.monthly_gross, body.months))
    except ValueError as e:
        raise HTTPException(400, str(e)) from e


@app.post("/vat")
def calc_vat(body: VATIn) -> dict:
    """حساب ضريبة القيمة المضافة المصرية (14% أو 5% للسلع المخففة)"""
    try:
        return asdict(vat(body.amount, body.rate, body.inclusive))
    except ValueError as e:
        raise HTTPException(400, str(e)) from e


@app.get("/vat/rates")
def vat_rates() -> dict:
    return {
        "standard": STANDARD_VAT_RATE,
        "reduced": REDUCED_VAT_RATE,
        "currency": "EGP",
        "law": "Law 67/2016",
        "asOf": AS_OF,
    }


@app.post("/fawry-fee")
def calc_fawry_fee(body: FawryFeeIn) -> dict:
    """حساب رسوم فوري للعميل والتاجر"""
    try:
        return asdict(fawry_fee(body.transaction_amount, body.merchant_discount_rate))
    except ValueError as e:
        raise HTTPException(400, str(e)) from e


@app.post("/instapay-fee")
def calc_instapay_fee(body: InstapayFeeIn) -> dict:
    """حساب رسوم إنستاباي / ميزة"""
    try:
        return asdict(instapay_fee(body.transaction_amount))
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
