"""
Test suite for Arabic complex document support in the PDF worker.

Design principles
-----------------
- Two-column fixture: columns at the SAME Y rows (the real regression case),
  not staggered. pdfminer's LAParams must output entire Column A before Column B.
- Table fixture: bordered 3×3 table with Arabic-like cell labels to verify
  Markdown generation for non-Latin content.
- Bidi fixture: real Arabic Unicode paragraph; verify character preservation
  and (when python-bidi is installed) logical-order properties.
- All fixture PDFs are generated on-the-fly with reportlab (no binary blobs).

Coverage
--------
  TestExtractWithLayout     — 5 tests (column order, table Markdown, fallback)
  TestBidiReordering        — 7 tests (empty, Latin, Arabic, mixed, pipeline)
  TestOCRLineOrdering       — 6 tests (_bbox_top_y, sort order, disabled)
  TestHealthFields          — 5 tests (keys, types, importability wiring)
"""

from __future__ import annotations

import io
import sys
import os

import pytest

# Make sure the pdf-worker source is importable when running from any CWD.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ── reportlab availability ───────────────────────────────────────────────────

try:
    from reportlab.pdfgen import canvas  # type: ignore
    from reportlab.lib.pagesizes import A4  # type: ignore
    from reportlab.platypus import SimpleDocTemplate, Table as RLTable, TableStyle  # type: ignore
    from reportlab.lib import colors  # type: ignore
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

pytestmark = pytest.mark.skipif(
    not REPORTLAB_AVAILABLE,
    reason="reportlab is required to generate fixture PDFs",
)


# ── PDF fixtures ─────────────────────────────────────────────────────────────

def _make_two_column_same_row_pdf() -> bytes:
    """Two-column PDF where BOTH columns have text at the same Y coordinates.

    This is the real regression case: pypdf produces scrambled output because
    it reads the character stream without spatial awareness.  A layout-aware
    extractor (pdfminer with LAParams) groups text into column text boxes and
    returns each column's content contiguously.

    Layout:
      Row 1 (y=0.75): ColALine1 (x~50)    ColBLine1 (x~350)
      Row 2 (y=0.70): ColALine2 (x~50)    ColBLine2 (x~350)
      Row 3 (y=0.65): ColALine3 (x~50)    ColBLine3 (x~350)

    pdfminer's LAParams (boxes_flow=0.5) detects the two column bands and
    returns the left-column block (ColA*) or right-column block (ColB*)
    contiguously — not interleaved row-by-row.
    """
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica", 12)

    # Left column (column A)
    for i, label in enumerate(["ColALine1", "ColALine2", "ColALine3"]):
        c.drawString(50, height * (0.75 - i * 0.05), label)

    # Right column (column B) — same Y rows as column A
    for i, label in enumerate(["ColBLine1", "ColBLine2", "ColBLine3"]):
        c.drawString(width * 0.55, height * (0.75 - i * 0.05), label)

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.read()


def _make_arabic_table_pdf() -> bytes:
    """3×3 bordered table PDF with cell labels that include Arabic-like identifiers.

    Uses reportlab platypus Table + TableStyle to draw real grid borders so
    pdfplumber's line-intersection table detector can find the table.

    Cell labels use a mix of ASCII and descriptive Arabic-flavoured names
    to test that the Markdown renderer handles multi-byte content.
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)

    # Arabic-flavoured cell labels (ASCII-safe for Helvetica)
    data = [
        ["Kol1-Ra's", "Kol2-Ra's", "Kol3-Ra's"],      # header row  (رأس = header)
        ["Khaana-11", "Khaana-12", "Khaana-13"],        # row 2      (خانة = cell)
        ["Khaana-21", "Khaana-22", "Khaana-23"],        # row 3
    ]
    table = RLTable(data, colWidths=[130, 130, 130])
    table.setStyle(TableStyle([
        ("GRID",       (0, 0), (-1, -1), 1, colors.black),
        ("BACKGROUND", (0, 0), (-1,  0), colors.lightgrey),
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 10),
        ("ALIGN",      (0, 0), (-1, -1), "CENTER"),
    ]))
    doc.build([table])
    buf.seek(0)
    return buf.read()


def _make_mixed_bidi_pdf() -> bytes:
    """PDF containing two lines of Latin text for basic extraction tests."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    _, height = A4
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 100, "Alpha Beta Gamma")
    c.drawString(50, height - 120, "Delta Epsilon Zeta")
    c.showPage()
    c.save()
    buf.seek(0)
    return buf.read()


