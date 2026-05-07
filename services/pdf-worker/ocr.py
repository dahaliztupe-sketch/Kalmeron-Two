"""
Optional OCR fallback for the PDF worker.

Triggered when layout extraction returns empty / near-empty text — typical for
scanned PDFs (court rulings, tax certificates, ministry letters). The
backend is selected with ``PDF_WORKER_OCR_FALLBACK``:

  * ``""``       — disabled (default). Empty extractions return as-is.
  * ``"easyocr"``— JaidedAI/EasyOCR. Apache-2.0, ships Arabic. Heavy
                   (~700 MB torch + torchvision). Imported lazily so
                   the rest of the worker stays slim if you never opt in.

The fallback is intentionally pluggable: the public surface is
``ocr_pdf_pages(pdf_bytes)`` regardless of backend.

Health capability wiring
------------------------
``EASYOCR_IMPORTABLE`` is set at module load time by attempting a dry import
of ``easyocr``.  This lets the ``/health`` endpoint report ``ocrBackend``
based on *actual installed package presence*, not just the env var value.
If the env requests easyocr but the package is missing, the health endpoint
will report the mismatch correctly.

Line ordering fix (2026-05)
---------------------------
EasyOCR's ``paragraph=True`` mode groups lines internally but does not
guarantee top-to-bottom ordering, which leads to scrambled text in RTL
documents.  We now use ``detail=1`` to get full bounding-box data and
sort results by the *top-Y coordinate* of each bounding box before
joining, producing correct top-to-bottom reading order for Arabic pages.
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

# ── capability probe: check actual package presence at startup ───────────────
# This is separate from BACKEND so /health accurately reflects what's installed,
# not just what the env var requests.

def _probe_easyocr() -> bool:
    """Return True if easyocr can actually be imported (package is installed)."""
    try:
        import importlib
        importlib.util.find_spec("easyocr")
        # find_spec returns None when the package is absent.
        import easyocr as _  # noqa: F401
        return True
    except Exception:  # noqa: BLE001
        return False


EASYOCR_IMPORTABLE: bool = _probe_easyocr()

if BACKEND == "easyocr" and not EASYOCR_IMPORTABLE:
    log.warning(
        "PDF_WORKER_OCR_FALLBACK=easyocr is set but easyocr package is not installed. "
        "OCR fallback will silently return empty pages."
    )

# ── lazy singleton ───────────────────────────────────────────────────────────

_easyocr_reader: Any = None
_easyocr_lock = Lock()


def is_enabled() -> bool:
    """Return True only when the requested backend is both configured AND importable."""
    return BACKEND == "easyocr" and EASYOCR_IMPORTABLE


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


def _bbox_top_y(result: Any) -> float:
    """Extract the top-Y coordinate from an EasyOCR detail result.

    EasyOCR detail=1 results are tuples of (bbox, text, confidence) where
    ``bbox`` is [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] (four corners, clockwise
    from top-left).  The minimum Y value across the four corners is the
    topmost edge of the text line.
    """
    try:
        bbox = result[0]
        return min(float(pt[1]) for pt in bbox)
    except (IndexError, TypeError, ValueError):
        return 0.0


def ocr_pdf_pages(pdf_bytes: bytes) -> list[str]:
    """Return a list of page-text strings, one per rasterised page.

    Lines within each page are sorted by their top-Y bounding-box coordinate
    (top-to-bottom) before joining, ensuring correct reading order for both
    LTR and RTL documents.

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
                # detail=1 returns full bounding-box data; we sort by top-Y
                # before extracting text to get correct top-to-bottom order.
                raw_results = reader.readtext(buf.getvalue(), detail=1, paragraph=False)
                sorted_results = sorted(raw_results, key=_bbox_top_y)
                lines = [res[1] for res in sorted_results if res[1].strip()]
                pages.append("\n".join(lines))
            except Exception as e:  # noqa: BLE001
                log.warning("EasyOCR page %d failed: %s", i, e)
                pages.append("")
    return pages
