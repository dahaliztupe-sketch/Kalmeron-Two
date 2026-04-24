# Agent Evaluation Suite

Runs automated quality checks against each production agent.

## Layout

- `golden-dataset.json` — 200 graded prompts grouped by intent.
- `run-eval.ts` — entry point, invoked by `npm run eval`.
- `judges/` — LLM-as-judge prompts per intent (planned).

## Acceptance thresholds (from `docs/SLO.md`)

| Intent | Recall | LLM-judge | Latency p95 |
|---|---|---|---|
| `idea_validation` | ≥ 0.75 | ≥ 0.80 | < 2.0 s |
| `business_plan` | ≥ 0.70 | ≥ 0.80 | < 4.0 s |
| `cfo_analysis` | n/a | ≥ 0.85 | < 3.0 s |
| `legal_review` | n/a | ≥ 0.90 | < 3.0 s |
| `mistake_shield` | ≥ 0.75 | ≥ 0.85 | < 1.5 s |
| `opportunity_search` | ≥ 0.70 | ≥ 0.80 | < 2.5 s |
| `general_chat` | n/a | ≥ 0.75 | < 1.0 s |

A run **fails CI** if *any* intent drops below threshold by more than 5 percentage points vs the rolling 7-day baseline.

## Adding a case

1. Add the prompt to `golden-dataset.json` under the right intent.
2. Provide `expected.contains` (substrings that MUST appear) and/or `expected.refuses` (booleans).
3. For RAG-dependent prompts, add `expected.cites` listing the source IDs we expect to be cited.
4. Run `npm run eval -- --filter <intent>` locally.
5. Commit results snapshot under `test/eval/snapshots/YYYY-MM-DD.json`.

## CI

Nightly via `.github/workflows/eval.yml`. Results posted to Langfuse and Slack.