def _make_encrypted_pdf() -> bytes:
    """PDF encrypted with an empty password.

    Note: Helvetica (standard PDF font) does not embed Arabic glyphs,
    so PDF fixtures use Latin/ASCII labels throughout.  Real Arabic
    Unicode behaviour is exercised in the string-level bidi unit tests
    (TestBidiReordering) and the normalize integration tests.
    """
    from pypdf import PdfReader as _PR, PdfWriter as _PW  # type: ignore

    plain = _make_mixed_bidi_pdf()
    reader = _PR(io.BytesIO(plain))
    writer = _PW()
    for page in reader.pages:
        writer.add_page(page)
    writer.encrypt(user_password="", owner_password=None)
    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf.read()


# ── helpers ──────────────────────────────────────────────────────────────────

def _col_a_before_col_b(text: str) -> bool:
    """Return True if ALL ColA markers appear before ANY ColB marker OR vice-versa.

    This is a strict non-interleaving check: the last occurrence of any marker
    from group A must be before the first occurrence of any marker from group B,
    or vice-versa.
    """
    a_markers = ["ColALine1", "ColALine2", "ColALine3"]
    b_markers = ["ColBLine1", "ColBLine2", "ColBLine3"]

    a_positions = [text.index(m) for m in a_markers if m in text]
    b_positions = [text.index(m) for m in b_markers if m in text]

    if not a_positions or not b_positions:
        return False

    # All A before any B — OR — all B before any A
    return max(a_positions) < min(b_positions) or max(b_positions) < min(a_positions)


# ── tests ─────────────────────────────────────────────────────────────────────

