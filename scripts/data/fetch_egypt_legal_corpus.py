"""
Seed the Egypt Calc knowledge base from public Egyptian legal corpora.

Pulls two Hugging Face datasets — both CC-BY — and writes them to local
JSONL so `services/egypt-calc` can ingest them without a network round
trip at request time.

  * `dataflare/egypt-legal-corpus`           — laws & rulings (raw text)
  * `fr3on/eg-legal-instruction-following`   — Q&A pairs (few-shot prompts)

The script is **opt-in** — nothing here runs automatically and no large
files are committed. Operators run it once per data refresh:

    pip install 'datasets>=2.18,<5'
    python scripts/data/fetch_egypt_legal_corpus.py \
        --out data/egypt-legal/

The resulting JSONL files are listed in `.gitignore` so they never end up
in the repo. Hooking them into Egypt Calc happens via the
`EGYPT_LEGAL_CORPUS_PATH` env var.

See `docs/ECOSYSTEM_RESEARCH_2026-04-28.md` §9 for the rationale.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Iterable

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("fetch_egypt_legal_corpus")


SOURCES = (
    {
        "id": "dataflare/egypt-legal-corpus",
        "out": "egypt-legal-corpus.jsonl",
        "split": "train",
        "fields": None,  # keep all fields
    },
    {
        "id": "fr3on/eg-legal-instruction-following",
        "out": "eg-legal-instruction-following.jsonl",
        "split": "train",
        "fields": ("instruction", "input", "output"),
    },
)


def _iter_dataset(dataset_id: str, split: str) -> Iterable[dict[str, Any]]:
    try:
        from datasets import load_dataset  # type: ignore
    except ImportError as e:  # noqa: BLE001
        raise SystemExit(
            "Missing optional dep `datasets` — install with: pip install 'datasets>=2.18,<5'"
        ) from e
    log.info("Loading %s [%s]", dataset_id, split)
    ds = load_dataset(dataset_id, split=split, streaming=True)
    for row in ds:
        yield row


def _write_jsonl(rows: Iterable[dict[str, Any]], out_path: Path,
                 fields: tuple[str, ...] | None) -> int:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with out_path.open("w", encoding="utf-8") as fh:
        for row in rows:
            if fields is not None:
                row = {k: row.get(k) for k in fields}
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
            n += 1
            if n % 1000 == 0:
                log.info("  wrote %d rows…", n)
    return n


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default="data/egypt-legal", help="output directory")
    parser.add_argument("--limit", type=int, default=0,
                        help="optional row cap per source (0 = no cap)")
    args = parser.parse_args(argv)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    for src in SOURCES:
        rows = _iter_dataset(src["id"], src["split"])
        if args.limit > 0:
            rows = (r for i, r in enumerate(rows) if i < args.limit)
        n = _write_jsonl(rows, out_dir / src["out"], src["fields"])
        log.info("✓ %s → %s (%d rows)", src["id"], out_dir / src["out"], n)

    print(f"\nDone. Set EGYPT_LEGAL_CORPUS_PATH={out_dir.resolve()} for Egypt Calc to pick it up.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
