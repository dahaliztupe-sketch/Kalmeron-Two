"""
LLM-as-judge sidecar — evaluates an {question, answer} pair against a
named rubric and returns a 0..1 score plus per-criterion breakdown.

Modes:
  • If AI_INTEGRATIONS_GEMINI_BASE_URL + AI_INTEGRATIONS_GEMINI_API_KEY are set
    (Replit AI Integrations) → calls the proxied Gemini endpoint.
  • Else if GEMINI_API_KEY is set → calls Google AI Studio directly.
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

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from judges import RUBRICS, get_rubric, list_rubrics

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("llm-judge")

# ──────────────── Provider config ────────────────
# Provider priority (first one with a valid key wins):
#   1. Replit AI Integrations proxy (Gemini, no own key needed)
#   2. OpenRouter (200+ models, free Llama/DeepSeek tiers available)
#   3. Groq (very fast Llama, free tier)
#   4. Google AI Studio direct (Gemini)
#   5. Stub (deterministic fallback so dev/CI work without any key)
_AI_BASE = os.environ.get("AI_INTEGRATIONS_GEMINI_BASE_URL", "").strip().rstrip("/")
_AI_KEY = os.environ.get("AI_INTEGRATIONS_GEMINI_API_KEY", "").strip()
_OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY", "").strip()
_GROQ_KEY = os.environ.get("GROQ_API_KEY", "").strip()
_GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

# Default model — overridden per-provider below to use the right native id.
JUDGE_MODEL = os.environ.get("JUDGE_MODEL", "gemini-2.5-flash").strip()

# Replit's AI Integrations proxy supports a fixed list of Gemini models.
# If the configured model isn't in the list, transparently map it to the
# nearest supported equivalent for the proxy provider only.
_AI_INTEGRATIONS_MODEL_ALIASES = {
    "gemini-2.5-flash-lite": "gemini-2.5-flash",
    "gemini-1.5-flash": "gemini-2.5-flash",
    "gemini-1.5-pro": "gemini-2.5-pro",
}

# Default models per provider when JUDGE_MODEL is left at its Gemini default.
# Caller can override by setting JUDGE_MODEL explicitly.
_DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free"
_DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"

if _AI_BASE and _AI_KEY:
    PROVIDER = "ai_integrations"
    _resolved = _AI_INTEGRATIONS_MODEL_ALIASES.get(JUDGE_MODEL, JUDGE_MODEL)
    if _resolved != JUDGE_MODEL:
        log.info("LLM judge: remapped unsupported model %s → %s for AI Integrations proxy",
                 JUDGE_MODEL, _resolved)
        JUDGE_MODEL = _resolved
    _ENDPOINT = f"{_AI_BASE}/models/{JUDGE_MODEL}:generateContent"
    _API_KEY = _AI_KEY
    MODE = "real"
    log.info("LLM judge: real mode via Replit AI Integrations, model=%s", JUDGE_MODEL)
elif _OPENROUTER_KEY:
    PROVIDER = "openrouter"
    if JUDGE_MODEL.startswith("gemini"):
        JUDGE_MODEL = _DEFAULT_OPENROUTER_MODEL
    _ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
    _API_KEY = _OPENROUTER_KEY
    MODE = "real"
    log.info("LLM judge: real mode via OpenRouter, model=%s", JUDGE_MODEL)
elif _GROQ_KEY:
    PROVIDER = "groq"
    if JUDGE_MODEL.startswith("gemini"):
        JUDGE_MODEL = _DEFAULT_GROQ_MODEL
    _ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
    _API_KEY = _GROQ_KEY
    MODE = "real"
    log.info("LLM judge: real mode via Groq, model=%s", JUDGE_MODEL)
elif _GEMINI_KEY:
    PROVIDER = "google_ai"
    _ENDPOINT = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{JUDGE_MODEL}:generateContent"
    )
    _API_KEY = _GEMINI_KEY
    MODE = "real"
    log.info("LLM judge: real mode via Google AI Studio, model=%s", JUDGE_MODEL)
else:
    PROVIDER = "stub"
    _ENDPOINT = ""
    _API_KEY = ""
    MODE = "stub"
    log.info("LLM judge: stub mode (no LLM provider configured)")

_TIMEOUT = float(os.environ.get("JUDGE_TIMEOUT_S", "20"))
_HTTP = httpx.Client(timeout=_TIMEOUT)

app = FastAPI(title="Kalmeron LLM Judge", version="1.1.0")

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


def _gemini_call(prompt: str) -> str:
    """Send a single-turn prompt to the configured Gemini endpoint and return the text."""
    # Disable "thinking" so the small output budget isn't consumed by hidden
    # reasoning tokens — the judge only needs a short structured JSON reply.
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 1024,
            "responseMimeType": "application/json",
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }
    headers = {"Content-Type": "application/json", "x-goog-api-key": _API_KEY}
    r = _HTTP.post(_ENDPOINT, json=payload, headers=headers)
    r.raise_for_status()
    data = r.json()
    parts = (
        (data.get("candidates") or [{}])[0]
        .get("content", {})
        .get("parts", [])
    )
    return "".join(p.get("text", "") for p in parts).strip()


def _openai_compat_call(prompt: str) -> str:
    """Single-turn call against an OpenAI-compatible chat/completions endpoint
    (OpenRouter, Groq, and friends). Returns the response text or raises on
    non-2xx. We force `response_format=json_object` so the rubric parser sees
    a JSON body even on chatty models.
    """
    payload = {
        "model": JUDGE_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens": 1024,
        "response_format": {"type": "json_object"},
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {_API_KEY}",
    }
    if PROVIDER == "openrouter":
        # OpenRouter recommends these for analytics + rate-limit fairness.
        headers["HTTP-Referer"] = os.environ.get("NEXT_PUBLIC_SITE_URL", "https://kalmeron.com")
        headers["X-Title"] = "Kalmeron LLM Judge"
    r = _HTTP.post(_ENDPOINT, json=payload, headers=headers)
    r.raise_for_status()
    data = r.json()
    choices = data.get("choices") or []
    if not choices:
        return ""
    msg = choices[0].get("message") or {}
    return str(msg.get("content") or "").strip()


def _llm_call(prompt: str) -> str:
    """Provider-agnostic dispatch."""
    if PROVIDER in ("ai_integrations", "google_ai"):
        return _gemini_call(prompt)
    if PROVIDER in ("openrouter", "groq"):
        return _openai_compat_call(prompt)
    raise RuntimeError(f"unsupported provider: {PROVIDER}")


def _real_judge(question: str, answer: str, rubric_name: str) -> dict[str, Any]:
    rubric = get_rubric(rubric_name)
    criteria_list = ", ".join(c[0] for c in rubric.criteria)
    prompt = rubric.prompt_template.format(
        criteria_list=criteria_list,
        question=question,
        answer=answer,
    )
    try:
        text = _llm_call(prompt)
    except Exception as e:  # noqa: BLE001
        log.warning("LLM call failed (%s) — using stub", e)
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
    return {
        "ok": True,
        "service": "llm-judge",
        "version": app.version,
        "mode": MODE,
        "provider": PROVIDER,
        "model": JUDGE_MODEL,
    }


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