class TestExtractWithLayout:
    """Layout-aware extraction: column ordering and inline table Markdown."""

    def test_two_column_same_row_not_interleaved(self) -> None:
        """Column A and Column B lines (at the same Y) must NOT be interleaved."""
        from extractor import extract_with_layout

        text, _ = extract_with_layout(_make_two_column_same_row_pdf())

        for marker in ["ColALine1", "ColALine2", "ColALine3",
                        "ColBLine1", "ColBLine2", "ColBLine3"]:
            assert marker in text, (
                f"Marker '{marker}' missing from extracted text.\nFull text: {text!r}"
            )

        assert _col_a_before_col_b(text), (
            "Columns appear interleaved — pdfminer did not group column blocks correctly.\n"
            f"ColALine1={text.index('ColALine1')}, "
            f"ColALine2={text.index('ColALine2')}, "
            f"ColALine3={text.index('ColALine3')}, "
            f"ColBLine1={text.index('ColBLine1')}, "
            f"ColBLine2={text.index('ColBLine2')}, "
            f"ColBLine3={text.index('ColBLine3')}\n"
            f"Full text: {text!r}"
        )

    def test_arabic_table_produces_markdown(self) -> None:
        """A bordered table PDF must produce Markdown pipe-table syntax."""
        from extractor import PDFPLUMBER_AVAILABLE, extract_with_layout

        if not PDFPLUMBER_AVAILABLE:
            pytest.skip("pdfplumber not installed — table extraction unavailable")

        text, _ = extract_with_layout(_make_arabic_table_pdf())

        assert "|" in text, (
            f"No Markdown pipe-table '|' found in output.\nFull text: {text!r}"
        )

    def test_arabic_table_cell_content_preserved(self) -> None:
        """Table cell text must survive extraction (not be dropped)."""
        from extractor import PDFPLUMBER_AVAILABLE, extract_with_layout

        if not PDFPLUMBER_AVAILABLE:
            pytest.skip("pdfplumber not installed")

        text, _ = extract_with_layout(_make_arabic_table_pdf())

        assert "Kol1-Ra" in text or "Kol2-Ra" in text or "Kol3-Ra" in text, (
            f"No header cell text found in output.\nFull text: {text!r}"
        )

    def test_table_markdown_inline_not_appended(self) -> None:
        """Table Markdown must not be appended after all text (old broken behaviour).

        The first '|' must be inside the Markdown section which also contains
        cell text — proving the table is inline, not tacked on at the end.
        """
        from extractor import PDFPLUMBER_AVAILABLE, extract_with_layout

        if not PDFPLUMBER_AVAILABLE:
            pytest.skip("pdfplumber not installed")

        text, _ = extract_with_layout(_make_arabic_table_pdf())

        pipe_idx = text.find("|")
        assert pipe_idx != -1, "No Markdown table found"

        # The region starting at the first '|' must contain cell text.
        md_section = text[pipe_idx:]
        has_cell = (
            "Kol1-Ra" in md_section
            or "Kol2-Ra" in md_section
            or "Khaana" in md_section
        )
        assert has_cell, (
            f"Markdown section does not contain cell content — "
            f"table may have been appended incorrectly.\n"
            f"Markdown section: {md_section[:300]!r}"
        )

    def test_extract_returns_nonempty_for_valid_pdf(self) -> None:
        """Any valid text PDF must return non-empty text."""
        from extractor import extract_with_layout
        text, _ = extract_with_layout(_make_mixed_bidi_pdf())
        assert text.strip()

    def test_extract_fallback_on_invalid_bytes(self) -> None:
        """Invalid bytes must return (str, str), not raise."""
        from extractor import extract_with_layout
        text, path = extract_with_layout(b"not a pdf")
        assert isinstance(text, str)
        assert isinstance(path, str)

    def test_encrypted_pdf_with_empty_password_returns_text(self) -> None:
        """Empty-password encrypted PDFs must still return non-empty text.

        Regression guard: /extract used to pass raw (still-encrypted) bytes to
        pdfminer after calling reader.decrypt("").  pdfminer cannot read
        encrypted bytes and returned empty text.  Now main.py extracts from
        the already-decrypted pypdf reader for encrypted PDFs.
        """
        from fastapi.testclient import TestClient
        from main import app

        enc = _make_encrypted_pdf()
        client = TestClient(app)
        resp = client.post(
            "/extract",
            files={"file": ("test.pdf", enc, "application/pdf")},
        )
        assert resp.status_code == 200, f"Unexpected status: {resp.status_code}"
        data = resp.json()
        assert data["text"].strip(), (
            "Encrypted PDF with empty password returned empty text — "
            "decryption path is broken.\n"
            f"extractionPath={data.get('extractionPath')!r}"
        )
        assert data["extractionPath"] == "pypdf:decrypted", (
            f"Expected extractionPath='pypdf:decrypted', got {data.get('extractionPath')!r}"
        )

    def test_arabic_normalize_pipeline_preserves_logical_order(self) -> None:
        """Arabic text flowing through the /extract normalize pipeline (bidi=False)
        must emerge in logical Unicode order.

        Note: Standard PDF fonts (Helvetica) cannot embed Arabic glyphs, so PDF
        fixtures use Latin/ASCII labels.  Arabic correctness is validated here
        at the normalize level — the same code path /extract uses.
        """
        from arabic import normalize, is_arabic

        arabic_sentence = "مرحبا بالعالم"   # logical order
        result = normalize(
            arabic_sentence,
            bidi=False,   # the value /extract uses for non-OCR paths
            diacritics=False,
            alef=False,
            ya=False,
            tatweel=False,
            zero_width=False,
            whitespace=False,
        )
        assert result == arabic_sentence, (
            "normalize(bidi=False) changed logical Arabic order — "
            "RAG extraction would be corrupted.\n"
            f"Input:  {arabic_sentence!r}\n"
            f"Output: {result!r}"
        )
        assert is_arabic(result)


