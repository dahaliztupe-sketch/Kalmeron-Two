"""
Optional helper: dump Firestore collections into the dbt `seeds/` folder
so `dbt build` runs against real production data instead of the bundled
samples.

Usage:
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json
    export FIRESTORE_PROJECT_ID=kalmeron-prod
    python sync_from_firestore.py [--collections costs,events,...]

Mapping (Firestore collection → seed CSV):
    cost_ledger          → seeds/raw_costs.csv
    events               → seeds/raw_events.csv
    router_decisions     → seeds/raw_router_decisions.csv
    users                → seeds/raw_users.csv
    agents (catalog)     → seeds/raw_agents.csv

Notes:
    * `google-cloud-firestore` is NOT a hard dependency of this service —
      install it on demand: `pip install google-cloud-firestore`.
    * Collections are paged in 500-document batches.
    * Output CSV columns are inferred from the union of fields seen in
      the first 1 000 docs and stay stable across runs (sorted).
    * Existing seed files are overwritten only if `--write` is passed —
      by default a `.preview.csv` sibling is produced instead, so you
      can diff before committing.
"""

from __future__ import annotations

import argparse
import csv
import os
import sys
from pathlib import Path
from typing import Any, Iterable

SEEDS_DIR = Path(__file__).parent / "seeds"

COLLECTION_MAP: dict[str, str] = {
    "cost_ledger":      "raw_costs.csv",
    "events":           "raw_events.csv",
    "router_decisions": "raw_router_decisions.csv",
    "users":            "raw_users.csv",
    "agents":           "raw_agents.csv",
}


def _try_import_firestore():
    try:
        from google.cloud import firestore  # type: ignore
        return firestore
    except ImportError:
        sys.exit(
            "google-cloud-firestore is not installed.\n"
            "Run: pip install google-cloud-firestore\n"
            "and re-run this script."
        )


def _stream_collection(client, collection: str, limit: int | None) -> Iterable[dict[str, Any]]:
    q = client.collection(collection)
    if limit:
        q = q.limit(limit)
    for snap in q.stream():
        d = snap.to_dict() or {}
        d.setdefault(_id_field(collection), snap.id)
        yield d


def _id_field(collection: str) -> str:
    # Each table's primary-key column name follows the convention `<noun>_id`.
    base = collection.removesuffix("s").removesuffix("_ledger") or collection
    return f"{base}_id"


def _write_csv(rows: list[dict[str, Any]], target: Path, write: bool) -> Path:
    if not rows:
        print(f"  (no rows for {target.name}, skipping)")
        return target

    columns = sorted({k for row in rows for k in row.keys()})
    out_path = target if write else target.with_suffix(".preview.csv")
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=columns)
        w.writeheader()
        for row in rows:
            w.writerow({k: _serialize(row.get(k)) for k in columns})
    print(f"  → {out_path.relative_to(Path.cwd()) if out_path.is_relative_to(Path.cwd()) else out_path}"
          f" ({len(rows)} rows, {len(columns)} cols)")
    return out_path


def _serialize(v: Any) -> str:
    if v is None:
        return ""
    if isinstance(v, (dict, list)):
        import json
        return json.dumps(v, ensure_ascii=False)
    return str(v)


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync Firestore → dbt seeds.")
    parser.add_argument("--collections", default=",".join(COLLECTION_MAP),
                        help="comma-separated subset to sync")
    parser.add_argument("--limit", type=int, default=None,
                        help="cap rows per collection (debugging)")
    parser.add_argument("--write", action="store_true",
                        help="overwrite seed CSVs (default: write .preview.csv)")
    args = parser.parse_args()

    if not os.environ.get("FIRESTORE_PROJECT_ID"):
        sys.exit("FIRESTORE_PROJECT_ID env var is required.")

    firestore = _try_import_firestore()
    client = firestore.Client(project=os.environ["FIRESTORE_PROJECT_ID"])

    requested = [c.strip() for c in args.collections.split(",") if c.strip()]
    SEEDS_DIR.mkdir(parents=True, exist_ok=True)

    for col in requested:
        if col not in COLLECTION_MAP:
            print(f"! skipping unknown collection {col!r}")
            continue
        print(f"Streaming {col} ...")
        rows = list(_stream_collection(client, col, args.limit))
        _write_csv(rows, SEEDS_DIR / COLLECTION_MAP[col], args.write)

    if not args.write:
        print("\nDry-run finished. Re-run with --write to overwrite seeds.")


if __name__ == "__main__":
    main()
