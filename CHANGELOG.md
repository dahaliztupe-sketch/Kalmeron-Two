# Changelog

All notable changes to Kalmeron Two are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [SemVer](https://semver.org/).

## [Unreleased]

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
