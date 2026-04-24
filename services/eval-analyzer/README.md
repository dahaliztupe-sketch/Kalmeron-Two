# Eval Analyzer (Python)

Statistical analysis layer on top of the TypeScript eval harness.

## What it does

The TS harness (`test/eval/run-eval.ts`) decides pass/fail for each case. This Python
sidecar takes the same JSON output and produces a richer report:

- **Per-agent routing recall** — bar chart per `expected_agent`.
- **Confusion matrix** — heatmap of expected intent vs predicted intent.
- **Latency p50 / p95 / max** — per category and across the whole dataset.
- **Safety breakdown** — how many injection prompts the gateway blocked.
- **PII miss types** — which redactor types are leaking the most.

## Usage

```bash
# 1. Run the TS eval and emit JSON
npm run eval -- --json

# 2. Build the report
python services/eval-analyzer/analyze.py
# → eval-reports/latest.html
# → eval-reports/latest.md
# → eval-reports/latest.json

# Or both at once:
npm run eval:report
```

## Why Python here

Same answer as `services/README.md`: `pandas` + `plotly` give us a real
statistical pipeline in 30 lines of code that would take hundreds of lines in
TypeScript. The TS path stays the source of truth for pass/fail; Python only
adds analytics on top.

## Dependencies

See `requirements.txt`. The package is intentionally lightweight (no heavy ML
deps) so it can run on cheap CI runners.
