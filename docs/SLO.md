# Service Level Objectives — Kalmeron Two

**Status:** v1.0 (24 Apr 2026) · Owner: SRE · Review cadence: monthly

SLOs are commitments to ourselves. Customers see SLAs (in `/legal/sla.md`, looser by 1 nine).

## 1. Headline SLOs

| # | Service | SLI | Target (28-day rolling) | Error budget |
|---|---|---|---|---|
| 1 | Web app reachability | Successful page renders / total | 99.9 % | 40 min/28d |
| 2 | API availability | 2xx+3xx / total non-4xx-client requests | 99.5 % | 3 h 22 min/28d |
| 3 | API latency | p95 of `/api/*` | < 800 ms | — |
| 4 | API latency (chat / agent) | p95 of `/api/chat` first byte | < 1.5 s | — |
| 5 | Background jobs | Cron job success rate | 99 % over 28 d | 7 runs/28d |
| 6 | Auth | Login success rate | 99.5 % | — |
| 7 | Payments webhook | Stripe webhook delivery → handled | 100 % within 24 h | 0 |

## 2. Per-agent SLOs

| Agent | First-token latency p95 | Quality (eval pass rate) |
|---|---|---|
| Idea Validator | < 2.0 s | ≥ 0.85 |
| Business Plan Builder | < 4.0 s | ≥ 0.80 |
| CFO Agent | < 3.0 s | ≥ 0.85 |
| Legal Guide | < 3.0 s | ≥ 0.90 (legal accuracy is non-negotiable) |
| Mistake Shield | < 1.5 s | ≥ 0.85 |
| Opportunity Radar | < 2.5 s | ≥ 0.80 |
| General Chat (Flash) | < 1.0 s | ≥ 0.75 |

## 3. Error budget policy

If the rolling 28-day error budget is **consumed**:
1. Freeze all non-critical feature deploys.
2. Postmortems become mandatory (not optional) for the 3 largest contributors.
3. Engineering capacity reallocated 50 % to reliability work for the next sprint.

If the budget has > 50 % remaining at end of month: green light to ship riskier experiments, A/B tests, etc.

## 4. Alerting rules (proposed)

| Metric | Warning | Page |
|---|---|---|
| API 5xx rate | > 1 % over 5 min | > 3 % over 5 min |
| API p95 | > 1.2 s over 10 min | > 2.0 s over 10 min |
| Login failures | > 5 % over 10 min | > 15 % over 5 min |
| Sentry new issue volume | > 50/h | > 200/h |
| Firestore reads/sec | > 70 % of plan | > 90 % of plan |
| Gemini error rate | > 2 % over 10 min | > 5 % over 5 min |
| LLM cost (rolling 24 h) | > 70 % of monthly forecast | > 90 % |

## 5. Measurement

- **Latency:** Vercel Analytics + Sentry performance.
- **Availability:** External Uptime monitor (planned: BetterStack) + internal `/api/cron/health-probe` (every 5 min).
- **Quality:** `npm run eval` runs nightly via GitHub Actions (`.github/workflows/eval.yml`); results published to Langfuse and a public-facing `/status/quality` page.
