# Kalmeron — Changelog

All notable changes to the public-facing product. Internal-only refactors are
omitted unless they affect a user. The most recent release is at the top.

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
