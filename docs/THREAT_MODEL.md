# Threat Model — Kalmeron Two

**Last updated:** 24 Apr 2026 · **Methodology:** STRIDE + LLM-specific (OWASP LLM Top 10) · **Owner:** Security Engineering

This document is the canonical threat model for Kalmeron Two. Update it whenever the architecture, trust boundaries, or external integrations change.

---

## 1. System Overview

Kalmeron Two is a multi-tenant Next.js 16 application that orchestrates 16 specialized AI agents over Google Gemini, persists tenant data in Firebase Firestore, exposes a public REST API behind scoped tokens, and ships an Expo mobile companion.

### 1.1 Trust boundaries

| # | Boundary | Inside | Outside |
|---|---|---|---|
| TB1 | Browser ↔ Edge | Anonymous user / authed user / API key client | Edge proxy (Vercel) + Next.js handlers |
| TB2 | Next.js (Node) ↔ Firebase Admin SDK | Server actions, API routes | Firebase Auth, Firestore, Cloud Storage |
| TB3 | Next.js ↔ Google Gemini | Prompt + tool schema | Gemini API |
| TB4 | Next.js ↔ Neo4j | Cypher queries | Neo4j Aura/cluster |
| TB5 | Next.js ↔ Stripe | Checkout/webhook payloads | Stripe API |
| TB6 | Next.js ↔ Webhooks (outbound) | Workspace-defined endpoints | 3rd-party customer endpoints |
| TB7 | Mobile (Expo) ↔ Public API | Mobile token | Same Next.js handlers as web |
| TB8 | Browser ↔ WebGPU model | Local inference (`@mlc-ai/web-llm`) | (no network) |

---

## 2. Assets (in priority order)

| Asset | Sensitivity | Why it matters |
|---|---|---|
| User identity & email | High (PII) | PDPL/GDPR; account takeover risk |
| Business plans, ideas, financial models | High (proprietary) | Trade secrets of the founder using us |
| Audit log integrity | High | Required for compliance and incident response |
| API keys (`kal_live_…`) | High | Direct programmatic access to a workspace |
| Stripe webhook secret | Critical | Allows forged payment events |
| Firebase service-account key | Critical | Admin SDK = bypass all rules |
| Gemini / model API keys | High | Cost-impact and exfiltration risk |
| LLM context (prompt + RAG) | Medium | Indirect injection vector |
| Telemetry (Sentry/Langfuse) | Medium | May contain user content snippets |

---

## 3. STRIDE — per trust boundary

### TB1 — Edge / browser surface

| STRIDE | Threat | Mitigation | Status |
|---|---|---|---|
| Spoofing | Forged Firebase ID token | `adminAuth.verifyIdToken` on every protected route | ✅ |
| Spoofing | Forged API key | SHA-256 hash comparison + revocation flag (`api-keys.ts`) | ✅ |
| Tampering | XSS via user-supplied content | Server-rendered React + `xss` lib for HTML; CSP enforced (`next.config.ts`) | ✅ (P0-5) |
| Tampering | CSRF on state-changing routes | SameSite cookies + Bearer token requirement; mutating routes require explicit Authorization header | ✅ |
| Repudiation | Action denial by authed user | Append-only audit log keyed by `actorId` + `requestId` | ✅ |
| Information Disclosure | Sensitive errors leaked to client | Centralized error responses in `route-guard.ts` strip stack traces; Sentry receives full detail | ✅ |
| DoS | Burst from one IP | Rate limit per `(path, principal)`; supports Upstash/KV backend (`lib/security/rate-limit.ts`) | ✅ (P0-3) |
| Elevation of Privilege | Direct call to admin route as user | `requirePlatformAdmin` flag + `PLATFORM_ADMIN_UIDS` env | ✅ |

### TB2 — Firestore / Admin SDK

