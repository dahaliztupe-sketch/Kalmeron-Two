# 0005 — Polyglot by job, not by fashion

Date: 2026-04-30
Status: Accepted
Supersedes: —
Superseded by: —

## Context

The Kalmeron Two codebase has grown to span multiple languages organically:
TypeScript for the Next.js front-end and orchestration layer, Python for
ML/NLP/Arabic-text services, SQL/dbt for the analytics warehouse, and now
Rust for one performance-critical hot path.

A natural temptation is either of two extremes:

1. **Mono-language fundamentalism.** "Move everything to TypeScript so we
   only need one toolchain." This forces TS to do work it is bad at — heavy
   numerical processing, OCR, sentence embeddings — at the cost of either
   poor performance or unstable native bindings.
2. **Language-of-the-week tourism.** "Add Go for service A, Elixir for
   service B, Zig for service C, because polyglot stacks look impressive."
   This multiplies operational complexity, hiring constraints, security
   surface area, and onboarding time without buying real value.

Neither serves the product.

## Decision

We adopt a **deliberately polyglot** architecture, where each language is
introduced **only** when it provides a measurable, durable advantage for a
specific class of work. The current language map is:

| Language    | Where it is used                                                         | Why it is the right choice                                                                                  |
|-------------|--------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| TypeScript  | Next.js front-end, API routes, agent orchestration, business logic       | Industry standard for React; tight feedback loop; shared types across client/server.                        |
| Python      | `pdf-worker`, `embeddings-worker`, `llm-judge`, `egypt-calc`, `eval-analyzer` | Best-in-class ecosystem for OCR, NLP, sentence-transformers, scientific computing, and Arabic text shaping. |
| SQL + dbt   | `data-warehouse` (DuckDB)                                                | Declarative, testable, version-controlled analytics; the right paradigm for tabular transformations.        |
| Rust        | `token-meter` (BPE token counting on the LLM hot path)                   | 10-50× faster than JS equivalents on large inputs; isolated process can never stall the web server.         |
| JS (`.mjs`) | DevOps and codegen scripts (`scripts/`)                                  | Same toolchain as the front-end; zero-install runtime via Node.                                             |
| Bash        | Service launchers and CI glue                                            | Universal, no dependency footprint, ideal for short orchestration.                                          |

## Adding a new language

A new language enters the codebase only after answering **all** of the
following:

1. What specific task is it for, and why is no current language adequate?
2. What is the measured (or order-of-magnitude estimated) gain?
3. Who maintains it after the original author leaves?
4. What is the deployment + observability story?
5. Can it be isolated as a single microservice so a future migration is
   cheap?

If any answer is weak, we say no.

## Consequences

**Positive:**

- Each component runs on its native ecosystem; we never fight the language.
- Failure isolation: a Python OCR crash cannot bring down the web server,
  and a Rust panic cannot corrupt embeddings.
- Honest hiring signal: candidates know we use multiple languages
  intentionally, not because the founders couldn't pick one.

**Negative:**

- Deployment complexity: more containers, more health checks, more port
  bookkeeping. Mitigated by the OpenAPI-driven typed clients (ADR 0006).
- Onboarding takes longer for engineers who only know one stack.
- We must be disciplined about not adding more languages reflexively.
