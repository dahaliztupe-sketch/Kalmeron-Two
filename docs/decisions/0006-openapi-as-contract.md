# 0006 — OpenAPI specs as the source-of-truth contract between languages

Date: 2026-04-30
Status: Accepted

## Context

Now that ADR 0005 commits us to a polyglot architecture, the biggest
practical risk is **type drift** between languages. Today the Next.js
front-end calls four Python services (`pdf-worker`, `embeddings-worker`,
`llm-judge`, `egypt-calc`) plus one Rust service (`token-meter`). Without
a contract, every change in a Python `pydantic` model needs a manual,
correct, and timely update on the TypeScript side — which never happens.

We already had a public-facing OpenAPI spec at `docs/api/openapi.yaml`,
but no equivalent for the internal microservices.

## Decision

For every internal microservice we expose:

1. The service publishes its OpenAPI 3.1 schema on `/openapi.json`
   (FastAPI does this automatically; for Axum services we hand-write the
   spec or hand-author a thin `*.types.ts`).
2. `npm run codegen:openapi` snapshots each spec to
   `docs/api/services/<name>.openapi.json` — committed to git so changes
   show up in code review.
3. `npm run codegen:clients` regenerates `src/lib/api-clients/<name>.types.ts`
   via `openapi-typescript`. A hand-written wrapper at
   `src/lib/api-clients/<name>.ts` adds fetch / timeout / error handling.
4. Front-end code imports the typed client only — never raw `fetch` to a
   service URL — so a breaking schema change becomes a TypeScript compile
   error instead of a runtime 500.

## Consequences

**Positive:**

- Type-safe cross-language calls with zero runtime cost.
- Spec diffs in PRs make API changes reviewable.
- New engineers can read `docs/api/services/` to understand the surface
  area without booting the services.

**Negative:**

- Two extra commands to remember after changing a service. Mitigated by a
  combined `npm run codegen` script and a pre-commit hook (TODO).
- Token-meter is hand-typed because Axum has no auto-spec. Acceptable for
  one tiny service; reconsider if more Rust services appear.
