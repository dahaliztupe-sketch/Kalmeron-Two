# Changelog

All notable changes to Kalmeron Two are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [SemVer](https://semver.org/).

## [Unreleased]

### Added — Wave 5 (Foundation Cleanup & Quality Moat, 2026-04-24)
- **Lexicon CI lint** (`scripts/lexicon-lint.ts` + `npm run lint:lexicon`) — scans `app/` and `components/` for forbidden aliases listed in `src/lib/copy/lexicon.ts`. Word-boundary-aware (won't false-positive on `cfo_agent` identifiers or `space-y-2` Tailwind classes), uses a stoplist of generic English terms (`agent`, `space`, `seed`, etc.), respects `// lexicon-allow` escape-hatch comments (3-line lookback for multi-line JSX), and explicitly allowlists technical surfaces (`/mcp-server`, `/api-docs`, `/llms.txt`, `/ai-experts/*`, `/experts`).
- **Backup verification script** (`scripts/verify-backup.ts` + `npm run verify:backup`) — checks the most recent Firestore backup (native GCS export with logical-snapshot fallback): age ≤ 36 h, all required collections (`users`, `workspaces`, `business_plans`) present, document count > 0. Designed for nightly CI cron — exits non-zero on staleness or missing data.
- **A/B testing framework** (`src/lib/experiments/ab.ts`) — deterministic FNV-1a bucket assignment, two seeded experiments (`landing_hero_copy` 50/25/25 split, `pricing_yearly_default` 50/50). `assignAndTrack()` records exposure via the existing analytics pipeline. Edge-runtime safe, never throws on caller path.
- **Six new agent system cards** (`docs/agents/`): `plan-builder.md`, `mistake-shield.md`, `success-museum.md`, `opportunity-radar.md`, `real-estate.md`, `general-chat.md`. All 9 cards now in the README index match a real file. Updated index notes that 7 more agents (HR, Marketing, Sales, Operations, Product, Investor, Customer Voice) ship cards in Wave 6.
- **Golden-dataset expanded** (`test/eval/golden-dataset.json`) from 26 → 51 cases: 35 router cases (covering all 9 agents with 3-4 prompts each), 8 safety cases (added phishing/fraud/role-play jailbreak/destructive-command rubrics), 5 PII cases (added credit-card / address / mixed PII rubrics), 3 quality cases (Egyptian-channel marketing, Egyptian-tax brackets, Egyptian-authority mentions). Updated `qualityRubric` weights to include `factual_accuracy` (0.10).

### Changed — Wave 5
- **`brand-gold` token retired**: 29 user-facing files migrated from `text/bg/border/ring/from/to/via-brand-gold` → `-brand-cyan` and from `rgb(var(--gold))` → `rgb(var(--brand-cyan))`. Removed `--color-brand-gold` from the Tailwind v4 `@theme` block in `app/globals.css` and `--gold` from `:root`. `--tech-blue` retained (still referenced by legacy gradients).
- **Agent terminology unified site-wide**: 35 user-facing files swept via word-form-ordered `sed` (`وكلاؤنا → مساعدونا`, `للوكلاء → للمساعدين`, `الوكلاء → المساعدين`, `الوكيل → المساعد`, `وكلاء → مساعدين`, `وكيل → مساعد`). Skipped `/api/` route comments since they aren't user-visible. Eliminated remaining `Legal Shield` / `CFO Agent` English subtitles on the landing page.
- **Final landing-page count fixes**: three more `+50 / +٥٠ / 50+ مساعداً ذكياً` leaks caught by the new lint and corrected to `16 / ١٦` in `app/page.tsx` (FEATURES card, hero subtitle, footer tagline).
- **Lexicon hardened**: removed `"خبير"` from `agentSingular.aliases` (it's a brand-approved alternative term, not a forbidden alias) — documented inline with a "re-add only after copy-team review" note.
- **`docs/agents/README.md`** now states explicitly that all 9 listed cards exist + which 7 production agents are scheduled for Wave 6.

### Changed — Wave 4 (Final Copy & Motion Cleanup, 2026-04-24)
- **Brand-count copy fully unified** to "16 مساعداً ذكياً (عبر 7 أقسام)". The remaining "+50 / 50+ وكيل" leaks were removed from `app/auth/signup/page.tsx` (PERKS), `app/compare/page.tsx` (feature row), `app/mcp-server/page.tsx` (page description + the "Tools" feature card), `app/llms.txt/route.ts` (Arabic summary + the English LLM-crawler paragraph), `components/onboarding/OnboardingForm.tsx` (welcome bullet), `app/(dashboard)/chat/page.tsx` (empty-state intro), `src/lib/seo/comparisons.ts` (3 hero intros: ChatGPT, Claude, Manus), `src/lib/seo/blog-posts.ts` (long-form post body), and the landing-page `STATS` block in `app/page.tsx` (`value: 50, suffix: "+"` → `value: 16, suffix: ""`).
- **Lexicon hardened**: `src/lib/copy/lexicon.ts` `agentPlural.aliases` now lists both `"+50 وكيل ذكي"` AND `"50+ وكيل"` so any future reviewer sweep flags either form as a forbidden alias.
- **Reduced-motion support extended** to the public top-of-funnel:
  - `app/page.tsx` `<Hero>` — `useReducedMotion()` collapses the parallax `useTransform` ranges (`heroY` / `heroOpacity`) to no-op when active. Eliminates the 140 px scroll-driven slide and the 1 → 0.3 opacity fade.
  - `app/auth/login/page.tsx` and `app/auth/signup/page.tsx` — wrapper `motion.div` now drops the `y: 20` initial transform when reduced, fading only with shorter duration.
- **`globals.css` gold tokens re-documented** (not removed): `--color-brand-gold` (in `@theme`) and `--gold` (in `:root`) carry an explicit DEPRECATED block-comment explaining that ~15 components still depend on the generated `text-brand-gold` / `bg-brand-gold` Tailwind utilities and `rgb(var(--gold))` literals. The tokens stay as aliases of cyan/indigo to avoid mass regression while the per-consumer migration is scheduled.

### Added — Wave 3 (Design Language Execution, 2026-04-24)
- **`<CommandPalette>`** (`components/ui/CommandPalette.tsx`) — vanilla ⌘K palette built atop `@base-ui/react/dialog`. Searches `NAV_SECTIONS` (single source of truth), keyboard-navigable (↑/↓/Enter/Esc), ranked by label-position, RTL-aware. Wired globally in `AppShell.tsx`. The header search button (previously a no-op) now opens it; new `useCommandPaletteShortcut` hook registers `Meta/Ctrl+K`.
- **`<AgentBlock>` Generative-UI primitive** (`components/agent/AgentBlock.tsx`) — single canonical renderer for AI-streamed structured output. Five variants: `stat` (KPI tile with optional currency / compact / delta), `list`, `table`, `callout` (info/warn/success/danger/neutral), `milestone` (timeline). Built-in shape guard renders an unknown-block placeholder instead of crashing the stream. Companion `<AgentBlockStream>` for arrays.
- **Currency formatter** (`src/lib/format/currency.ts`) — `formatCurrency`, `formatCompactNumber`, `annualToMonthly` helpers + `CURRENCY_LABEL_AR/EN` maps for EGP/SAR/AED/USD. Locale-aware `Intl.NumberFormat`, defensive against `NaN`/`null`, smart fraction-digits.
- **i18n message bundles expanded**: `messages/{ar,en}.json` grew from `LearnedSkills`-only (37 lines) to ~150 keys covering `Common`, `Nav`, `CTA`, `Trust`, `Dashboard`, `CommandPalette`, `Pricing`, `Errors` (plus the existing `LearnedSkills` namespace). Every public surface can now be wired through `next-intl`.

### Changed — Wave 3
- **Brand copy unified to "16 production agents"**: `app/layout.tsx` (metadata description + OG/Twitter + JSON-LD) and `components/layout/AppShell.tsx` (logged-out hero) all now say "7 أقسام و16 مساعداً ذكياً" instead of the inconsistent "50+ وكيلاً". Aligns the marketing surface with the canonical fact in `replit.md` line 3 (16 production + 12 SEO-only `/ai-experts/[slug]` pages).
- **Reduced-motion support** added to dashboard (`app/(dashboard)/dashboard/page.tsx`) and `AppShell.tsx`. New `itemVReduced` / `containerVReduced` variants fade only — no transform, no stagger — when `useReducedMotion()` is true. The route-transition `motion.div` in AppShell similarly skips the `y: 10` slide.
- **Dashboard polling**: 12s → 30s, and skipped while the tab is hidden via `document.visibilityState`. A `visibilitychange` listener triggers a fresh load on tab-return. Saves Firestore reads + battery on idle tabs.
- **Tagline canonicalised** from "نظام تشغيل لرواد الأعمال" to "مقرّ عمليات شركتك الذكي" (the `LEXICON.tagline` canonical) across metadata, OG cards, and JSON-LD.
- **`globals.css` token cleanup**: `--color-brand-gold` flagged DEPRECATED with a comment (kept as alias for back-compat); body-level `font-variant-numeric: tabular-nums` switched to `proportional-nums` (tabular is now opt-in via the existing `.tabular` utility — Arabic body copy was getting awkwardly spaced numerals); new `--border-subtle` token documents the alpha-at-use-site convention.

### Removed — Wave 3
- `public/brand/kalmeron-logo-original.jpg` (unused legacy asset, ~uncompressed JPEG).

### Added — Wave 2 (Documentation → Code, 2026-04-24)
- **Consent ledger** module (`src/lib/consent/state.ts`) with append-only event store and `grantConsent` / `withdrawConsent` / `hasConsent` / `withdrawAll` helpers.
- **Analytics** module (`src/lib/analytics/track.ts`) — Firestore source-of-truth + best-effort PostHog mirror with PII stripping.
- **Cost ledger** module (`src/lib/observability/cost-ledger.ts`) — `recordCost`, hourly + daily rollup aggregation, `queryDailyRollup`, `queryMonthlyTotal`, `recentDaily` for the dashboard.
- **SSRF guard** (`src/lib/security/url-allowlist.ts`) — synchronous validator + Node-only `assertSafeUrlNode` with DNS rebinding defense; blocks RFC1918 / loopback / link-local / metadata IPs and `.internal/.local/.corp` suffixes.
- **API endpoints**:
  - `POST /api/consent/grant`, `POST /api/consent/withdraw`, `GET /api/consent/list` (auth-required, rate-limited).
  - `/api/cron/aggregate-costs` (every 15 min) — materializes `cost_rollups` and `cost_rollups_daily`.
- **Public pages**:
  - `/status` — public uptime page reading `_health/probe-summary`.
  - `/trust` — Trust Center with security/privacy/AI controls and responsible-disclosure policy.
- **Dashboard upgrade**: `/admin/costs` rewritten to read from real `cost_rollups_daily` (was hardcoded mock data) with sparkline + per-agent / per-workspace breakdown + empty state.
- `recordRoutedCost` helper in `src/lib/model-router.ts` so any agent can log a routed call in one line.
- `test/url-allowlist.test.ts` — 7 cases covering private ranges, malformed URLs, internal suffixes.

### Changed — Wave 2
- **`src/lib/webhooks/dispatcher.ts`** rewritten: full SSRF guard at subscribe time AND right before each delivery, `redirect: 'manual'` to prevent bypass via 30x, removed all `as any`, properly typed records.
- **Firestore rules** (`firestore.rules`): added per-collection rules for `consent_events` (read-own / server-write only), `analytics_events`, `cost_events`, `cost_rollups`, `cost_rollups_daily`, `account_deletions`.
- **ESLint** (`eslint.config.mjs`): warn on new `@typescript-eslint/no-explicit-any` in `src/`, `app/`, `lib/`, `components/`; pragmatic exemptions for tests and `firebase-admin.ts`.
- Renamed authenticated dashboard page `/(dashboard)/status` → `/(dashboard)/system-health` to free `/status` for the new public uptime page (no internal links broke; verified via grep).

### Added — Wave 1 (Security & Documentation, 2026-04-23)
- 39-expert audit report (`docs/EXPERT_PANEL_AUDIT_REPORT.md`).
- Threat model (`docs/THREAT_MODEL.md`) using STRIDE + OWASP LLM Top 10.
- On-call runbook (`docs/RUNBOOK.md`) with 6 incident playbooks.
- Service-level objectives (`docs/SLO.md`).
- Agent system cards (`docs/agents/`): index + Idea Validator, Legal Guide, CFO + template.
- OpenAPI 3.1 specification (`docs/api/openapi.yaml`) and live `/api-docs` page.
- Cron endpoints `/api/cron/health-probe` (every 5 min) and `/api/cron/firestore-backup` (daily).
- GitHub Actions workflow `security.yml` (npm audit, CodeQL, Gitleaks).
- Dependabot config grouping production vs dev dependencies.

### Changed
- **Security:** removed all `as any` from `src/lib/security/*` and `src/lib/audit/log.ts`.
- **Security:** Content-Security-Policy now enforced (Report-Only in dev, enforced in prod) with COOP/CORP siblings.
- **Reliability:** `lib/security/rate-limit.ts` rewritten with pluggable Upstash Redis / Vercel KV REST backend; in-memory only as fallback. New `rateLimitAsync` API.
- `replit.md` reconciled the "16 vs 50+" agent contradiction; canonical count is now 16 production agents.

### Removed
- Empty placeholder docs (`docs_AI_MODELS.md`, `docs_DISASTER_RECOVERY.md`, `docs_MULTI_REGION.md`, `docs_VECTOR_DB_MIGRATION.md`).
- `test.txt`, `tsconfig.tsbuildinfo` from repo (added to `.gitignore`).

## [0.1.0] — 2026-04-23
- Initial Phase 4 milestone: scalability scaffolding, multi-region notes, vector DB migration plan, AI model inventory.
