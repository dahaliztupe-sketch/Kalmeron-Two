# Runbook — Kalmeron Two

**Audience:** On-call engineer · **Update:** every quarter or after each incident.

---

## 0. Quick reference

| Channel | Where |
|---|---|
| Status board | `/status` (in-app) — live audit feed |
| Health endpoint | `GET /api/health` (no auth) |
| Health probe (cron) | `*/5 * * * *` → `/api/cron/health-probe` |
| Error tracking | Sentry project `kalmeron-prod` |
| LLM tracing | Langfuse → project `kalmeron` |
| Log search | Vercel logs + Pino structured JSON |

### Severity levels

| Level | Definition | Response time |
|---|---|---|
| SEV-1 | Login broken, payments broken, data leak suspected | 15 min, page on-call |
| SEV-2 | One agent down, p99 > 5 s, error rate > 5 % | 1 hour |
| SEV-3 | Cosmetic, single-tenant impact, workaround exists | next business day |

---

## 1. Scenario: Gemini / LLM provider outage

**Symptoms:** `/api/chat` returns 5xx; Sentry spike on `gemini.fetch_failed`; agent rate of `agent_run` audit drops to zero.

**Triage**
1. `curl https://generativelanguage.googleapis.com/v1beta/models -H "x-goog-api-key: $KEY"` — confirm provider side.
2. Open Google Cloud Status page; confirm regional outage.

**Mitigation**
1. In Vercel project env, set `MODEL_ROUTER_FORCE=fallback` to flip routing to backup provider configured in `src/lib/model-router.ts`.
2. If no backup is configured, post a banner via Edge Config key `banner.outage = true`.
3. Pause `/api/cron/red-team` to save quota: `vercel cron pause`.

**Recovery**
1. Once provider is healthy, unset `MODEL_ROUTER_FORCE`, redeploy or `vercel env pull && vercel deploy --prod`.
2. Replay queued requests from `dlq` Firestore collection (Temporal workflow `replayDlq`).

---

## 2. Scenario: Firestore quota / read storm

**Symptoms:** 503s from `/api/chat` and `/dashboard`; Sentry messages `quota exceeded`; Firebase Console shows red on Reads/sec.

**Triage**
1. Run `firebase firestore:usage` (locally with appropriate IAM).
2. Check `app/api/admin/events/route.ts` polling — heavy default 10 s interval can cause storms in admin tabs.

**Mitigation**
1. Throttle the live events poll: set `NEXT_PUBLIC_EVENTS_POLL_MS=60000` in Vercel env.
2. Enable read cache: set `KV_REST_API_URL` + `KV_REST_API_TOKEN` so the hot reads route through KV (cf. `src/lib/cache/`).
3. If a single tenant is the cause, throttle their tier via `workspaces/{id}.rateLimitOverride = 5/min`.

**Recovery**
1. Verify reads/sec back below baseline.
2. Open a P1 ticket for the offending query path; add an index to `firestore.indexes.json` if it was an unindexed scan.

---

## 3. Scenario: Stripe webhook failures

**Symptoms:** Subscriptions not activating; `stripe.webhooks.signature_invalid` in logs.

**Triage**
1. Check `STRIPE_WEBHOOK_SECRET` in Vercel matches the secret currently shown in Stripe Dashboard → Webhooks.
2. Look at the raw event in Stripe → Webhooks → recent attempts.

**Mitigation**
1. If secret mismatch, rotate via Stripe dashboard, copy new value to Vercel env, redeploy.
2. Use Stripe CLI to replay missed events: `stripe events resend evt_…`.

**Recovery**
1. Confirm subscription state in Firestore `subscriptions/{userId}` matches Stripe.
2. Run reconciliation: `npm run -- script reconcile-subscriptions`.

---

## 4. Scenario: Sentry alert flood

**Symptoms:** > 500 events/min in Sentry; on-call paged repeatedly for the same error.

**Triage**
1. Identify the fingerprint in Sentry; group by release.

**Mitigation**
1. If the bug is on the latest release: roll back via Vercel → Deployments → Promote previous.
2. If the noise is non-actionable: add an `Sentry.ignoreErrors` entry in `sentry.client.config.ts` and ship a hotfix.
3. Create an alert mute window: 1 hour max, set a follow-up reminder.

---

## 5. Scenario: RAG accuracy drop

**Symptoms:** Eval suite (`npm run eval`) reports recall@5 drop > 10 % vs baseline; user complaints about hallucinated sources.

**Triage**
1. Compare embeddings dimension and model in `src/lib/embeddings.ts` vs the indexed vectors.
2. Check Langfuse traces for retrieved chunks — are they irrelevant or empty?

**Mitigation**
1. If a recent re-index broke things, restore previous index from backup snapshot.
2. Lower retrieval k temporarily: `RAG_TOP_K=3` env to reduce noise.
3. Disable agents that depend on RAG in `feature-flags` Edge Config until fix.

**Recovery**
1. Run full eval suite; require ≥ baseline recall before re-enabling.
2. Postmortem within 5 business days.

---

## 6. Scenario: Suspected data leak / cross-tenant read

**Treat as SEV-1 immediately.**

1. Page security on-call.
2. Capture evidence: Sentry + audit_logs entries by `requestId`.
3. Disable the offending route via Edge Config kill-switch (`flags.disable_route.{path}=true`) — handled by `proxy.ts`.
4. Notify legal within 24 h (GDPR/PDPL clock starts).
5. Open a private postmortem doc; do not discuss in public Slack channels.

---

## 7. Standard postmortem template

```
## Summary
## Impact (users, duration, $$ if any)
## Timeline (UTC)
## Root cause
## What went well
## What didn't
## Action items (owner, due date, P0/P1)
```
