# Funnel Analytics — Acquisition → Activation → Retention → Revenue

**Why:** we can't optimize what we don't measure. This doc defines the
canonical events, where they fire, and how to query them.

## Event taxonomy (PostHog-compatible, also stored in Firestore)

| Stage | Event | Where it fires | Mandatory props |
|---|---|---|---|
| Acquisition | `landing_visited` | `app/page.tsx` `useEffect` | `referrer`, `utm_*` |
| Acquisition | `signup_started` | Signup page mount | `provider` |
| Acquisition | `signup_completed` | Successful create-user webhook | `userId`, `provider` |
| Activation | `onboarding_step_completed` | Each onboarding step | `step`, `userId` |
| Activation | `first_idea_validated` | First successful Idea Validator run | `userId`, `score` |
| Activation | `first_chat_message_sent` | First message in `/chat` | `userId`, `agent` |
| Retention | `weekly_active` | Computed cron from `last_active_at` | `userId`, `weekNumber` |
| Retention | `agent_re_used` | 2nd+ use of same agent in 7 days | `userId`, `agent` |
| Revenue | `trial_started` | Stripe trial subscription created | `userId`, `tier` |
| Revenue | `subscription_activated` | Stripe checkout completed | `userId`, `tier`, `mrr` |
| Revenue | `subscription_cancelled` | Stripe subscription deleted | `userId`, `tier`, `lifetimeMrr` |

## Implementation

- Single helper: `src/lib/analytics/track.ts` exports
  `trackEvent(event, props)` which writes to:
  1. Firestore `analytics_events` (always — our source of truth).
  2. PostHog (best-effort, fire-and-forget; only if `POSTHOG_KEY` is set).
- All events include `requestId` (correlates with audit logs and Sentry).
- PII (email, IP, names) is **never** sent to PostHog; only opaque IDs.

## Standard funnel queries

```sql
-- Activation funnel, last 28d (BigQuery export of Firestore)
SELECT
  COUNT(DISTINCT IF(event = 'signup_completed', userId, NULL))      AS signed_up,
  COUNT(DISTINCT IF(event = 'first_idea_validated', userId, NULL))   AS validated,
  COUNT(DISTINCT IF(event = 'first_chat_message_sent', userId, NULL))AS chatted,
  COUNT(DISTINCT IF(event = 'trial_started', userId, NULL))          AS trialed
FROM `kalmeron.analytics_events`
WHERE _PARTITIONTIME >= TIMESTAMP_SUB(CURRENT_TIMESTAMP, INTERVAL 28 DAY);
```

## Dashboards

- **Acquisition health:** PostHog dashboard `Acquisition v1`.
- **Activation funnel:** Looker Studio `Kalmeron Activation`.
- **Cohort retention:** PostHog Cohorts → weekly cohorts since 2026-01.
- **Revenue:** Stripe → Sigma → mirrored daily to BigQuery.

## North-star metric

Weekly **Validated Founders** = users who have:
1. completed onboarding, AND
2. used ≥ 2 different agents in the last 7 days, AND
3. saved ≥ 1 business plan or idea.

Tracked in Firestore as a derived rollup `north_star_weekly/{weekNumber}`.
