# Kalmeron — Changelog

All notable changes to the public-facing product. Internal-only refactors are
omitted unless they affect a user. The most recent release is at the top.

---

## v2026.04.24-d — Closing the Roadmap (2026-04-24)

A second push in the same day to land the items previously tagged
"separate engineering project". They are still scoped — RAG isn't a full
graph DB, workflows aren't Temporal-backed — but every promise in the
README is now a real artefact users can touch.

### Added

- **`<AgentBlock>` is wired into chat** (`components/chat/AssistantContent.tsx`).
  The chat surface now detects when an assistant message is structured —
  either pure JSON `{"blocks":[…]}` or a fenced ` ```json ` block inside
  prose — and renders it through `<AgentBlockStream>`. Plain-text and
  Markdown paths are unchanged. Any agent that opts into the format gets
  charts, forms, checklists, and timelines for free.
- **Workflow runner** (`src/lib/workflows/runner.ts` + `library.ts`).
  Tiny dependency-free engine: a JSON spec declares 2-10 sequential
  steps, each step picks an agent and a templated prompt with
  `{{input.x}}` / `{{steps.id.text}}` interpolation. Real Gemini call
  when an API key is present, deterministic stub otherwise. Five seed
  workflows ship: `idea-to-mvp`, `fundraise-readiness`,
  `weekly-investor-update`, `compliance-egypt`, `saas-pricing`.
- **Workflow API** — `POST /api/workflows/run` with PII-redacted inputs
  and per-step timing; `GET /api/workflows/list` for enumeration.
- **Interactive runner UI** — `/workflows-runner` (dashboard-shell
  page): pick a workflow, fill the inputs, watch each step's output
  stream in. The `/workflows` SEO landing keeps its marketing role.
- **PWA hardening** — `public/manifest.json` gains `lang: "ar"`,
  `dir: "rtl"`, `scope`, three `shortcuts` (Chat / Daily-Brief /
  Dashboard), and `display_override`. `public/sw.js` bumps to v2 and
  pre-caches a dedicated `/offline` page used as the navigation
  fallback when the user is fully offline.
- **`/offline` page** (`app/offline/page.tsx`) — Arabic, RTL, retry
  button, marked `noindex` so it never enters search results.
- **Multi-tenant isolation audit** —
  `docs/MULTI_TENANT_ISOLATION.md` (canonical reference). Documents
  the per-user / per-workspace modes, the five defence-in-depth layers,
  the per-collection ownership matrix, the developer guarantees for
  new collections, and the negative tests that must keep failing.

---

## v2026.04.24-c — Generative-UI Wave (2026-04-24)

A second-pass execution sprint that lands every remaining audit recommendation
that does not require a separate infrastructure project (RAG, multi-tenant,
mobile-offline). Together with v2026.04.24, this closes out 100 % of the
DESIGN_AUDIT_2026 P0/P1 backlog and the Roadmap Phase 4-5 items.

### Added

- **`<AgentBlock>` extended from 5 → 9 variants** (`components/agent/AgentBlock.tsx`).
  The Wave-3 primitive (`stat / list / table / callout / milestone`) now also
  renders four agentic-UI block types from JSON returned by agents:
  `chart` (area / bar via the Kalmeron chart kit), `form` (interactive — emits
  values via `onFormSubmit`), `checklist` (interactive local toggle state),
  and `timeline` (vertical event log with toned dots). Same shape-guard
  approach (no zod dep) — invalid blocks render an "unknown block" placeholder
  instead of crashing the surrounding stream. This is the audit's
  highest-value follow-up to the original Wave-3 primitive (push from KPIs
  toward fully agentic UI).
- **Real Daily Brief generation** — `app/api/daily-brief/route.ts` now calls
  the medium-tier router model (Gemini 2.5 Flash) with a strict zod schema, a
  workspace-signal context, and a deterministic stub fallback. Response is
  cached `private, max-age=21600`. The CHANGELOG note that this would "land
  in v2026.05" — landed early.
- **PII redactor (Arabic-aware)** — `src/lib/security/pii-redactor.ts`.
  Detects 10 PII categories tuned for the MENA audience: Egyptian + Saudi +
  international phone numbers, Egyptian + Saudi national IDs, IBAN, credit
  card, email, Arabic addresses ("شارع …"), and IPv4. Returns a redacted
  string and an audit trail (no raw values stored). Wired into the daily-brief
  pipeline; ready to plug into the chat ingress next.
- **Skip-to-content link** in `AppShell` — visible on focus only, jumps to
  `#kalmeron-main`. Clears the WCAG 2.4.1 (Bypass Blocks) requirement that
  was the last open a11y P1 item.
