# Security Specification — Kalmeron Two

> This document is intentionally short. The authoritative sources are:
> - **Threat model:** [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md)
> - **Audit report:** [`docs/EXPERT_PANEL_AUDIT_REPORT.md`](docs/EXPERT_PANEL_AUDIT_REPORT.md)
> - **Runbook:** [`docs/RUNBOOK.md`](docs/RUNBOOK.md)
> - **SLOs:** [`docs/SLO.md`](docs/SLO.md)

This file is preserved only for legacy backlinks. Do not add new content here — extend the documents above instead.

## 1. Scope (one paragraph)
Kalmeron Two is a multi-tenant Arabic AI OS. The security boundary lives at the
Next.js API layer; everything below it (Firestore, Neo4j, Stripe, Gemini) is
called from the trusted server, never from the browser. Authentication is
Firebase Auth ID tokens (web/mobile) or workspace-scoped API keys
(`kal_live_…`) for programmatic access. Authorization is RBAC over
`workspace_members/{wid_uid}`.

## 2. Data invariants
- Every Firestore document under a workspace must include `workspaceId`.
- `audit_logs` is append-only — enforced by Firestore rules (no update / delete).
- `api_keys` store only SHA-256 hashes; the raw value is shown to the user
  exactly once at creation.
- `users` documents may only be read by their owner or a platform admin.

## 3. Test plan
Firestore rules tests live in `test/firestore-rules.test.ts` and run in CI via
`npm run test:rules`. They cover the "Dirty Dozen" anti-payloads from the
previous draft of this spec, now formalized in the rules-test file itself.