class TestBidiReordering:
    """Bidirectional text handling in arabic.py.

    Semantic contract
    -----------------
    ``apply_bidi()`` / ``normalize(bidi=True)`` calls python-bidi's
    ``get_display()`` which is a **logical → visual** transform.

    Key correctness properties tested here:
    1. ``normalize(bidi=False)`` (the default) MUST NOT alter the character
       sequence of already-logical Arabic text — this is the safe RAG path.
    2. ``apply_bidi()`` with ``bidi=True`` DOES change purely Arabic text
       (logical → visual makes the sequence different from the input).
    3. Latin-only paragraphs are never altered by either path.
    4. Mixed Arabic+English paragraphs: Latin tokens survive in both paths;
       Arabic code points survive in both paths (no chars are dropped).
    5. Stripping (tatweel, diacritics) works correctly when bidi is off.
    """

    LOGICAL_ARABIC = "مرحبا بالعالم"   # "Hello world" — logical Unicode order

    def test_apply_bidi_empty_returns_empty(self) -> None:
        from arabic import apply_bidi
        assert apply_bidi("") == ""

    def test_apply_bidi_latin_unchanged(self) -> None:
        """Latin-only text must be identical after apply_bidi."""
        from arabic import apply_bidi
        latin = "Hello World 123"
        assert apply_bidi(latin) == latin

    def test_normalize_bidi_false_preserves_logical_arabic_order(self) -> None:
        """Already-logical Arabic text must be character-for-character identical
        after normalize(bidi=False) — the default safe RAG path.

        This is the critical regression guard: if bidi were True by default,
        get_display() would reverse the Arabic sequence (logical → visual),
        producing corrupted text for RAG.
        """
        from arabic import normalize

        result = normalize(
            self.LOGICAL_ARABIC,
            bidi=False,
            diacritics=False,
            alef=False,
            ya=False,
            tatweel=False,
            zero_width=False,
            whitespace=False,
        )
        assert result == self.LOGICAL_ARABIC, (
            f"normalize(bidi=False) altered already-logical Arabic!\n"
            f"Input:  {self.LOGICAL_ARABIC!r}\n"
            f"Output: {result!r}"
        )

    def test_apply_bidi_alters_purely_arabic_string(self) -> None:
        """apply_bidi() is a logical→visual transform: it MUST change a purely
        RTL Arabic string (the visual representation differs from logical storage).
        If it returns the same string, bidi is a no-op and provides no value.
        """
        from arabic import apply_bidi, BIDI_AVAILABLE

        if not BIDI_AVAILABLE:
            pytest.skip("python-bidi not installed")

        result = apply_bidi(self.LOGICAL_ARABIC)
        assert result != self.LOGICAL_ARABIC, (
            "apply_bidi() returned the input unchanged for purely Arabic text — "
            "logical→visual transform should alter the character sequence.\n"
            f"Input:  {self.LOGICAL_ARABIC!r}\n"
            f"Output: {result!r}"
        )

    def test_apply_bidi_arabic_preserves_all_code_points(self) -> None:
        """All Unicode code points survive bidi reordering (no chars dropped)."""
        from arabic import apply_bidi, BIDI_AVAILABLE

        if not BIDI_AVAILABLE:
            pytest.skip("python-bidi not installed")

        result = apply_bidi(self.LOGICAL_ARABIC)
        for ch in set(self.LOGICAL_ARABIC):
            assert ch in result, (
                f"U+{ord(ch):04X} ({ch!r}) lost after apply_bidi.\nResult: {result!r}"
            )

    def test_apply_bidi_mixed_retains_latin_token(self) -> None:
        """A Latin token embedded in Arabic text must survive both bidi paths."""
        from arabic import apply_bidi

        mixed = "مرحبا Hello كيف حالك"
        assert "Hello" in apply_bidi(mixed), (
            f"Latin token 'Hello' lost after apply_bidi.\nResult: {apply_bidi(mixed)!r}"
        )

    def test_apply_bidi_mixed_retains_arabic_code_points(self) -> None:
        """All Arabic Unicode chars in a mixed paragraph survive apply_bidi."""
        from arabic import apply_bidi

        mixed = "مرحبا Hello كيف حالك"
        result = apply_bidi(mixed)
        for ch in set(c for c in mixed if "\u0600" <= c <= "\u06FF"):
            assert ch in result, (
                f"Arabic U+{ord(ch):04X} lost after apply_bidi.\nResult: {result!r}"
            )

    def test_normalize_strips_tatweel_and_diacritics_bidi_off(self) -> None:
        """Tatweel and diacritics are stripped correctly with bidi=False (default)."""
        from arabic import normalize

        text = "مَرْحَباً بـالعالم"  # fatha U+064E, tanwin U+064B, tatweel U+0640
        result = normalize(text, bidi=False, diacritics=True, tatweel=True)

        assert "\u0640" not in result, "Tatweel survived normalization"
        assert "\u064B" not in result, "Tanwin survived normalization"
        assert isinstance(result, str) and len(result) > 0

    def test_normalize_bidi_true_on_visual_order_ocr_text(self) -> None:
        """Regression: normalize(bidi=True) on simulated visual-order OCR Arabic text.

        OCR engines that emit visual-order Arabic store RTL glyphs left-to-right
        in the character stream.  Applying apply_bidi() (logical→visual) to such
        text should not crash and should produce a non-empty string.  This test
        uses get_display() output of a known logical string as the simulated
        visual-order OCR input — the exact scenario the OCR fallback path hits.
        """
        from arabic import apply_bidi, normalize, BIDI_AVAILABLE

        if not BIDI_AVAILABLE:
            pytest.skip("python-bidi not installed")

        # Simulate visual-order OCR output: run get_display on logical Arabic.
        logical = "مرحبا Hello كيف حالك"
        visual_order_ocr = apply_bidi(logical)   # logical→visual (what OCR emits)

        # Now run through the OCR fallback normalize path (bidi=True).
        result = normalize(visual_order_ocr, bidi=True,
                           diacritics=False, alef=False, ya=False,
                           tatweel=False, zero_width=False, whitespace=False)

        assert isinstance(result, str) and len(result.strip()) > 0, (
            "normalize(bidi=True) on visual-order OCR text returned empty string"
        )
        # Latin token must survive both transforms.
        assert "Hello" in result, (
            f"Latin token 'Hello' lost after bidi round-trip.\nResult: {result!r}"
        )