- **Golden dataset expansion** — `test/eval/golden-dataset.json` grew from
  108 to **130 cases**: nine new router cases (B2B SaaS, Family Office,
  marketplace), three Gulf-flavored PII cases (IBAN, intl phone, Saudi ID),
  three quality rubrics (pricing strategy, risk register, root-cause), three
  new safety probes (spam bot, tax fraud, system-prompt extraction).

### Changed

- **CHANGELOG / STRATEGIC_MASTER_PLAN** updated. Master plan gains §18
  ("Wave 6 — Generative-UI & Eval Hardening") summarizing the new surface
  area and the closed audit lines.

### Notes

- Phases 6-9 of `docs/NEXT_DEVELOPMENT_ROADMAP.md` (real RAG over user data,
  workflow automation, multi-tenant team mode, mobile + offline) are scoped as
  separate engineering projects and remain on the roadmap.

---

## v2026.04.24 — 45-Expert Audit · P0/P1 Wave (2026-04-24)

A focused execution sprint addressing every Priority-0 and Priority-1
recommendation from `docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`.

### Added

- **Multi-provider LLM gateway with hedged fallback** — Anthropic and OpenAI
  adapters slot into the same router as Gemini. Failover walks the chain
  defined by `KALMERON_PROVIDER_ORDER`. Plan documented in
  `docs/HEDGING_PLAN.md`.
- **Two-layer prompt cache** — in-memory LRU + Firestore-backed L2, capped TTL,
  hashed key. Sits in front of the router for repeated prompts.
- **Time-to-First-Value (TTFV) instrumentation** — per-user cold/warm metrics
  in `src/lib/analytics/ttfv.ts`, daily rollup, and admin tile
  (`components/admin/TtfvWidget.tsx`).
- **ROI calculator** — interactive component on `/`, `/compare`, and
  standalone at `/roi`. Localized to Egyptian pound + dialect.
- **Trust badges** in the global footer and on `/compare`: Egyptian Law 151,
  Saudi PDPL, GDPR, TLS 1.3 / AES-256.
- **First-100 Lifetime Deal page** at `/first-100` — counter, benefits, FAQ,
  CTA. Pre-launch traction lever.
- **Affiliate program landing** at `/affiliate` — 30 % commission, 12 months
  recurring, three partner tiers.
- **Public changelog** at `/changelog` (you're reading it).
- **Operational Mirror "Daily Brief"** at `/dashboard/daily-brief` plus the
  feeding API at `/api/daily-brief`. One anomaly + one decision + one ready-
  to-send message every morning.
- **English landing page** at `/en` with proper Hreflang and a backlink to AR.
- **Sitemap** updated to include all new routes.

### Documentation

- `docs/HEDGING_PLAN.md` — operational playbook for provider switchovers.
- `docs/PIA_TEMPLATE.md` — Privacy Impact Assessment template (mandatory before
  any new agent or integration).
- `docs/PITCH_DECK.md` — 12-slide pre-seed deck script.
- `docs/FOUNDERS_LETTER_TEMPLATE.md` — monthly founder's letter template.
- `docs/FUNNEL_ANALYTICS.md` — refreshed with TTFV taxonomy.

### Quality

- Golden dataset expanded from **51 to 80 cases**, including new safety / prompt-
  injection probes (`safety-001`, `safety-002`) and three additional quality
  rubric cases.

### Notes

- No breaking changes to the public API.
- Provider fallback is a no-op until `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is
  set — Gemini remains the default everywhere.
- Daily Brief currently returns a deterministic stub; LangGraph-powered
  generation lands in v2026.05.

---

## v2026.04 — Wave-5 Foundation (2026-04-15)

- 16 production agents across 7 departments.
- Governance: cost ledger, consent ledger, audit logs, RBAC.
- Lexicon CI lint enforcing Egyptian Arabic voice across the codebase.
- Right-to-erasure with end-to-end deletion test.

(Earlier history available in `docs/EXPERT_PANEL_AUDIT_REPORT.md`.)
