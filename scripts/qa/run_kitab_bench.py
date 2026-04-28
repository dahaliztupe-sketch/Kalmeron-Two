"""
KITAB-Bench OCR regression harness for the PDF worker.

KITAB-Bench (mbzuai-oryx/KITAB-Bench, ACL 2025) is the de-facto standard
benchmark for Arabic OCR & document understanding. This script drives our
running `services/pdf-worker` against a sample of the benchmark and
reports CER / WER per page.

The benchmark dataset itself is **not** committed (CC-BY but several GB).
Operators download it once with:

    huggingface-cli login
    huggingface-cli download mbzuai-oryx/KITAB-Bench \
        --repo-type dataset --local-dir data/kitab-bench

Then run:

    pip install 'jiwer>=3,<5' httpx
    PDF_WORKER_URL=http://localhost:8000 \
    KITAB_BENCH_DIR=data/kitab-bench \
        python scripts/qa/run_kitab_bench.py --sample 25

Exit code 0 = mean-CER below threshold (default 0.20). Non-zero = regression.

Wire into CI by adding a dedicated workflow that boots the PDF worker and
runs this script with `--sample 100`. See
`docs/ECOSYSTEM_RESEARCH_2026-04-28.md` §6.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("kitab-bench")


def _need(mod: str, install_hint: str) -> object:
    try:
        return __import__(mod)
    except ImportError as e:  # noqa: BLE001
        raise SystemExit(f"Missing dep `{mod}` — {install_hint}") from e


def _load_pairs(bench_dir: Path, sample: int) -> list[tuple[Path, str]]:
    """Return [(pdf_path, ground_truth_text), ...] sampled from the benchmark.

    The KITAB-Bench layout we expect (per the upstream README):
      bench_dir/
        pdfs/<id>.pdf
        gold/<id>.txt
    """
    pdfs_dir = bench_dir / "pdfs"
    gold_dir = bench_dir / "gold"
    if not pdfs_dir.exists() or not gold_dir.exists():
        raise SystemExit(
            f"Benchmark layout not found under {bench_dir}. "
            "Expected `pdfs/` and `gold/` subdirectories — see script docstring."
        )

    pairs: list[tuple[Path, str]] = []
    for pdf in sorted(pdfs_dir.glob("*.pdf")):
        gold = gold_dir / f"{pdf.stem}.txt"
        if gold.exists():
            pairs.append((pdf, gold.read_text(encoding="utf-8")))
        if sample and len(pairs) >= sample:
            break
    return pairs


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bench-dir", default=os.environ.get("KITAB_BENCH_DIR", "data/kitab-bench"))
    parser.add_argument("--worker-url", default=os.environ.get("PDF_WORKER_URL", "http://localhost:8000"))
    parser.add_argument("--sample", type=int, default=25, help="number of PDFs to evaluate")
    parser.add_argument("--threshold", type=float, default=0.20, help="max acceptable mean CER")
    parser.add_argument("--out", default="qa/reports/kitab-bench.json")
    args = parser.parse_args(argv)

    httpx = _need("httpx", "pip install 'httpx>=0.27,<1'")  # type: ignore[assignment]
    jiwer = _need("jiwer", "pip install 'jiwer>=3,<5'")  # type: ignore[assignment]

    pairs = _load_pairs(Path(args.bench_dir), args.sample)
    if not pairs:
        log.error("No (pdf, gold) pairs found.")
        return 2
    log.info("Evaluating %d PDFs against %s", len(pairs), args.worker_url)

    cers: list[float] = []
    wers: list[float] = []
    rows: list[dict] = []

    for pdf_path, gold_text in pairs:
        with pdf_path.open("rb") as fh:
            files = {"file": (pdf_path.name, fh, "application/pdf")}
            r = httpx.post(f"{args.worker_url}/extract", files=files, timeout=120.0)  # type: ignore[attr-defined]
        if r.status_code != 200:
            log.warning("worker %s -> %d %s", pdf_path.name, r.status_code, r.text[:200])
            continue
        pred = (r.json() or {}).get("text", "")
        cer = float(jiwer.cer(gold_text, pred))  # type: ignore[attr-defined]
        wer = float(jiwer.wer(gold_text, pred))  # type: ignore[attr-defined]
        cers.append(cer)
        wers.append(wer)
        rows.append({
            "pdf": pdf_path.name,
            "cer": round(cer, 4),
            "wer": round(wer, 4),
            "extraction_path": (r.json() or {}).get("extractionPath"),
        })
        log.info("  %s  cer=%.3f  wer=%.3f", pdf_path.name, cer, wer)

    mean_cer = sum(cers) / len(cers) if cers else 1.0
    mean_wer = sum(wers) / len(wers) if wers else 1.0

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps({
        "evaluated": len(rows),
        "mean_cer": round(mean_cer, 4),
        "mean_wer": round(mean_wer, 4),
        "threshold": args.threshold,
        "rows": rows,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nKITAB-Bench  evaluated={len(rows)}  mean_CER={mean_cer:.3f}  mean_WER={mean_wer:.3f}")
    print(f"  → {out_path}")

    if mean_cer > args.threshold:
        log.error("Mean CER %.3f exceeds threshold %.3f", mean_cer, args.threshold)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