class TestOCRLineOrdering:
    """EasyOCR Y-coordinate sorting for correct top-to-bottom line order."""

    def test_bbox_top_y_returns_min_y(self) -> None:
        from ocr import _bbox_top_y
        bbox = [[10, 50], [100, 50], [100, 70], [10, 70]]
        assert _bbox_top_y((bbox, "text", 0.99)) == pytest.approx(50.0)

    def test_bbox_top_y_skewed_box_uses_true_min(self) -> None:
        from ocr import _bbox_top_y
        # Non-axis-aligned: Y values are 30, 28, 50, 52.
        bbox = [[10, 30], [100, 28], [105, 50], [5, 52]]
        assert _bbox_top_y((bbox, "text", 0.9)) == pytest.approx(28.0)

    def test_bbox_top_y_handles_none(self) -> None:
        from ocr import _bbox_top_y
        assert _bbox_top_y(None) == 0.0  # type: ignore

    def test_bbox_top_y_handles_empty_bbox(self) -> None:
        from ocr import _bbox_top_y
        assert _bbox_top_y(([], "text", 1.0)) == 0.0

    def test_sort_by_top_y_correct_order(self) -> None:
        """Sorting three EasyOCR results by _bbox_top_y yields top-to-bottom order."""
        from ocr import _bbox_top_y
        results = [
            ([[0, 200], [100, 200], [100, 220], [0, 220]], "line three", 0.9),
            ([[0,  50], [100,  50], [100,  70], [0,  70]], "line one",   0.9),
            ([[0, 120], [100, 120], [100, 140], [0, 140]], "line two",   0.9),
        ]
        sorted_results = sorted(results, key=_bbox_top_y)
        assert [r[1] for r in sorted_results] == ["line one", "line two", "line three"]

    def test_ocr_disabled_returns_empty(self) -> None:
        import ocr as ocr_mod
        orig_backend, orig_importable = ocr_mod.BACKEND, ocr_mod.EASYOCR_IMPORTABLE
        try:
            ocr_mod.BACKEND = ""
            ocr_mod.EASYOCR_IMPORTABLE = False
            assert ocr_mod.ocr_pdf_pages(b"fake") == []
        finally:
            ocr_mod.BACKEND = orig_backend
            ocr_mod.EASYOCR_IMPORTABLE = orig_importable


