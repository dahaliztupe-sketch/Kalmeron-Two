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
    income_tax,
    social_insurance,
    total_cost,
)

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("egypt-calc")

app = FastAPI(title="Kalmeron Egypt Calc", version="1.0.0")

# CORS: قابل للتكوين عبر env var. الافتراضي محصور بالـ main app
# في dev (localhost:5000) — في الإنتاج عيّن EGYPT_CALC_CORS بقيم محدّدة.
import os as _os
_origins = [o.strip() for o in _os.getenv("EGYPT_CALC_CORS", "http://localhost:5000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class IncomeTaxIn(BaseModel):
    annual_gross: float = Field(..., ge=0, description="Gross annual salary in EGP")


class SocialInsuranceIn(BaseModel):
    monthly_wage: float = Field(..., ge=0, description="Monthly wage in EGP")


class TotalCostIn(BaseModel):
    monthly_gross: float = Field(..., ge=0, description="Monthly gross salary in EGP")
    months: Literal[12, 13, 14] = 12


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "egypt-calc", "version": app.version, "asOf": AS_OF}


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
