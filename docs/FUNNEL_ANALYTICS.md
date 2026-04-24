# Funnel Analytics — Canonical Event Taxonomy

**Source:** `src/lib/analytics/track.ts` is the single source of truth.
**Storage:** every event lands in Firestore `analytics_events` (immutable). Best-effort mirror to PostHog (no PII) when `POSTHOG_KEY` is set.

---

## 1. Activation funnel (priority)

| Step | Event name | Notes |
|---|---|---|
| 1 | `landing_visited` | Server-fired on first SSR for a session. |
| 2 | `signup_started` | Fired when the user clicks "Start free" and the signup screen mounts. |
| 3 | `signup_completed` | Fired after successful Firebase Auth `createUser`. |
| 4 | `onboarding_step_completed` | One per step; `properties.step` carries the step name. |
| 5 | `first_idea_validated` OR `first_chat_message_sent` | Whichever comes first counts as activation start. |
| 6 | (TTFV stage — see below) | First *agent reply* the user reads = "first value". |
| 7 | `weekly_active` | Idempotent per (user, ISO week). |
| 8 | `trial_started`, `subscription_activated`, `subscription_cancelled` | Billing lifecycle. |

## 2. Time-to-First-Value (TTFV)

P0-3 from `docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`. Implemented in
`src/lib/analytics/ttfv.ts`. Rather than a new bespoke event, we re-use the
existing `agent_re_used` slot with `properties.kind = 'ttfv'` and
`properties.stage ∈ {signup, first_message, first_value}`. This avoids
schema churn and ships immediately.

Two derived metrics are computed per user when both endpoints exist:

| Metric | Formula | Target (6mo) | Target (12mo) |
|---|---|---|---|
| `ttfvColdMs` | `firstMessageAt - signupAt` | ≤ 8 min | ≤ 4 min |
| `ttfvWarmMs` | `firstValueAt - firstMessageAt` | ≤ 30 s | ≤ 15 s |

Aggregations:

- Per-user doc: `ttfv/{userId}` with the timestamps + derivatives.
- Daily rollup: `ttfv_daily/{YYYY-MM-DD}` with `firstValueCount`.
- Admin tile: rendered by `components/admin/TtfvWidget.tsx` reading
  `getTtfvSummary()` server-side.

### Where to call `markTtfvStage`

| Stage | Call site |
|---|---|
| `signup` | `app/api/auth/signup/route.ts` immediately after Firestore user doc create. |
| `first_message` | `app/api/chat/[*]` — first message a user sends in any agent. Idempotent per user. |
| `first_value` | The agent message-completion handler — only when the assistant's response is non-empty AND non-error. |

These three call sites are intentionally close to the user-facing edge
(rather than buried in middleware) so missing instrumentation surfaces in
review.

## 3. Retention

- `weekly_active` is the canonical North-Star input. Computed by a daily cron
  reading `analytics_events` and writing `weekly_active_rollup/{ISO-week}`.
- Cohort analysis: `app/admin/funnel/page.tsx` (P1) shows day-1 / day-7 / day-30
  retention by signup-week.

## 4. Privacy

- `stripPii` whitelists keys before sending to PostHog. Add a key to `PII_KEYS`
  in `track.ts` if it could ever leak personal information.
- Right-to-erasure (`/account/delete`) cascades to `analytics_events` and `ttfv`
  via the deletion job in `src/lib/compliance/erasure.ts`.

## 5. Adding a new event

1. Append the literal to `AnalyticsEvent` in `track.ts`.
2. Document its meaning + emit-site here.
3. Add to the Lexicon CI seed if the event name will surface in any UI string.
4. Update the admin funnel renderer if it should be visible to ops.

Never repurpose an existing event slot silently — it breaks dashboards.
