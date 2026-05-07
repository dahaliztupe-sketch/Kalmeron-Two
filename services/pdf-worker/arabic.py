"""Arabic-aware text normalization for the PDF worker."""

from __future__ import annotations

import logging

import regex as re

log = logging.getLogger("pdf-worker.arabic")

# ── bidi support (optional) ─────────────────────────────────────────────────

try:
    from bidi.algorithm import get_display  # type: ignore
    BIDI_AVAILABLE = True
except ImportError:
    BIDI_AVAILABLE = False
    log.warning("python-bidi not installed — bidirectional reordering disabled")


# ── compiled patterns ───────────────────────────────────────────────────────

# Arabic diacritics (harakat) — fatha, damma, kasra, tanween, sukun, shadda, dagger alif.
DIACRITICS = re.compile(r"[\u064B-\u0652\u0670]")

# Tatweel / kashida (ـ) — used for visual stretching only.
TATWEEL = re.compile(r"\u0640")

# Zero-width joiners that confuse tokenizers.
ZW = re.compile(r"[\u200B-\u200D\uFEFF]")

# Detect Arabic letters (basic + supplement + extended A).
ARABIC_LETTERS = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")

# Multiple consecutive whitespace (but NOT newlines — we want to keep paragraph structure).
SPACES = re.compile(r"[ \t\u00A0]+")

# Three or more newlines collapse to two (single blank line between paragraphs).
NEWLINES = re.compile(r"\n{3,}")

# Split text into paragraphs (two or more newlines).
PARAGRAPH_SPLIT = re.compile(r"(\n{2,})")


# ── public helpers ──────────────────────────────────────────────────────────

def is_arabic(text: str, threshold: float = 0.3) -> bool:
    """True if ≥ threshold of letter chars are Arabic."""
    if not text:
        return False
    letters = [c for c in text if c.isalpha()]
    if not letters:
        return False
    arabic = sum(1 for c in letters if ARABIC_LETTERS.match(c))
    return (arabic / len(letters)) >= threshold


def normalize_alef(text: str) -> str:
    """Collapse all alef variants to plain alef ا. Aggressive but lossless for retrieval."""
    return text.translate(str.maketrans({"\u0625": "\u0627",  # إ
                                         "\u0623": "\u0627",  # أ
                                         "\u0622": "\u0627",  # آ
                                         "\u0671": "\u0627"}))  # ٱ


def normalize_ya(text: str) -> str:
    """Alef-maksura ى → ya ي and Persian ye ی → ya ي."""
    return text.translate(str.maketrans({"\u0649": "\u064A",
                                         "\u06CC": "\u064A"}))


def normalize_ta_marbuta(text: str) -> str:
    """Optional: ة → ه. Off by default (changes meaning in some words).
    Exposed here so callers can opt in. Not applied by `normalize`."""
    return text.replace("\u0629", "\u0647")


def strip_diacritics(text: str) -> str:
    return DIACRITICS.sub("", text)


def strip_tatweel(text: str) -> str:
    return TATWEEL.sub("", text)


def strip_zero_width(text: str) -> str:
    return ZW.sub("", text)


def collapse_whitespace(text: str) -> str:
    text = SPACES.sub(" ", text)
    text = NEWLINES.sub("\n\n", text)
    return text.strip()


def _paragraph_has_rtl(paragraph: str) -> bool:
    """Return True if the paragraph contains any Arabic/RTL characters."""
    return bool(ARABIC_LETTERS.search(paragraph))


def apply_bidi(text: str) -> str:
    """Apply python-bidi get_display() (logical→visual) per paragraph.

    Use only for visual-order source text (e.g. some OCR outputs).
    Applying to already-logical Arabic text will corrupt it.
    No-op when python-bidi is not installed.
    """
    if not BIDI_AVAILABLE:
        return text

    # Split preserving the separator tokens (newlines) so we can rejoin exactly.
    parts = PARAGRAPH_SPLIT.split(text)
    result: list[str] = []
    for part in parts:
        # Separator tokens (pure newlines) are kept as-is.
        if re.fullmatch(r"\n+", part):
            result.append(part)
        elif _paragraph_has_rtl(part):
            try:
                result.append(get_display(part, base_dir="R"))
            except Exception as e:  # noqa: BLE001
                log.debug("bidi reorder failed for paragraph: %s", e)
                result.append(part)
        else:
            result.append(part)
    return "".join(result)


def normalize(text: str, *,
              alef: bool = True,
              ya: bool = True,
              diacritics: bool = True,
              tatweel: bool = True,
              zero_width: bool = True,
              whitespace: bool = True,
              bidi: bool = False) -> str:
    """Full normalization pipeline; all steps independently togglable.

    bidi=False by default. apply_bidi() is a logical→visual transform;
    applying it to already-logical text (typical pdfminer output) corrupts
    Arabic sequences. Set bidi=True only for visual-order sources (OCR).
    """
    if not text:
        return ""
    if bidi:
        text = apply_bidi(text)
    if zero_width:
        text = strip_zero_width(text)
    if tatweel:
        text = strip_tatweel(text)
    if diacritics:
        text = strip_diacritics(text)
    if alef:
        text = normalize_alef(text)
    if ya:
        text = normalize_ya(text)
    if whitespace:
        text = collapse_whitespace(text)
    return text
