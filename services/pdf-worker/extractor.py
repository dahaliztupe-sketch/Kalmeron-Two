"""Layout-aware PDF text extraction."""

from __future__ import annotations

import io
import logging
from typing import Any

log = logging.getLogger("pdf-worker.extractor")

try:
    from pdfminer.high_level import extract_pages  # type: ignore
    from pdfminer.layout import LAParams, LTTextBox  # type: ignore
    PDFMINER_AVAILABLE = True
except ImportError:
    PDFMINER_AVAILABLE = False

try:
    import pdfplumber  # type: ignore
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

# x-gap wider than this fraction of page width is a column boundary
MIN_COLUMN_GAP_RATIO = 0.12


def _laparams() -> "LAParams":
    return LAParams(
        char_margin=2.0,
        line_margin=0.5,
        word_margin=0.1,
        boxes_flow=None,  # disable automatic ordering; column-band logic takes over
        detect_vertical=False,
    )


def _table_to_markdown(table: list[list[Any]]) -> str:
    if not table:
        return ""

    def _cell(v: Any) -> str:
        if v is None:
            return " "
        return str(v).replace("\n", " ").replace("|", "\\|").strip() or " "

    rows = [[_cell(c) for c in row] for row in table]
    nc = max(len(r) for r in rows)
    rows = [r + [" "] * (nc - len(r)) for r in rows]
    lines = []
    for i, row in enumerate(rows):
        lines.append("| " + " | ".join(row) + " |")
        if i == 0:
            lines.append("|" + "|".join(["---"] * nc) + "|")
    return "\n".join(lines)


def _detect_column_splits(boxes: list[Any], page_width: float) -> list[float]:
    """Return x midpoints of gaps >= MIN_COLUMN_GAP_RATIO * page_width."""
    if not boxes or page_width <= 0:
        return []
    w = int(page_width) + 1
    covered = [False] * w
    for b in boxes:
        for x in range(max(0, int(b.x0)), min(w - 1, int(b.x1)) + 1):
            covered[x] = True
    min_gap = page_width * MIN_COLUMN_GAP_RATIO
    splits: list[float] = []
    gap_start: int | None = None
    for x, c in enumerate(covered):
        if not c:
            if gap_start is None:
                gap_start = x
        else:
            if gap_start is not None:
                if x - gap_start >= min_gap:
                    splits.append((gap_start + x) / 2.0)
                gap_start = None
    if gap_start is not None and w - gap_start >= min_gap:
        splits.append((gap_start + w) / 2.0)
    return splits


def _assign_columns(boxes: list[Any], splits: list[float]) -> list[list[Any]]:
    cols: list[list[Any]] = [[] for _ in range(len(splits) + 1)]
    for b in boxes:
        cx = (b.x0 + b.x1) / 2.0
        idx = sum(1 for s in splits if cx > s)
        cols[idx].append(b)
    return cols


def _plumber_top(page_height: float, box: Any) -> float:
    return page_height - box.y1


def _box_in_table(page_height: float, box: Any, pl_bbox: tuple) -> bool:
    cx = (box.x0 + box.x1) / 2.0
    cy = page_height - (box.y0 + box.y1) / 2.0
    x0, top, x1, bottom = pl_bbox
    return x0 <= cx <= x1 and top <= cy <= bottom


def _get_tables(plumber_page: Any) -> list[tuple[tuple, str]]:
    try:
        result = []
        for t in plumber_page.find_tables():
            md = _table_to_markdown(t.extract() or [])
            if md:
                result.append((t.bbox, md))
        return result
    except Exception as e:  # noqa: BLE001
        log.debug("pdfplumber table detection: %s", e)
        return []


def _extract_page(page_layout: Any, plumber_page: Any) -> str:
    ph = page_layout.height
    pw = page_layout.width

    boxes: list[Any] = [e for e in page_layout if isinstance(e, LTTextBox)]
    splits = _detect_column_splits(boxes, pw)
    columns = _assign_columns(boxes, splits)

    tables: list[tuple[tuple, str]] = []
    table_used: list[bool] = []
    if plumber_page is not None:
        tables = _get_tables(plumber_page)
        table_used = [False] * len(tables)

    lines: list[str] = []
    for col in columns:
        for box in sorted(col, key=lambda b: -b.y1):
            text = box.get_text().strip()
            if not text:
                continue

            # Find which table this box belongs to (if any).
            matched_table: int | None = None
            for i, (bbox, _) in enumerate(tables):
                if _box_in_table(ph, box, bbox):
                    matched_table = i
                    break

            if matched_table is not None:
                # Emit Markdown exactly once per table; suppress all raw text.
                if not table_used[matched_table]:
                    table_used[matched_table] = True
                    lines.append(tables[matched_table][1])
                # else: box is inside an already-handled table — suppress silently
            else:
                lines.append(text)

    # Tables with no overlapping text boxes (purely graphical or out of flow).
    for i, (_, md) in enumerate(tables):
        if not table_used[i]:
            lines.append(md)

    return "\n".join(lines)


def extract_with_layout(pdf_bytes: bytes) -> tuple[str, str]:
    """Return (text, extraction_path).

    extraction_path reflects the actual backend used:
      'pdfminer+pdfplumber' | 'pdfminer' | 'pypdf'
    """
    if not PDFMINER_AVAILABLE:
        return _pypdf_fallback(pdf_bytes), "pypdf"

    try:
        pdf_stream = io.BytesIO(pdf_bytes)
        plumber_ctx = None
        plumber_pages: list[Any] = []
        if PDFPLUMBER_AVAILABLE:
            try:
                plumber_ctx = pdfplumber.open(io.BytesIO(pdf_bytes))
                plumber_pages = plumber_ctx.pages
            except Exception as e:  # noqa: BLE001
                log.warning("pdfplumber open: %s", e)

        try:
            page_texts: list[str] = []
            for idx, layout in enumerate(extract_pages(pdf_stream, laparams=_laparams())):
                pp = plumber_pages[idx] if idx < len(plumber_pages) else None
                page_texts.append(_extract_page(layout, pp))
        finally:
            if plumber_ctx is not None:
                try:
                    plumber_ctx.close()
                except Exception:  # noqa: BLE001
                    pass

        text = "\n\n".join(page_texts)
        path = "pdfminer+pdfplumber" if PDFPLUMBER_AVAILABLE else "pdfminer"
        return text, path

    except Exception as e:  # noqa: BLE001
        log.warning("pdfminer failed (%s) — falling back to pypdf", e)
        return _pypdf_fallback(pdf_bytes), "pypdf"


def _pypdf_fallback(pdf_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader  # noqa: PLC0415
        reader = PdfReader(io.BytesIO(pdf_bytes))
        return "\n\n".join(p.extract_text() or "" for p in reader.pages)
    except Exception as e:  # noqa: BLE001
        log.error("pypdf fallback failed: %s", e)
        return ""
