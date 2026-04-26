"""
Local multilingual embeddings sidecar.

Runs `fastembed` (ONNX runtime under the hood — no torch dependency, no
GPU required) with a small multilingual model that handles Arabic well.
The model is **lazily loaded on first request** so service startup is
instant; the first /embed call takes a few seconds (one-time download).

In-memory LRU cache keyed by (model, text) so repeated retrievals (e.g.
the same query going through hyde / self-rag / crag fan-out) only embed
once.

Endpoints:
  GET  /health                          → liveness + load state
  POST /embed       {text}              → vector
  POST /embed/batch {texts: [...]}      → list of vectors
  POST /similarity  {a, b}              → cosine in [-1, 1]

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
MODEL_NAME = os.environ.get(
    "EMBEDDINGS_MODEL",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
CACHE_SIZE = int(os.environ.get("EMBEDDINGS_CACHE_SIZE", "1000"))
MAX_BATCH = int(os.environ.get("EMBEDDINGS_MAX_BATCH", "64"))
MAX_TEXT_LEN = int(os.environ.get("EMBEDDINGS_MAX_TEXT_LEN", "4000"))


# ──────────────── Lazy model loader ────────────────

_model: Any = None
_model_lock = Lock()
_model_dim: int | None = None
_model_load_ms: float | None = None


def _ensure_model() -> Any:
    global _model, _model_dim, _model_load_ms
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        from fastembed import TextEmbedding
        log.info("Loading embeddings model: %s", MODEL_NAME)
        t0 = time.time()
        _model = TextEmbedding(model_name=MODEL_NAME)
        _model_load_ms = (time.time() - t0) * 1000
        # Probe dimension with a tiny call.
        probe = list(_model.embed(["probe"]))
        _model_dim = int(np.asarray(probe[0]).shape[0])
        log.info("Model loaded in %.0fms, dim=%d", _model_load_ms, _model_dim)
        return _model


# ──────────────── LRU cache ────────────────

_cache: "OrderedDict[tuple[str, str], list[float]]" = OrderedDict()
_cache_lock = Lock()


def _cache_get(text: str) -> list[float] | None:
    key = (MODEL_NAME, text)
    with _cache_lock:
        v = _cache.get(key)
        if v is not None:
            _cache.move_to_end(key)
        return v


def _cache_put(text: str, vec: list[float]) -> None:
    key = (MODEL_NAME, text)
    with _cache_lock:
        _cache[key] = vec
        _cache.move_to_end(key)
        while len(_cache) > CACHE_SIZE:
            _cache.popitem(last=False)


def _embed_texts(texts: list[str]) -> list[list[float]]:
    """Batched embed with cache short-circuit per item."""
    model = _ensure_model()
    out: list[list[float] | None] = [None] * len(texts)
    misses: list[tuple[int, str]] = []
    for i, t in enumerate(texts):
        cached = _cache_get(t)
        if cached is not None:
            out[i] = cached
        else:
            misses.append((i, t))
    if misses:
        miss_texts = [t for _, t in misses]
        vectors = list(model.embed(miss_texts))
        for (idx, text), vec in zip(misses, vectors, strict=True):
            v = np.asarray(vec, dtype=np.float32).tolist()
            out[idx] = v
            _cache_put(text, v)
    return [v for v in out if v is not None]


# ──────────────── HTTP layer ────────────────

app = FastAPI(title="Kalmeron Embeddings Worker", version="1.0.0")

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
        "model": MODEL_NAME,
        "model_loaded": _model is not None,
        "model_dim": _model_dim,
        "model_load_ms": _model_load_ms,
        "cache_size": cache_size,
        "cache_capacity": CACHE_SIZE,
    }


@app.post("/embed")
def embed_one(body: EmbedIn) -> dict:
    t0 = time.time()
    vec = _embed_texts([body.text])[0]
    return {
        "model": MODEL_NAME,
        "dim": len(vec),
        "vector": vec,
        "elapsed_ms": round((time.time() - t0) * 1000, 1),
        "cached": _cache_get(body.text) is not None and (time.time() - t0) * 1000 < 5,
    }


@app.post("/embed/batch")
def embed_batch(body: EmbedBatchIn) -> dict:
    _validate_batch(body.texts)
    t0 = time.time()
    vecs = _embed_texts(body.texts)
    return {
        "model": MODEL_NAME,
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
