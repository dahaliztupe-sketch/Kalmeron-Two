# Cost Dashboard — Architecture & Wiring

**Goal:** every team member can see, in real time, "how much did Kalmeron spend
on AI/infra in the last X hours, broken down by tenant, agent, and provider".

## Current state

- **Per-call cost capture** lives in `src/lib/observability/cost-ledger.ts`.
  Every Gemini call logs `{ workspaceId, agent, provider, model, promptTokens,
  completionTokens, costUsd }` to Firestore collection `cost_events`.
- **Aggregation** runs every 15 min via `/api/cron/aggregate-costs` and writes
  to `cost_rollups/{ymdh}` (hourly buckets) and `cost_rollups_daily/{ymd}`.

## Read paths

| Surface | Source | Refresh |
|---|---|---|
| Admin → Cost tab | `cost_rollups_daily` | every page load |
| Workspace → Settings → Usage | `cost_rollups` filtered by `workspaceId` | every page load |
| Slack `#alerts-cost` daily digest | `/api/cron/cost-digest` 06:00 Africa/Cairo | daily |
| OpenMeter dashboard | `@openmeter/sdk` ingestion (mirror of `cost_events`) | streaming |

## Budget enforcement

`src/lib/billing/quota.ts` checks `cost_rollups[current_month]` before allowing
expensive agents (`legal_review`, `cfo_analysis`). Free tier hard cap: $0.10
per workspace per month. Pro: $5. Enterprise: contractual.

## Alerting (per `docs/SLO.md` §4)

- **Warning:** rolling 24 h projected monthly burn > 70 % of forecast.
- **Page:** > 90 % of forecast OR a single workspace exceeds 200 % of its tier
  in < 1 h (likely abuse).

## Open questions / TODOs

- [ ] Backfill historical cost_events from Langfuse traces (one-time script).
- [ ] Add a `cost_anomalies` collection that the daily Slack digest references.
- [ ] Surface per-agent unit economics on the public `/status/quality` page.
