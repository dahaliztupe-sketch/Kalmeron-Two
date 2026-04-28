"""
Optional OCR fallback for the PDF worker.

Triggered when ``pypdf`` returns empty / near-empty text — typical for
scanned PDFs (court rulings, tax certificates, ministry letters). The
backend is selected with ``PDF_WORKER_OCR_FALLBACK``:

  * ``""``       — disabled (default). Empty extractions return as-is.
  * ``"easyocr"``— JaidedAI/EasyOCR. Apache-2.0, ships Arabic. Heavy
                   (~700 MB torch + torchvision). Imported lazily so
                   the rest of the worker stays slim if you never opt in.

The fallback is intentionally pluggable: the public surface is
``ocr_pdf_pages(pdf_bytes, languages, dpi)`` regardless of backend.
"""

from __future__ import annotations

import io
import logging
import os
from threading import Lock
from typing import Any

log = logging.getLogger("pdf-worker.ocr")

BACKEND = os.environ.get("PDF_WORKER_OCR_FALLBACK", "").strip().lower()
DPI = int(os.environ.get("PDF_WORKER_OCR_DPI", "200"))
LANGS = [s.strip() for s in os.environ.get("PDF_WORKER_OCR_LANGS", "ar,en").split(",") if s.strip()]
# Sanity cap so a 500-page bad-day PDF can't trigger a 10-minute OCR pass.
MAX_PAGES = int(os.environ.get("PDF_WORKER_OCR_MAX_PAGES", "30"))


_easyocr_reader: Any = None
_easyocr_lock = Lock()


def is_enabled() -> bool:
    return BACKEND in {"easyocr"}


def _ensure_easyocr() -> Any:
    global _easyocr_reader
    if _easyocr_reader is not None:
        return _easyocr_reader
    with _easyocr_lock:
        if _easyocr_reader is not None:
            return _easyocr_reader
        import easyocr  # type: ignore  # noqa: PLC0415
        log.info("Loading EasyOCR reader for langs=%s", LANGS)
        _easyocr_reader = easyocr.Reader(LANGS, gpu=False, verbose=False)
        return _easyocr_reader


def _pdf_to_images(pdf_bytes: bytes, *, dpi: int, max_pages: int) -> list[Any]:
    """Rasterise PDF pages to PIL images. Capped at ``max_pages``."""
    from pdf2image import convert_from_bytes  # type: ignore  # noqa: PLC0415
    images = convert_from_bytes(pdf_bytes, dpi=dpi, first_page=1, last_page=max_pages)
    return list(images)


def ocr_pdf_pages(pdf_bytes: bytes) -> list[str]:
    """Return a list of page-text strings, one per rasterised page.

    Returns an empty list when OCR is disabled or fails. Never raises —
    OCR is a best-effort fallback and must not break the parent request.
    """
    if not is_enabled():
        return []
    try:
        images = _pdf_to_images(pdf_bytes, dpi=DPI, max_pages=MAX_PAGES)
    except Exception as e:  # noqa: BLE001
        log.warning("PDF rasterisation failed: %s", e)
        return []

    pages: list[str] = []
    if BACKEND == "easyocr":
        try:
            reader = _ensure_easyocr()
        except Exception as e:  # noqa: BLE001
            log.warning("EasyOCR init failed: %s", e)
            return []
        for i, img in enumerate(images):
            try:
                buf = io.BytesIO()
                img.save(buf, format="PNG")
                lines = reader.readtext(buf.getvalue(), detail=0, paragraph=True)
                pages.append("\n".join(lines))
            except Exception as e:  # noqa: BLE001
                log.warning("EasyOCR page %d failed: %s", i, e)
                pages.append("")
    return pages
