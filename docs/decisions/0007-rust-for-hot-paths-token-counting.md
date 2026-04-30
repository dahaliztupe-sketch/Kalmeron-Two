# 0007 — Rust for hot-path performance: token counting

Date: 2026-04-30
Status: Accepted

## Context

Every LLM-powered feature in Kalmeron Two passes user text through a token
counter at least twice:

1. Before the call, to estimate cost and to keep the prompt within the
   model's context window.
2. After the call, for accurate per-user usage accounting and billing.

The `gpt-tokenizer` JS package works but, on inputs larger than ~10 KB,
allocates aggressively on the V8 heap and pegs the Node event loop —
exactly the wrong behaviour for a request handler that should be free to
serve other users in parallel.

We measured this becoming a problem when the "Document Q&A" feature
started accepting whole PDFs.

## Decision

We add a single Rust microservice, `services/token-meter/`, and route all
token-counting traffic to it via a typed TypeScript client
(`src/lib/api-clients/token-meter.ts`). The service:

- Wraps `tiktoken-rs` (the upstream crate maintained by Zurawiki).
- Exposes `POST /count` returning `{tokens, bytes, encoding, elapsed_micros}`.
- Caches loaded encoders process-wide (loading the BPE merge tables is
  the slow part).
- Auto-selects the encoding from a model name (`gpt-4o` → `o200k_base`,
  `gpt-3.5-*` → `cl100k_base`, etc.) with an explicit override.
- Runs in its own process on port 9000 so a panic or memory spike cannot
  touch the Next.js server.

This is the **only** Rust service we plan to add. The bar for any future
Rust service is the same as for any new language (see ADR 0005): a
specific hot path with a measured 10×+ gain that the existing stack
cannot match.

## Alternatives considered

- **Stay on `gpt-tokenizer` in-process.** Rejected because the worst-case
  latency directly degrades unrelated requests.
- **Use a Python service with `tiktoken`.** The Python binding wraps the
  same Rust core, so the work would land back in Rust anyway — adding a
  Python process is just extra hops. Skip the middleman.
- **Use WebAssembly in the browser.** Useful for client-side estimation
  later, but does not solve the server-side accounting problem.

## Consequences

**Positive:**

- Token counting no longer blocks the event loop.
- One extra binary to ship, but zero runtime dependencies (Rust links
  statically).
- We now have a place to add other tight inner loops in the future
  (chunking, hashing, deduplication) without re-litigating the language
  question.

**Negative:**

- New build dependency: the Rust toolchain. Added via the Replit
  `rust-stable` module; CI must cache `~/.cargo` and `target/` for
  reasonable build times.
- Engineers unfamiliar with Rust have one more thing to learn — but this
  service is ~150 lines and rarely changes.
