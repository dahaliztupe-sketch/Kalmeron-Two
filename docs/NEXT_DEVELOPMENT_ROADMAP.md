# Kalmeron Two — Next Development Roadmap

_Last updated: April 2026 — after Phase 1, 2, 3 (observability + caching) shipped._

This roadmap is the recommended order of work for the next 6–10 weeks. Each
phase is grouped so it can ship as one PR or one sprint and immediately
deliver user-visible value.

---

## Phase 4 — Activate Observability (Week 1)

Goal: turn the wiring we just shipped into a live governance picture.

1. **Provision Langfuse Cloud** project and set `LANGFUSE_PUBLIC_KEY` /
   `LANGFUSE_SECRET_KEY`. Verify traces appear after one chat session.
2. **Provision Sentry** project and set `NEXT_PUBLIC_SENTRY_DSN`. Trigger a
   test error from `/api/admin/drift` to confirm capture.
3. **Instrument the remaining agents** with `instrumentAgent()`:
   `persona-generator`, `marketing-strategist`, `sales-coach`,
   `supply-chain-optimizer`, `real-estate-analyst`, `success-museum-curator`,
   `digital-twin/graphrag`. Pattern is identical to `cfo-agent`.
4. **Drift dashboard widgets**: bind the existing `/api/admin/drift`
   endpoint to a `<KalmeronLineChart>` on `/admin` (latency p50/p95 over
   time + error rate) and a `<KalmeronBarChart>` (calls per agent / day).
5. **Cost dashboard**: pull token usage from Langfuse via its REST API and
   render a daily cost breakdown by model, using
   `MODEL_ALIASES` cost table from `src/lib/model-router.ts`.

**Acceptance**: Admin opens `/admin` and sees live latency, error rate,
calls/day per agent, and a daily cost number.

---

## Phase 5 — Evaluation & Quality Gates (Week 2)

Goal: stop shipping prompt changes blind.

1. **Golden-set evals** per agent (10–20 Arabic Q/A pairs each) committed
   under `evals/<agent>/cases.json`.
2. **Eval runner** (`pnpm run eval` or `npm run eval`) that:
   - replays the cases through `instrumentAgent()`
   - scores each output with a Gemini-as-judge rubric
   - posts the score to Langfuse via `langfuse.score()`
   - fails CI if any agent regresses below threshold.
3. **GitHub Action**: run the eval suite on every PR touching
   `src/ai/agents/**` or `src/lib/security/**`.
4. **PII redaction** in eval logs (existing `plan-guard.ts` already
   detects untrusted sources; extend with an Arabic-aware regex pass for
   phone numbers and national IDs before traces leave the server).

**Acceptance**: a PR that weakens a prompt fails CI before merge.

---

## Phase 6 — Real RAG over User Data (Weeks 3–4)

Goal: the personal CFO actually reads your books.

1. **Document ingestion**:
   - File upload UI on `/finance` and `/operations` (PDF, CSV, XLSX).
   - Parse on server with `pdf-parse` + `xlsx` (already in tree).
   - Chunk → embed with `gemini-embedding-001` → store in Firestore
     vector index (or pgvector if you flip to Postgres for embeddings).
2. **Per-user namespace**: every chunk tagged with `userId`; retrieval
   filtered server-side. PlanGuard already blocks cross-tenant tool calls.
3. **Citations in answers**: ThoughtChain gains a "Sources" panel showing
   the chunks the model actually used, with click-through to the original
   document.
4. **GraphRAG upgrade**: extend `digital-twin/graphrag.ts` to extract
   entities (suppliers, customers, SKUs) and surface a knowledge graph
   view on `/digital-twin` using the existing chart primitives.

**Acceptance**: user uploads a 12-month P&L and asks "What was my worst
month?" — answer cites the exact row.

---

## Phase 7 — Workflow Automation (Weeks 5–6)

Goal: agents stop being chatbots and start doing work.

1. **Background jobs queue** (BullMQ on Upstash Redis, or Trigger.dev — both
   free tiers exist). Use it for: scheduled forecasts, weekly digests,
   anomaly alerts from `forecaster.detectAnomalies`.
2. **Agent → action contracts** (`src/ai/actions/*`): a typed registry of
   side-effecting tools (send email, create invoice, schedule meeting)
   with explicit user-approval gates surfaced in the chat UI.
3. **Approval inbox** at `/inbox` showing pending agent actions; one-click
   approve / reject / edit.
4. **Email + WhatsApp notification rails** (Resend for email; WhatsApp
   Business API or Twilio when budget allows).

**Acceptance**: forecaster detects MRR anomaly Sunday night → user gets
WhatsApp ping Monday morning with one-tap "investigate".

---

## Phase 8 — Multi-Tenant & Team Mode (Weeks 7–8)

Goal: from solo entrepreneur to small team.

1. **Workspace model** in Firestore: `workspaces/{wid}/members/{uid}` with
   roles (owner, finance, ops, viewer).
2. **Workspace switcher** in the existing 3-section sidebar.
3. **Per-workspace memory + RAG namespace** (extends Phase 6 isolation).
4. **Audit log** of every admin action (who restarted which agent, who
   approved which automation), surfaced on `/admin/audit`.
5. **Billing** — wire existing Stripe code to per-seat pricing and meter
   Langfuse-reported tokens for usage-based add-ons.

**Acceptance**: a 3-person team shares one workspace, sees the same
dashboards, and the owner can revoke a member in one click.

---

## Phase 9 — Mobile + Offline (Weeks 9–10)

Goal: meet entrepreneurs where they actually work — on the phone, often
with bad signal.

1. **PWA manifest hardening** (already partially done) + install prompt.
2. **Offline-first reads**: React Query persister already covers this; add
   a service worker (Workbox) so the app shell loads without network.
3. **Voice input** in Arabic chat using the Web Speech API with a Gemini
   fallback for browsers that lack it.
4. **Native wrapper** (Capacitor) when warranted, reusing 100% of the
   existing Next.js code via static export of `/chat` + `/dashboard`.

**Acceptance**: user opens the app on the metro with no signal and can
still read yesterday's dashboard and queue a question for sync.

---

## Cross-cutting work (continuous)

- **Security**: rotate Firebase service-account quarterly; run
  `npm audit` weekly; add OWASP ZAP scan to CI.
- **Performance**: convert the heaviest API routes
  (`/api/dashboard`, `/api/admin/drift`) to Edge runtime once they no
  longer need Node-only deps; this also unlocks `cacheComponents`.
- **i18n**: keep Arabic as primary; add full English parity once Phase 6
  ships (RAG citations need translated UI strings).
- **Documentation**: every new agent must ship with an entry in
  `replit.md` and a golden-set in `evals/`.

---

## Decisions to make before Phase 4 starts

1. Langfuse Cloud vs self-hosted? (Cloud free tier covers ≤50k events/mo.)
2. Sentry plan tier? (Developer free tier = 5k errors/mo.)
3. Background queue: BullMQ-on-Upstash vs Trigger.dev. Trigger.dev wins on
   DX, Upstash wins on price at scale.
4. Embeddings store: stay on Firestore vectors, or move to pgvector on the
   existing PostgreSQL `DATABASE_URL`? pgvector is cheaper and supports
   real ANN; Firestore is simpler.

These four picks unblock everything from Phase 4 onward.
