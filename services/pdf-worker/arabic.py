"""
Arabic-aware text normalization for the PDF worker.

The default `pdf-parse` (Node) output for Arabic PDFs has three problems:
  1. Multiple alef variants (إ أ آ ا) make exact-match recall fail.
  2. Tatweel (ـ) and ZWNJ are sprinkled inside words, breaking tokenization.
  3. Diacritics (تشكيل) inflate token counts without adding semantic value.

This module fixes the above without removing meaning: numbers and punctuation
stay intact, paragraph boundaries are preserved.
"""

from __future__ import annotations

import regex as re

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


def normalize(text: str, *,
              alef: bool = True,
              ya: bool = True,
              diacritics: bool = True,
              tatweel: bool = True,
              zero_width: bool = True,
              whitespace: bool = True) -> str:
    """
    Full normalization pipeline. Each step is independently togglable so
    callers can tune for their use-case (RAG retrieval = aggressive,
    user-display = conservative).
    """
    if not text:
        return ""
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
