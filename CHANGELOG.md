# Changelog

All notable changes to Kalmeron Two are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [SemVer](https://semver.org/).

## [Unreleased]

### Added
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
