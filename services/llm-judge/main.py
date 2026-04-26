"""
LLM-as-judge sidecar — evaluates an {question, answer} pair against a
named rubric and returns a 0..1 score plus per-criterion breakdown.

Modes:
  • If GEMINI_API_KEY is set → calls `gemini-2.5-flash-lite` (cheap, fast).
  • Otherwise → falls back to deterministic stub scoring so dev/CI still work.

Endpoints:
  GET  /health            → liveness + mode (real|stub)
  GET  /rubrics           → list available rubrics + criteria
  POST /judge             → score one pair
  POST /judge/batch       → score N pairs in one request

Run:
  cd services/llm-judge
  uvicorn main:app --host 0.0.0.0 --port 8080
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from judges import RUBRICS, get_rubric, list_rubrics

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("llm-judge")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
JUDGE_MODEL = os.environ.get("JUDGE_MODEL", "gemini-2.5-flash-lite").strip()
MODE = "real" if GEMINI_API_KEY else "stub"

_gemini = None
if MODE == "real":
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini = genai.GenerativeModel(JUDGE_MODEL)
        log.info("LLM judge: real mode, model=%s", JUDGE_MODEL)
    except Exception as e:  # noqa: BLE001
        log.warning("LLM judge: failed to init Gemini (%s) — falling back to stub", e)
        MODE = "stub"
        _gemini = None
else:
    log.info("LLM judge: stub mode (no GEMINI_API_KEY)")

app = FastAPI(title="Kalmeron LLM Judge", version="1.0.0")

# CORS: قابل للتكوين. الافتراضي محصور بـ main app في dev.
_origins = [o.strip() for o in os.getenv("LLM_JUDGE_CORS", "http://localhost:5000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class JudgeIn(BaseModel):
    question: str = Field(..., min_length=1, max_length=8_000)
    answer: str = Field(..., max_length=20_000)
    rubric: str = Field(..., description="One of the rubric names from /rubrics")


class JudgeOut(BaseModel):
    rubric: str
    mode: str                  # "real" | "stub"
    score: float
    criteria_scores: dict[str, float]
    reasoning: str


class JudgeBatchIn(BaseModel):
    items: list[JudgeIn] = Field(..., min_length=1, max_length=64)


class JudgeBatchOut(BaseModel):
    mode: str
    results: list[JudgeOut]


# ──────────────── Real-mode helpers ────────────────

JSON_BLOCK = re.compile(r"\{[\s\S]*\}")


def _real_judge(question: str, answer: str, rubric_name: str) -> dict[str, Any]:
    rubric = get_rubric(rubric_name)
    criteria_list = ", ".join(c[0] for c in rubric.criteria)
    prompt = rubric.prompt_template.format(
        criteria_list=criteria_list,
        question=question,
        answer=answer,
    )
    try:
        resp = _gemini.generate_content(  # type: ignore[union-attr]
            prompt,
            generation_config={
                "temperature": 0.0,
                "max_output_tokens": 400,
                "response_mime_type": "application/json",
            },
        )
        text = (resp.text or "").strip()
    except Exception as e:  # noqa: BLE001
        log.warning("Gemini call failed (%s) — using stub", e)
        return rubric.stub_score(question, answer)

    # Be tolerant: Gemini sometimes wraps JSON in extra prose.
    match = JSON_BLOCK.search(text)
    if not match:
        log.warning("Judge model returned non-JSON: %r", text[:200])
        return rubric.stub_score(question, answer)
    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        log.warning("Judge JSON parse failed: %r", match.group(0)[:200])
        return rubric.stub_score(question, answer)

    score = float(parsed.get("score", 0.5))
    score = max(0.0, min(1.0, score))
    criteria_scores = {
        str(k): max(0.0, min(1.0, float(v)))
        for k, v in (parsed.get("criteria_scores") or {}).items()
    }
    if not criteria_scores:
        criteria_scores = {c[0]: score for c in rubric.criteria}
    reasoning = str(parsed.get("reasoning", ""))[:1000]
    return {"score": score, "criteria_scores": criteria_scores, "reasoning": reasoning}


# ──────────────── Endpoints ────────────────

@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "llm-judge", "version": app.version, "mode": MODE, "model": JUDGE_MODEL}


@app.get("/rubrics")
def rubrics() -> dict:
    return {"rubrics": list_rubrics(), "mode": MODE}


@app.post("/judge", response_model=JudgeOut)
def judge_one(body: JudgeIn) -> JudgeOut:
    if body.rubric not in RUBRICS:
        raise HTTPException(400, f"unknown rubric '{body.rubric}'. See /rubrics.")
    if MODE == "real":
        result = _real_judge(body.question, body.answer, body.rubric)
    else:
        result = get_rubric(body.rubric).stub_score(body.question, body.answer)
    return JudgeOut(rubric=body.rubric, mode=MODE, **result)


@app.post("/judge/batch", response_model=JudgeBatchOut)
def judge_batch(body: JudgeBatchIn) -> JudgeBatchOut:
    out: list[JudgeOut] = []
    for item in body.items:
        if item.rubric not in RUBRICS:
            raise HTTPException(400, f"unknown rubric '{item.rubric}'. See /rubrics.")
        if MODE == "real":
            r = _real_judge(item.question, item.answer, item.rubric)
        else:
            r = get_rubric(item.rubric).stub_score(item.question, item.answer)
        out.append(JudgeOut(rubric=item.rubric, mode=MODE, **r))
    return JudgeBatchOut(mode=MODE, results=out)
