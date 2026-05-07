"""Arabic PDF worker — FastAPI microservice."""

from __future__ import annotations

import io
import logging
import os
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from pydantic import BaseModel, Field

from arabic import is_arabic, normalize, BIDI_AVAILABLE
from chunker import chunk
from extractor import extract_with_layout, PDFMINER_AVAILABLE, PDFPLUMBER_AVAILABLE
import ocr

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("pdf-worker")

MAX_BYTES = int(os.getenv("PDF_WORKER_MAX_BYTES", str(20 * 1024 * 1024)))
OCR_FALLBACK_THRESHOLD = int(os.getenv("PDF_WORKER_OCR_THRESHOLD", "200"))

app = FastAPI(title="Kalmeron PDF Worker", version="1.2.0")

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
    ocr_backend_str = ocr.BACKEND if ocr.is_enabled() else "disabled"
    return {
        "ok": True,
        "service": "pdf-worker",
        "version": app.version,
        "ocr_fallback_enabled": ocr.is_enabled(),
        "ocr_backend": ocr.BACKEND or None,
        # multiColumnSupport requires pdfminer (column-band detection uses LTTextBox).
        # pdfplumber alone does not provide column-aware ordering.
        "multiColumnSupport": PDFMINER_AVAILABLE,
        "tableExtraction": PDFPLUMBER_AVAILABLE,
        "arabicBidiSupport": BIDI_AVAILABLE,
        "ocrBackend": ocr_backend_str,
    }


@app.post("/extract", response_model=ExtractOut, response_model_by_alias=True)
async def extract(
    file: UploadFile = File(...),
    target_chars: int = 1200,
    max_chars: int = 1800,
    overlap: int = 150,
    aggressive_normalize: bool = True,
) -> ExtractOut:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only .pdf files are accepted.")

    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, f"PDF too large ({len(raw)} bytes > {MAX_BYTES})")
    if not raw:
        raise HTTPException(400, "Empty file.")

    try:
        reader = PdfReader(io.BytesIO(raw))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(422, f"Could not parse PDF: {e}") from e

    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception:  # noqa: BLE001
            raise HTTPException(422, "Encrypted PDF — password required.")
        # Raw bytes are still encrypted; pdfminer cannot parse them.
        # Extract directly from the already-decrypted pypdf reader.
        raw_text = "\n\n".join(p.extract_text() or "" for p in reader.pages)
        extraction_path = "pypdf:decrypted"
    else:
        # Primary extraction — returns actual backend path taken.
        raw_text, extraction_path = extract_with_layout(raw)

    page_count = len(reader.pages)

    # OCR fallback for scanned PDFs (near-empty layout extraction).
    bidi_for_normalize = False
    if len(raw_text.strip()) < OCR_FALLBACK_THRESHOLD and ocr.is_enabled():
        log.info("OCR fallback (%s): layout returned %d chars", ocr.BACKEND, len(raw_text.strip()))
        ocr_pages = ocr.ocr_pdf_pages(raw)
        if ocr_pages and any(p.strip() for p in ocr_pages):
            raw_text = "\n\n".join(ocr_pages)
            extraction_path = f"ocr:{ocr.BACKEND}"
            # OCR engines may emit visual-order Arabic; apply bidi reordering.
            bidi_for_normalize = True

    cleaned = normalize(
        raw_text,
        diacritics=aggressive_normalize,
        alef=aggressive_normalize,
        ya=aggressive_normalize,
        tatweel=True,
        zero_width=True,
        whitespace=True,
        bidi=bidi_for_normalize,
    )
    language = "ar" if is_arabic(cleaned) else "other"

    pieces = chunk(cleaned, target_chars=target_chars, max_chars=max_chars, overlap=overlap)

    log.info("extracted name=%s pages=%d chars=%d chunks=%d lang=%s path=%s",
             file.filename, page_count, len(cleaned), len(pieces), language, extraction_path)

    return ExtractOut(
        text=cleaned,
        pageCount=page_count,
        language=language,
        charCount=len(cleaned),
        chunkCount=len(pieces),
        chunks=[ChunkOut(text=c.text, charCount=c.char_count, pageHint=c.page_hint)
                for c in pieces],
        extractionPath=extraction_path,
    )
