"""
Local multilingual embeddings sidecar.

Two backends are supported, switched via ``EMBEDDINGS_BACKEND``:

  * ``fastembed`` (default) — ONNX-runtime, no torch, instant cold start.
    Best for the curated multilingual MiniLM family.

  * ``sentence_transformers`` — full HF Sentence-Transformers stack. Slower
    cold start but unlocks the Arabic-specialised models we shortlisted in
    ``docs/ECOSYSTEM_RESEARCH_2026-04-28.md`` (e.g. AraGemma-Embedding-300m,
    Arabic-Matryoshka). Optional dependency — install on demand:
    ``uv pip install 'sentence-transformers>=3,<6'``.

Optional dialect-aware preprocessing (CAMeL Tools) is wired in as a
pre-step before embedding when ``EMBEDDINGS_PREPROCESS=camel`` is set.
This normalises Egyptian-dialect text against MSA / CODA conventions and
typically lifts retrieval recall on user-written EGY queries by ~10-15%.

The model is **lazily loaded on first request** so service startup is
instant; the first /embed call takes a few seconds (one-time download).

In-memory LRU cache keyed by (model, text) so repeated retrievals (e.g.
the same query going through hyde / self-rag / crag fan-out) only embed
once.

Endpoints:
  GET  /health                          → liveness + load state + backend
  POST /embed       {text}              → vector
  POST /embed/batch {texts: [...]}      → list of vectors
  POST /similarity  {a, b}              → cosine in [-1, 1]
  POST /preprocess  {text}              → normalised text (debug helper)

Run:
  cd services/embeddings-worker
  uvicorn main:app --host 0.0.0.0 --port 8099
"""

from __future__ import annotations

import logging
import os
import time
from collections import OrderedDict
from threading import Lock
from typing import Any

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("embeddings-worker")

