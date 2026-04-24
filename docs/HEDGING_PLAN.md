# Gemini Hedging Plan — Kalmeron Two

**Status:** P0 — required before any growth campaign.
**Owner:** Tech Lead.
**Source:** Risk WC-1 in `docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`.

---

## 1. Why this exists

The platform today routes 100 % of LLM traffic through **one provider (Google
Gemini)**. Three concrete failure modes can wipe out the margin or take the
service offline:

| Mode | Probability (12 mo) | Impact |
|---|---|---|
| Pricing change (≥ 2× input cost) | 40 % | Margin collapse |
| Quota tightening on free/paid tier | 30 % | Throttled UX |
| 1+ hour regional outage | 25 % | Full service down |

Hedging is not "use multiple providers in parallel" — it is *option value*: we
keep the system **portable** so a 24-hour switch is feasible, and we have a
**fallback chain** that activates automatically on transport errors.

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Agent code (cfo, legal, plan-builder, …)                │
│  imports: routeWithFallback(task)                        │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  src/lib/model-router.ts                                 │
│  - classifyTaskTier(task)  → trivial/simple/medium/…     │
│  - routeWithFallback()     → walks provider chain        │
└──────────────────────────────────────────────────────────┘
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
   Gemini (primary)   Anthropic         OpenAI
   gemini-2.5-*       claude-*          gpt-5-*
```

The chain is defined in `src/lib/llm/providers.ts → DEFAULT_FALLBACK_ORDER`.
A provider is **available** iff its env key is set:

| Provider | Env var |
|---|---|
| Gemini | `GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |

If an env key is absent, that provider is silently skipped — there is **no
runtime crash**. In dev/CI we typically only have Gemini configured; the
fallback layer becomes a no-op until the others are added.

### Tier mapping

The router does not pick "Claude vs Gemini"; it picks a **tier** (`trivial`,
`simple`, `medium`, `complex`, `critical`). Each provider exposes its own
mapping for that tier. This decoupling means a single env-var flip migrates
the entire fleet without touching agent code.

---

## 3. Operational playbook

### When a Gemini outage starts

1. Set `ANTHROPIC_API_KEY` in the platform's secret manager (already wired).
2. Optional: set `KALMERON_PROVIDER_ORDER=anthropic,gemini,openai` to make
   Anthropic the primary instead of just the fallback.
3. Watch `cost_rollups_daily` to confirm cost shift; Anthropic is ~3–5× more
   expensive at the same tier — see "Cost guardrails" below.

### Cost guardrails

- The cost ledger (`src/lib/observability/cost-ledger.ts`) records the *actual*
  provider used per call. The admin `/admin/costs` dashboard breaks down spend
  by provider so a misrouted high-value tier surfaces immediately.
- Daily budget alerts (`src/lib/cost-alerts.ts`) fire at 50/75/100 % of monthly
  budget regardless of provider.
- Prompt-cache (`src/lib/llm/prompt-cache.ts`) sits *in front of* the router —
  cache hits are free regardless of which provider is primary, and Anthropic
  prompt caching support can be wired in P1 with a single adapter change.

### Quality regression guard

Every provider switch carries a small quality risk. Mitigation:

- The eval harness (`test/eval/run-eval.ts` + `test/eval/golden-dataset.json`)
  runs on cron weekly; expanded to 80 cases in P0 (was 51).
- A regression > 5 % on intent classification triggers a Slack/email alert and
  the on-call engineer reverts `KALMERON_PROVIDER_ORDER` to the prior value.

---

## 4. What this plan does NOT do

- It does **not** call Anthropic and Gemini in parallel and pick the best.
  That doubles cost without proportional quality gain. We may revisit for the
  `critical` tier (legal/financial decisions) in P2.
- It does **not** automatically train Kalmeron on alternative providers. That
  is a P3 item ("fine-tuned proprietary model") gated on collecting 100k+
  labeled cases.
- It does **not** cover voice/multimodal (Gemini Live). Voice is a P2 feature
  and will get its own provider abstraction at that time.

---

## 5. Verification

To verify the chain works end-to-end without an outage:

```bash
# Force a fallback by temporarily blanking the Gemini key
GEMINI_API_KEY="" ANTHROPIC_API_KEY=... npm run eval
```

Expected: the eval still runs, every entry in the cost ledger shows
`provider: anthropic`, and intent accuracy drops by ≤ 5 % vs the Gemini
baseline.
