"""
Arabic-aware document chunking.

Strategy:
  1. Split on paragraph boundaries (double newline) first.
  2. If a paragraph is larger than `max_chars`, split on Arabic + Latin
     sentence terminators ( . ؟ ! ؛ : … ).
  3. If a sentence is still oversize, fall back to a sliding character window
     with `overlap` chars to preserve context.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import regex as re

# Arabic + Latin sentence terminators. Keeps the terminator with the sentence.
SENTENCE_SPLIT = re.compile(r"(?<=[\.!\?؟؛…])\s+")
PARAGRAPH_SPLIT = re.compile(r"\n{2,}")


@dataclass
class Chunk:
    text: str
    char_count: int
    page_hint: int | None = None  # filled by the PDF extractor when possible


def _window(text: str, size: int, overlap: int) -> list[str]:
    if len(text) <= size:
        return [text]
    step = max(1, size - overlap)
    out = []
    i = 0
    while i < len(text):
        out.append(text[i:i + size])
        i += step
    return out


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in SENTENCE_SPLIT.split(text) if s.strip()]


def chunk(text: str, *,
          target_chars: int = 1200,
          max_chars: int = 1800,
          overlap: int = 150) -> list[Chunk]:
    """
    Greedy packer: append sentences into a buffer until adding the next would
    exceed `max_chars`, then flush. This keeps chunks roughly `target_chars`
    long and never above `max_chars`.
    """
    if not text:
        return []
    out: list[Chunk] = []
    for paragraph in PARAGRAPH_SPLIT.split(text):
        sentences: Iterable[str] = split_sentences(paragraph)
        buf = ""
        for sent in sentences:
            if len(sent) > max_chars:
                if buf:
                    out.append(Chunk(buf, len(buf)))
                    buf = ""
                for piece in _window(sent, max_chars, overlap):
                    out.append(Chunk(piece, len(piece)))
                continue
            candidate = (buf + " " + sent).strip() if buf else sent
            if len(candidate) > max_chars:
                out.append(Chunk(buf, len(buf)))
                buf = sent
            elif len(candidate) >= target_chars:
                out.append(Chunk(candidate, len(candidate)))
                buf = ""
            else:
                buf = candidate
        if buf:
            out.append(Chunk(buf, len(buf)))
    return out
