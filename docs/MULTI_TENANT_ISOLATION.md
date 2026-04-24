# Multi-Tenant Isolation — audit & operating model

**Status:** Implemented (Wave 6 — 2026-04-24)
**Owner:** Platform / Security
**Scope:** Firestore data plane, API routes, observability rollups.

This document is the canonical reference for *how* Kalmeron isolates one
customer's data from another. It exists so future engineers can answer
"what happens if user A tries to read user B's data?" in under five
minutes and so auditors can map our controls to ISO 27001 / SOC 2.

---

## 1. Two isolation modes — `per-user` and `per-workspace`

The platform mixes two ownership models because B2C and B2B sit on the
same code base.

| Mode | Owner field | Use cases |
|---|---|---|
| **Per-user** | `userId` on each document | Personal artefacts: ideas, business plans, chat history, saved companies, persona drafts, user_memory, market experiments, mistakes_viewed |
| **Per-workspace** | `workspaceId` on each document + membership doc at `workspaces/{wid}/members/{uid}` | Tenant-shared artefacts: learned skills today; in roadmap: shared chats, tasks, dashboards |

Both modes deny by default (`match /{document=**} { allow read, write: if false; }`).
There is no third "public" mode — public read collections are explicit
allow-listed (`opportunities`, `success_stories`).

---

## 2. Defence-in-depth layers

| Layer | What it enforces | Where it lives |
|---|---|---|
| **L1 — Firestore Rules** | Authn + authz on every document op | `firestore.rules` |
| **L2 — Workspace membership check** | Cross-tenant read prevention | rule helper: `exists(/databases/$(db)/documents/workspaces/$(wid)/members/$(uid))` |
| **L3 — Server-side ownership rebind** | API routes always read `request.auth.uid` from the verified ID token, never trust a `userId` in the payload | every route under `app/api/*` that mutates state |
| **L4 — Admin-SDK-only collections** | Sensitive collections (cost ledger, analytics, account_deletions, consent_events writes, prompt_cache rollups, learned_skills writes) are completely off-limits to clients | `firestore.rules` line ranges per collection |
| **L5 — PII redactor in ingress** | Even an authorised user's prompt has its PII redacted before it reaches a model so that cross-workspace prompt logs never leak Egyptian/Saudi/Gulf identifiers | `src/lib/security/pii-redactor.ts` (now wired into `/api/daily-brief` and `/api/workflows/run`) |

---

## 3. Per-collection ownership matrix (audit-ready)

The following table is generated from `firestore.rules`. If it disagrees
with the file, **the file wins** — re-run the audit and update this doc.

| Collection | Mode | Read | Create | Update | Delete |
|---|---|---|---|---|---|
| `users/{uid}` | per-user | owner | owner (must include `email`) | owner | server-only |
| `users/{uid}/tasks/{tid}` | per-user (subcoll) | owner & `createdBy==uid` | owner + valid task shape | owner + status≠completed | owner |
| `user_credits/{uid}` | per-user | owner | server | server | server |
| `ideas`, `business_plans`, `chat_history`, `user_memory`, `saved_companies`, `mistakes_viewed`, `personas`, `market_experiments` | per-user | owner | owner | owner | owner |
| `skills/{sid}` (learned skills) | per-workspace | members of `workspaceId` | server | server | server |
| `opportunities`, `success_stories` | public read | anyone | server | server | server |
| `consent_events` | per-user audit log | owner reads only | server | server | server |
| `_health`, `analytics_events`, `cost_events`, `cost_rollups`, `cost_rollups_daily`, `account_deletions` | server-only | server | server | server | server |

---

## 4. Required developer guarantees

When you add a new collection, you must:

1. **Add a rule before merging.** The default-deny block at the top of
   `firestore.rules` will silently break the feature otherwise — better
   to fail loud at PR review than at runtime.
2. **Choose a mode and document it inline** (`// per-user` / `// per-workspace` / `// server-only`).
3. **Mirror the rule in the API route.** Even with rules, use Admin SDK
   server-side and rebind `userId` / `workspaceId` from the verified
   token — never from the request body. This is L3 above.
4. **For `per-workspace` collections, add an index on `workspaceId`** so
   listing queries are tractable; the admin UI's per-tenant filters
   depend on it.

---

## 5. Negative tests — what *shouldn't* work

The intent of isolation can only be verified by trying to break it.
The following must fail; if any starts succeeding, that's a P0 incident.

- User A signed in tries to `getDoc("ideas/<doc-of-B>")` → **denied**.
- Anonymous client tries to `getDoc("user_credits/<any-uid>")` → **denied**.
- Server route accepts `body.userId` and writes a doc with that owner
  → **forbidden by code review** (rebind from token).
- Workspace member of W1 tries to read a `skills/{id}` doc whose
  `workspaceId === "W2"` → **denied** by the membership-existence check.
- Cross-tenant aggregate of `cost_rollups` returned to a client UI
  → **impossible** because the collection is server-only and admin UI
  proxies through Admin SDK with explicit per-tenant filtering.

---

## 6. Wave-6 follow-ups (not done in this session)

- Add `workspaceId` to per-user collections that B2B teams want to share
  (`ideas`, `business_plans`) under a feature flag, then evolve their
  rules to "owner *or* workspace member with role≥reader".
- Move chat history toward per-workspace mode for Team plans, with
  message-level ACL for sensitive threads.
- Wire workspace-scoped rate limits in `src/lib/middleware/rate-limit.ts`
  so a single tenant can't starve others.
