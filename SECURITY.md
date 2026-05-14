# Security Policy — كلميرون (Kalmeron AI)

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ Active |
| Older branches | ❌ No longer maintained |

We support the latest commit on `main`. Older releases receive security
updates only on a best-effort basis until the next tagged release.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately via one of:

1. **GitHub private vulnerability reporting** (preferred) — go to the
   repository's *Security* tab and click *Report a vulnerability*.
2. **Email** — `security@kalmeron.com` with subject prefix `[SECURITY]`.

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce (proof-of-concept code if possible).
- Affected file paths, endpoints, or services.
- Your suggested remediation, if any.

We will acknowledge your report within **48 hours** and aim to provide a
fix or mitigation within **14 days** for critical issues, **30 days** for
high severity, and **90 days** for medium/low severity.

## Disclosure Policy

We follow **coordinated disclosure**:

1. We confirm the vulnerability and assess impact.
2. We develop and test a fix in a private branch.
3. We release the fix and credit the reporter (unless anonymity is requested).
4. We publish a GitHub Security Advisory once users have had time to update.

---

## Running Security Checks Locally

```bash
# Full security scan (JS audit + Python pip-audit + TypeScript + ESLint + SAST patterns)
npm run security:check

# Individual checks
npm run lint                          # ESLint — 0 warnings enforced
npm run typecheck                     # TypeScript strict mode
npm audit                             # JS dependency CVEs
npm run security:py                   # Python pip-audit for all 4 services
node scripts/security/pin-actions.mjs # Re-pin GitHub Actions to SHA
```

---

## Security Architecture

### Authentication & Authorization
- Firebase Authentication (short-lived ID tokens, 1-hour TTL)
- Kalmeron API keys (`kal_live_…`) with per-key scope enforcement
- Every API route wrapped in `guardedRoute()` — rate-limiting + RBAC + audit log
- Platform-admin actions double-checked via `isPlatformAdmin(uid)`
- SSE endpoint (`/api/admin/mission-control/stream`) validates token length (20–4096 chars) before Firebase SDK call

### Input Validation
- All request bodies validated with **Zod schemas** before any processing
- `workspaceId` from URL params validated against allowlist regex `^[\w\-]{1,128}$`
- File paths in code-generation pipelines validated via `isSafePath()` before embedding in generated TypeScript

### SSRF Mitigation
- All internal service `fetch()` calls use `redirect: "error"` + `AbortSignal.timeout(10_000)`
- `egypt-calc` proxy has an explicit `ALLOWED_HOSTS` + `ALLOWED_PORTS` allowlist
- `pin-actions.mjs` and `generate-openapi.mjs` use per-request URL allowlists

### URL Sanitization
- Service Worker host checks use strict `===` / `endsWith()` — never `includes()`
- Push notification URLs validated against `/^\/[\w\-./]*$/` before `clients.openWindow()`
- `prompt-guard.ts` uses a fixed-point sanitization loop against multi-character injection

### Content Security
- LLM responses capped at 2 MB before being written to disk (`scripts/eval-models.ts`)
- Auto-generated TypeScript modules filtered through `isSafePath()` allowlist
- HTML sanitization via fixed-point loop in `src/lib/security/prompt-guard.ts`

### Dependency Security
- Python packages pinned to patch-level versions; upgraded on every CVE disclosure
- GitHub Actions pinned to full SHA via `scripts/security/pin-actions.mjs`
- JS dependencies audited on every PR via `npm audit` CI gate
- All Docker images run as non-root (`USER app`, UID 1001)
- `pip-audit` scans all 4 Python services in CI via `security:py` script

### Observability
- All security events (auth failures, rate-limit hits, RBAC denials) written to `writeAudit()`
- Log injection mitigated via `src/lib/security/sanitize-log.ts`

---

## Security Hardening Checklist

- [x] GitHub Actions pinned to immutable commit SHAs
- [x] Least-privilege `permissions:` blocks on every workflow
- [x] CodeQL, Semgrep, Trivy, gitleaks static analysis in CI
- [x] Dependabot for npm + pip + GitHub Actions
- [x] Non-root `USER` in every Dockerfile
- [x] Prompt-injection defenses (`src/lib/security/prompt-guard.ts`)
- [x] Log injection mitigation (`src/lib/security/sanitize-log.ts`)
- [x] Safe JSON-LD rendering (`src/lib/security/safe-json-ld.ts`)
- [x] SSRF: `redirect: "error"` on all internal fetch calls
- [x] Rate limiting on every API route via `guardedRoute()`

---

## Known Open Issues

| Package | Severity | Via | Status |
|---------|----------|-----|--------|
| `protobufjs` | High | `@temporalio/*` | Awaiting Temporal.io upstream fix |
| `@opentelemetry/exporter-prometheus` | High | `@traceloop/node-server-sdk` | Awaiting upstream fix |

These packages are used only in **development / observability tooling** and are not reachable from production request paths.

---

## Out of Scope

- Findings only reproducible against `localhost` development builds.
- Self-XSS requiring the victim to paste payloads into DevTools.
- Missing security headers on assets served by third-party CDNs we do not control.
- Volumetric DoS that does not exploit a code-level flaw.
