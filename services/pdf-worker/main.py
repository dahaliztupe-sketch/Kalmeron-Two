"""
Arabic PDF worker — FastAPI microservice.

Single responsibility: take a PDF, return clean text + chunks suitable for
RAG indexing. Runs as a separate process from the Next.js app so dependencies
stay isolated and a crash here can never bring down the website.

When ``pypdf`` returns empty / near-empty text (typical for scanned PDFs)
we transparently fall through to the OCR backend in ``ocr.py`` if it is
enabled via ``PDF_WORKER_OCR_FALLBACK=easyocr``. The OCR backend is
imported lazily so the default install stays slim.

Endpoints:
  GET  /health                         → liveness probe + backend state
  POST /extract  (multipart: file)     → {text, pageCount, language, chunks[]}

Run locally:
  cd services/pdf-worker
  uvicorn main:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import io
import logging
import os
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from pydantic import BaseModel, Field

from arabic import is_arabic, normalize
from chunker import chunk
import ocr

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("pdf-worker")

MAX_BYTES = int(os.getenv("PDF_WORKER_MAX_BYTES", str(20 * 1024 * 1024)))  # 20 MB
# Below this many extracted characters we treat the PDF as "scanned" and
# attempt the OCR fallback (only if it's enabled).
OCR_FALLBACK_THRESHOLD = int(os.getenv("PDF_WORKER_OCR_THRESHOLD", "200"))

app = FastAPI(title="Kalmeron PDF Worker", version="1.1.0")

# Lock CORS down to known callers; override via env in production.
allowed_origins = os.getenv("PDF_WORKER_CORS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ChunkOut(BaseModel):
    text: str
    char_count: int = Field(..., alias="charCount")
    page_hint: int | None = Field(None, alias="pageHint")

    model_config = {"populate_by_name": True}


class ExtractOut(BaseModel):
    text: str
    page_count: int = Field(..., alias="pageCount")
    language: str
    char_count: int = Field(..., alias="charCount")
    chunk_count: int = Field(..., alias="chunkCount")
    chunks: list[ChunkOut]
    extraction_path: str = Field(..., alias="extractionPath")

    model_config = {"populate_by_name": True}


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "pdf-worker",
        "version": app.version,
        "ocr_fallback_enabled": ocr.is_enabled(),
        "ocr_backend": ocr.BACKEND or None,
    }


@app.post("/extract", response_model=ExtractOut, response_model_by_alias=True)
async def extract(
    file: UploadFile = File(..., description="PDF document to extract"),
    target_chars: int = 1200,
    max_chars: int = 1800,
    overlap: int = 150,
    aggressive_normalize: bool = True,
) -> ExtractOut:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only .pdf files are accepted.")

    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(
            413, f"PDF too large ({len(raw)} bytes > {MAX_BYTES})"
        )
    if not raw:
        raise HTTPException(400, "Empty file.")

    try:
        reader = PdfReader(io.BytesIO(raw))
    except Exception as e:  # noqa: BLE001
        log.warning("PDF parse failed for %s: %s", file.filename, e)
        raise HTTPException(422, f"Could not parse PDF: {e}") from e

    if reader.is_encrypted:
        # Try empty password (the most common case) before giving up.
        try:
            reader.decrypt("")
        except Exception:  # noqa: BLE001
            raise HTTPException(422, "Encrypted PDF — password required.")

    page_texts: list[str] = []
    for i, page in enumerate(reader.pages):
        try:
            page_texts.append(page.extract_text() or "")
        except Exception as e:  # noqa: BLE001
            log.warning("Page %d extract failed: %s", i, e)
            page_texts.append("")

    raw_text = "\n\n".join(page_texts)
    extraction_path = "pypdf"

    # OCR fallback path: when the native extractor returns essentially
    # nothing, try the configured OCR backend (if any).
    if len(raw_text.strip()) < OCR_FALLBACK_THRESHOLD and ocr.is_enabled():
        log.info(
            "Native extraction returned %d chars (< %d threshold) — trying OCR fallback (%s)",
            len(raw_text.strip()), OCR_FALLBACK_THRESHOLD, ocr.BACKEND,
        )
        ocr_pages = ocr.ocr_pdf_pages(raw)
        if ocr_pages and any(p.strip() for p in ocr_pages):
            raw_text = "\n\n".join(ocr_pages)
            extraction_path = f"ocr:{ocr.BACKEND}"

    cleaned = normalize(
        raw_text,
        diacritics=aggressive_normalize,
        alef=aggressive_normalize,
        ya=aggressive_normalize,
        tatweel=True,
        zero_width=True,
        whitespace=True,
    )
    language = "ar" if is_arabic(cleaned) else "other"

    pieces = chunk(
        cleaned,
        target_chars=target_chars,
        max_chars=max_chars,
        overlap=overlap,
    )

    log.info(
        "extracted name=%s pages=%d chars=%d chunks=%d lang=%s path=%s",
        file.filename, len(reader.pages), len(cleaned), len(pieces),
        language, extraction_path,
    )

    return ExtractOut(
        text=cleaned,
        pageCount=len(reader.pages),
        language=language,
        charCount=len(cleaned),
        chunkCount=len(pieces),
        chunks=[ChunkOut(text=c.text, charCount=c.char_count, pageHint=c.page_hint)
                for c in pieces],
        extractionPath=extraction_path,
    )