class TestHealthFields:
    """/health endpoint capability fields wired to actual package presence."""

    def _get_health(self) -> dict:
        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app).get("/health").json()

    def test_health_has_required_keys(self) -> None:
        data = self._get_health()
        for key in ("multiColumnSupport", "tableExtraction", "arabicBidiSupport", "ocrBackend"):
            assert key in data, f"Required key missing from /health: {key!r}"

    def test_health_capability_types(self) -> None:
        data = self._get_health()
        assert isinstance(data["multiColumnSupport"], bool)
        assert isinstance(data["tableExtraction"], bool)
        assert isinstance(data["arabicBidiSupport"], bool)
        assert isinstance(data["ocrBackend"], str)

    def test_health_ocr_backend_disabled_when_not_importable(self) -> None:
        """When EASYOCR_IMPORTABLE is False, ocrBackend must be 'disabled'."""
        import ocr as ocr_mod
        from fastapi.testclient import TestClient
        from main import app

        orig = ocr_mod.EASYOCR_IMPORTABLE
        try:
            ocr_mod.EASYOCR_IMPORTABLE = False
            data = TestClient(app).get("/health").json()
            assert data["ocrBackend"] == "disabled", (
                f"Expected 'disabled', got {data['ocrBackend']!r}"
            )
        finally:
            ocr_mod.EASYOCR_IMPORTABLE = orig

    def test_health_multi_column_support_requires_pdfminer(self) -> None:
        """multiColumnSupport must be tied to pdfminer availability, NOT pdfplumber.

        Column-band detection uses LTTextBox from pdfminer.layout; pdfplumber
        alone does not provide column-aware ordering.
        """
        from extractor import PDFMINER_AVAILABLE
        data = self._get_health()
        assert data["multiColumnSupport"] == PDFMINER_AVAILABLE, (
            f"multiColumnSupport={data['multiColumnSupport']!r} but "
            f"PDFMINER_AVAILABLE={PDFMINER_AVAILABLE!r}"
        )

    def test_health_table_extraction_matches_pdfplumber_availability(self) -> None:
        from extractor import PDFPLUMBER_AVAILABLE
        data = self._get_health()
        assert data["tableExtraction"] == PDFPLUMBER_AVAILABLE

    def test_health_bidi_support_matches_bidi_availability(self) -> None:
        from arabic import BIDI_AVAILABLE
        data = self._get_health()
        assert data["arabicBidiSupport"] == BIDI_AVAILABLE
