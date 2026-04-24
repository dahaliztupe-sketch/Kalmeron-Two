# Funnel Analytics — Event Taxonomy

**Updated:** 2026-04-24 · **Owners:** Growth + Data Eng

This document is the **single source of truth** for what events Kalmeron emits, when they fire, and how they roll up into the activation/monetization funnel that powers `/admin/funnel`.

If you are adding a new event, edit `src/lib/analytics/track.ts` (the `AnalyticsEvent` union) AND this document in the same PR.

---

## Canonical funnel

```
landing_visited            ← anonymous
   │
   ▼
signup_started             ← anonymous (sign-up page mounted)
   │
   ▼
signup_completed           ← user authenticated
   │
   ▼
first_chat_message_sent    ← ACTIVATION KPI
   │
   ▼
agent_re_used              ← HABIT KPI (came back to use any agent again)
   │
   ▼
trial_started              ← OPTIONAL — only for plans with a trial
   │
   ▼
subscription_activated     ← MONETIZATION KPI (Stripe webhook confirmed)
```

Cancel signal: `subscription_cancelled` — used for churn reports, NOT part of the activation funnel.

---

## Event reference

| Event | Fired by | Required props | Notes |
|---|---|---|---|
| `landing_visited` | `app/page.tsx` (server component) | `requestId`, `referrer?`, `utm_*?` | Anonymous; deduped by `requestId` |
| `signup_started` | `app/signup/page.tsx` mount | `requestId` | Anonymous |
| `signup_completed` | `/api/auth/mark-signup` (after Firebase Auth success) | `userId` | Authenticated |
| `onboarding_step_completed` | onboarding page steps | `userId`, `step` | Used for onboarding drop-off, not the main funnel |
| `first_idea_validated` | `/api/ideas/analyze` first call per user | `userId`, `ideaId` | Activation alternative for "validator-first" cohort |
| `first_chat_message_sent` | `/api/chat` first call per user | `userId`, `agentId` | **Primary activation KPI** |
| `agent_re_used` | `/api/chat` calls #2+ within 7 days | `userId`, `agentId` | Habit signal |
| `weekly_active` | weekly cron | `userId` | Used for WAU/MAU only |
| `trial_started` | Stripe webhook `trial_started` | `userId`, `plan` | Optional |
| `subscription_activated` | Stripe webhook `customer.subscription.created` (status=active) | `userId`, `plan`, `priceId` | **Monetization KPI** |
| `subscription_cancelled` | Stripe webhook `customer.subscription.deleted` | `userId`, `plan` | Churn |

---

## How counts are computed

The `/api/admin/funnel` endpoint groups by `userId` (or `requestId` for the two anonymous stages) and counts **distinct identifiers per stage** within the time window. This means a user who visits landing 100 times in 7 days counts once.

Conversion rate at stage N = `count(stage N) / count(stage N-1)` over the same window.

> **Important caveat:** because we count distinct identifiers per stage independently, the conversion rates are *cohort-naive* — they do not require that the user reached stage N-1 first. A more accurate cohort-attributed funnel requires a downstream warehouse (BigQuery / Databricks) and is on the roadmap. For our scale today (<10k weekly users) the naive view is within ~5% of the cohort view; revisit when MAU > 50k.

---

## Health thresholds (April 2026)

| Conversion | Healthy | Action if below |
|---|---|---|
| visit → activation | ≥ 5% | Top-of-funnel review (landing page test, signup friction) |
| activation → paid | ≥ 10% | Pricing review, value-prop interview, paywall placement |
| signup_completed → first_chat_message_sent | ≥ 60% | Onboarding redesign |
| first_chat_message_sent → agent_re_used | ≥ 35% | Agent quality review (use eval suite) |

---

## Privacy

The `analytics_events` collection contains user IDs. The `/api/admin/funnel` response **never** includes individual identifiers — only counts and ratios. The existing PII redaction in `src/lib/analytics/track.ts` strips email/name/phone/ip from the `properties` field before persistence.

For GDPR/PDPL right-to-erasure, `src/lib/compliance/right-to-be-forgotten.ts` deletes all `analytics_events` documents matching the user's `userId` within 30 days of the deletion request.

---

## Roadmap

- **Cohort attribution (Q3 2026):** stream `analytics_events` to BigQuery via Firebase Extension; rebuild funnel with proper cohort tracking.
- **Per-channel breakdown (Q3 2026):** add `utm_source`/`utm_campaign` to landing/signup events; expose in dashboard.
- **Anomaly alerts (Q4 2026):** Sentry/PagerDuty alerts when any conversion drops > 30% week-over-week.