# ──────────────── Config ────────────────
BACKEND = os.environ.get("EMBEDDINGS_BACKEND", "fastembed").strip().lower()
MODEL_NAME = os.environ.get(
    "EMBEDDINGS_MODEL",
    # Default keeps backwards compatibility. For Arabic-only deployments the
    # research report recommends `Omartificial-Intelligence-Space/AraGemma-Embedding-300m`
    # via the `sentence_transformers` backend.
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
CACHE_SIZE = int(os.environ.get("EMBEDDINGS_CACHE_SIZE", "1000"))
MAX_BATCH = int(os.environ.get("EMBEDDINGS_MAX_BATCH", "64"))
MAX_TEXT_LEN = int(os.environ.get("EMBEDDINGS_MAX_TEXT_LEN", "4000"))
PREPROCESS = os.environ.get("EMBEDDINGS_PREPROCESS", "").strip().lower()
# Optional Matryoshka truncation — when set, embeddings are truncated to
# this dim and re-normalised. Useful with AraGemma / Arabic-Matryoshka.
MATRYOSHKA_DIM = int(os.environ.get("EMBEDDINGS_MATRYOSHKA_DIM", "0"))


# ──────────────── Lazy model loader ────────────────

_model: Any = None
_model_lock = Lock()
_model_dim: int | None = None
_model_load_ms: float | None = None


class _SentenceTransformersAdapter:
    """Quack like fastembed.TextEmbedding so the rest of the file is unchanged."""

    def __init__(self, model_name: str) -> None:
        from sentence_transformers import SentenceTransformer  # type: ignore
        self._model = SentenceTransformer(model_name, device="cpu")

    def embed(self, texts: list[str]):
        # SentenceTransformer returns numpy arrays directly.
        out = self._model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
        for row in out:
            yield row


def _ensure_model() -> Any:
    global _model, _model_dim, _model_load_ms
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        log.info("Loading embeddings model: %s (backend=%s)", MODEL_NAME, BACKEND)
        t0 = time.time()
        if BACKEND == "sentence_transformers":
            _model = _SentenceTransformersAdapter(MODEL_NAME)
        else:
            from fastembed import TextEmbedding
            _model = TextEmbedding(model_name=MODEL_NAME)
        _model_load_ms = (time.time() - t0) * 1000
        # Probe dimension with a tiny call.
        probe = list(_model.embed(["probe"]))
        _model_dim = int(np.asarray(probe[0]).shape[0])
        log.info("Model loaded in %.0fms, dim=%d", _model_load_ms, _model_dim)
        return _model


# ──────────────── Optional CAMeL Tools preprocessing ────────────────
#
# Lazy-initialised because importing camel_tools loads multiple morphological
# databases on first use. We only pay the cost when the operator explicitly
# opts in via ``EMBEDDINGS_PREPROCESS=camel``.

_camel_normalizer: Any = None
_camel_lock = Lock()


def _ensure_camel():
    global _camel_normalizer
    if _camel_normalizer is not None:
        return _camel_normalizer
    with _camel_lock:
        if _camel_normalizer is not None:
            return _camel_normalizer
        try:
            from camel_tools.utils.normalize import (  # type: ignore
                normalize_unicode,
                normalize_alef_ar,
                normalize_alef_maksura_ar,
                normalize_teh_marbuta_ar,
            )
            from camel_tools.utils.dediac import dediac_ar  # type: ignore

            def _pipeline(text: str) -> str:
                t = normalize_unicode(text)
                t = dediac_ar(t)
                t = normalize_alef_ar(t)
                t = normalize_alef_maksura_ar(t)
                t = normalize_teh_marbuta_ar(t)
                return t

            _camel_normalizer = _pipeline
            log.info("CAMeL Tools preprocessing enabled")
        except Exception as e:  # noqa: BLE001
            log.warning(
                "CAMeL Tools requested but unavailable (%s). Falling back to raw text.",
                e,
            )
            _camel_normalizer = lambda t: t  # noqa: E731 — pass-through
        return _camel_normalizer


def _maybe_preprocess(texts: list[str]) -> list[str]:
    if PREPROCESS != "camel":
        return texts
    norm = _ensure_camel()
    return [norm(t) for t in texts]


def _maybe_matryoshka(vec: np.ndarray) -> np.ndarray:
    if MATRYOSHKA_DIM <= 0 or vec.shape[0] <= MATRYOSHKA_DIM:
        return vec
    truncated = vec[:MATRYOSHKA_DIM]
    n = float(np.linalg.norm(truncated))
    return truncated / n if n > 0 else truncated


# ──────────────── LRU cache ────────────────

_cache: "OrderedDict[tuple[str, str, int], list[float]]" = OrderedDict()
_cache_lock = Lock()


def _cache_key(text: str) -> tuple[str, str, int]:
    return (MODEL_NAME, text, MATRYOSHKA_DIM)


def _cache_get(text: str) -> list[float] | None:
    key = _cache_key(text)
    with _cache_lock:
        v = _cache.get(key)
        if v is not None:
            _cache.move_to_end(key)
        return v


def _cache_put(text: str, vec: list[float]) -> None:
    key = _cache_key(text)
    with _cache_lock:
        _cache[key] = vec
        _cache.move_to_end(key)
        while len(_cache) > CACHE_SIZE:
            _cache.popitem(last=False)


def _embed_texts(texts: list[str]) -> list[list[float]]:
    """Batched embed with cache short-circuit per item."""
    model = _ensure_model()
    pre_texts = _maybe_preprocess(texts)
    out: list[list[float] | None] = [None] * len(texts)
    misses: list[tuple[int, str, str]] = []
    for i, (raw, pre) in enumerate(zip(texts, pre_texts, strict=True)):
        cached = _cache_get(pre)
        if cached is not None:
            out[i] = cached
        else:
            misses.append((i, raw, pre))
    if misses:
        miss_texts = [pre for _, _, pre in misses]
        vectors = list(model.embed(miss_texts))
        for (idx, _raw, pre), vec in zip(misses, vectors, strict=True):
            arr = _maybe_matryoshka(np.asarray(vec, dtype=np.float32))
            v = arr.tolist()
            out[idx] = v
            _cache_put(pre, v)
    return [v for v in out if v is not None]


# ──────────────── HTTP layer ────────────────

app = FastAPI(title="Kalmeron Embeddings Worker", version="1.1.0")

# CORS: قابل للتكوين. الافتراضي محصور بـ main app في dev.
_origins = [o.strip() for o in os.getenv("EMBEDDINGS_WORKER_CORS", "http://localhost:5000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class EmbedIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LEN)


class EmbedBatchIn(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=MAX_BATCH)


class SimilarityIn(BaseModel):
    a: str = Field(..., min_length=1, max_length=MAX_TEXT_LEN)
    b: str = Field(..., min_length=1, max_length=MAX_TEXT_LEN)


class PreprocessIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LEN)


def _validate_batch(texts: list[str]) -> None:
    for i, t in enumerate(texts):
        if not t:
            raise HTTPException(400, f"texts[{i}] is empty")
        if len(t) > MAX_TEXT_LEN:
            raise HTTPException(400, f"texts[{i}] exceeds MAX_TEXT_LEN={MAX_TEXT_LEN}")


@app.get("/health")
def health() -> dict:
    with _cache_lock:
        cache_size = len(_cache)
    return {
        "ok": True,
        "service": "embeddings-worker",
        "version": app.version,
        "backend": BACKEND,
        "model": MODEL_NAME,
        "model_loaded": _model is not None,
        "model_dim": _model_dim,
        "model_load_ms": _model_load_ms,
        "preprocess": PREPROCESS or "none",
        "matryoshka_dim": MATRYOSHKA_DIM or None,
        "cache_size": cache_size,
        "cache_capacity": CACHE_SIZE,
    }


@app.post("/embed")
def embed_one(body: EmbedIn) -> dict:
    t0 = time.time()
    vec = _embed_texts([body.text])[0]
    return {
        "model": MODEL_NAME,
        "backend": BACKEND,
        "preprocess": PREPROCESS or "none",
        "dim": len(vec),
        "vector": vec,
        "elapsed_ms": round((time.time() - t0) * 1000, 1),
    }


@app.post("/embed/batch")
def embed_batch(body: EmbedBatchIn) -> dict:
    _validate_batch(body.texts)
    t0 = time.time()
    vecs = _embed_texts(body.texts)
    return {
        "model": MODEL_NAME,
        "backend": BACKEND,
        "preprocess": PREPROCESS or "none",
        "dim": len(vecs[0]) if vecs else _model_dim,
        "vectors": vecs,
        "count": len(vecs),
        "elapsed_ms": round((time.time() - t0) * 1000, 1),
    }


@app.post("/similarity")
def similarity(body: SimilarityIn) -> dict:
    vecs = _embed_texts([body.a, body.b])
    a = np.asarray(vecs[0], dtype=np.float32)
    b = np.asarray(vecs[1], dtype=np.float32)
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    cos = float(np.dot(a, b) / denom) if denom > 0 else 0.0
    return {"model": MODEL_NAME, "cosine": round(cos, 6)}


@app.post("/preprocess")
def preprocess_text(body: PreprocessIn) -> dict:
    """Debug helper — returns the text after the configured preprocessing step."""
    if PREPROCESS != "camel":
        return {"preprocess": "none", "text": body.text}
    norm = _ensure_camel()
    return {"preprocess": "camel", "text": norm(body.text)}
