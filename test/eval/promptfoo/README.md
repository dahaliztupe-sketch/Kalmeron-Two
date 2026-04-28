# Promptfoo pilot — Egypt Calc

Declarative eval harness for the `services/egypt-calc` agent, running the
real HTTP service (no mocks) on `http://localhost:8008`.

## Run

```bash
# Make sure the Egypt Calc workflow is up first.
npm run eval:promptfoo
```

Promptfoo is invoked via `npx --yes promptfoo@latest` so there is no
top-level dependency to maintain. Results land in
`test/eval/promptfoo/results.json` and a human-readable summary is
printed to stdout.

## Why this exists

The TypeScript harness in `test/eval/run-eval.ts` covers the supervisor's
intent / PII / injection surface. It does **not** verify that
domain-specific agents return numerically correct answers.

Promptfoo plugs that gap with declarative YAML test cases that:

- Hit the live service over HTTP, so the contract surface is exercised end-to-end.
- Assert numeric ranges with `javascript` blocks instead of brittle string
  matches.
- Cap latency at 5 s — a regression in tax-bracket lookup latency is
  treated as a bug.
- Cache: false — every run re-hits the service.

See `docs/ECOSYSTEM_RESEARCH_2026-04-28.md` §7 for the framework selection
rationale.