| STRIDE | Threat | Mitigation | Status |
|---|---|---|---|
| Tampering | Cross-tenant write | `firestore.rules` deny-all fallback + per-collection owner checks | ✅ |
| Tampering | Audit log mutation by client | `audit_logs` not exposed to client rules; only Admin SDK writes | ✅ |
| Information Disclosure | Cross-tenant read | Skill collection scoped via `workspaces/{wid}/members/{uid}` existence check | ✅ |
| EoP | Member promotes themselves to owner | `setRole` requires server-side caller; client cannot mutate `workspace_members/*` | 🟡 needs explicit rule (P1) |

### TB3 — Gemini

| STRIDE / LLM | Threat | Mitigation | Status |
|---|---|---|---|
| LLM01 Prompt Injection | User input rewrites system prompt | `prompt-guard.ts` + `plan-guard.ts` (sanitize, isolate, intent allow-list) | ✅ |
| LLM02 Indirect Injection | Hostile RAG / PDF / web result triggers tool call | `checkToolCall` rejects when arg text matches >60 chars of any untrusted source | ✅ |
| LLM06 Sensitive Info Disclosure | Model leaks another tenant's data into context | RAG queries scoped by workspace/owner; per-agent system cards (P1) document data boundaries | 🟡 |
| LLM07 Insecure Plugin Design | Tool executes destructive action without consent | `agent-governance.ts` queues human approval for `high`/`critical` tools | ✅ |
| LLM10 Model DoS / Cost-blowup | Recursive loops, very long prompts | Per-agent rate limit + per-workspace quota + token-cost ledger | ✅ |

### TB4 — Neo4j

| Threat | Mitigation | Status |
|---|---|---|
| Cypher injection | Parameterized queries only (driver enforces bind variables) | 🟡 needs lint rule (P2) |
| Connection string leak | Stored in env, never logged | ✅ |

### TB5 — Stripe

| Threat | Mitigation | Status |
|---|---|---|
| Webhook spoofing | `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET` | ✅ |
| Replay attack | Stripe SDK verifies timestamp tolerance | ✅ |

### TB6 — Outbound webhooks (we → customer)

| Threat | Mitigation | Status |
|---|---|---|
| Receiver spoofing our calls | HMAC-SHA256 over body, header `x-kalmeron-signature` | ✅ |
| SSRF via attacker-supplied URL | URL allow-list (no localhost / RFC1918 / .internal) | 🟡 (P1) |
| Webhook used as oracle to scan internal network | Same as above + bounded retries | 🟡 (P1) |

### TB7 — Mobile

| Threat | Mitigation | Status |
|---|---|---|
| Token storage on device | Use Expo SecureStore (Keychain/Keystore) only | 🟡 verify (P1) |
| Reverse engineering of API key | API keys are user-issued, scoped, revocable | ✅ |
| MITM | Certificate pinning for API base URL | 🔴 not implemented |
| Biometric bypass | Re-prompt biometric every cold start; gate sensitive screens | 🟡 verify (P1) |

### TB8 — WebGPU

| Threat | Mitigation | Status |
|---|---|---|
| Untrusted model weights | Only `@mlc-ai/web-llm` published artifacts (CDN-pinned hash) | ✅ |
| Browser fingerprinting via WebGPU adapter info | Disabled by default; enabled per-feature behind explicit user opt-in | 🟡 (P2) |

---

## 4. Top residual risks (ranked)

1. **Indirect prompt injection through RAG** — partially mitigated; needs ongoing red-team eval (handled by `/api/cron/red-team`).
2. **Webhook SSRF** — needs URL allow-list and DNS pinning before public GA.
3. **Mobile cert pinning missing** — acceptable for closed beta, must ship before app-store submission.
4. **Cross-tenant read via mis-scoped Firestore listener** — covered by rules, but needs unit tests in CI (P0-2).
5. **Cost blowup from coordinated free-tier abuse** — quotas exist; need alerting at 70 % of monthly budget.

---

## 5. Review cadence

- Quarterly review with Security Engineering.
- Ad-hoc review on each new external integration, new agent tool, or new third-party SaaS.
- All P0/P1 mitigations from this document are tracked in `docs/EXPERT_PANEL_AUDIT_REPORT.md` §3.
