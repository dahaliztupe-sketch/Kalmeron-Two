# Kalmeron — Pre-Seed Pitch Deck (12 slides)

**Format:** Y-Combinator Demo Day / Sequoia template hybrid.
**Target round:** 750k USD pre-seed at 5–7M USD post.
**Source:** P0-8 from `docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`.
**Updated:** 24 April 2026.

> Use this as the script behind the visual deck. Each slide is one talking
> point. Total time on a stage: 4 minutes. Total time in a 1-on-1 partner
> meeting: 12 minutes including Q&A.

---

## Slide 1 — Title

> **Kalmeron** — The AI operating system for Arab entrepreneurs.
> *16 specialized AI agents speaking authentic Arabic. From 9 USD/month.*

Founder name · contact · date · raise size.

---

## Slide 2 — The problem

60+ million SMBs across Egypt, Saudi Arabia, and the Gulf depend on **fragmented
human consultants** (accountant, lawyer, marketer) costing 200–800 USD/month
each. Advice arrives **late, generic, and rarely in their dialect**.

Global AI tools (ChatGPT, Copilot) are powerful but:

- Speak **modern-standard Arabic** at best — rarely Egyptian or Khaleeji.
- Don't understand **local context**: Law 151, e-invoicing, EGP/SAR margins, GAFI procedures.
- Don't bundle into a **workflow** an SMB owner can use without prompts engineering.

## Slide 3 — Our insight

The opportunity isn't a *better chatbot*. It is a **decision-grade operating
system** that:

1. Knows the entrepreneur's **context** (numbers, contracts, history).
2. Speaks their **dialect** with the right voice.
3. Hands them **one decision per day** they can execute in 5 minutes.

This is the gap global players cannot close in less than 18 months because
their distribution and attention is elsewhere.

## Slide 4 — Product

A unified workspace exposing **16 specialized agents across 7 departments**
(Strategy, Finance, Legal, Marketing, Operations, Real Estate, Support) plus
two unique surfaces:

- **Receptionist** — single chat that routes to the right agent automatically.
- **Daily Brief (Operational Mirror)** — every morning: one anomaly, one
  decision, one ready-to-send message.

All agents share memory (Digital Twin), audit log, and cost ledger. Built on
Next.js 16, LangGraph, Firestore, and a multi-provider LLM gateway with
Anthropic / OpenAI fallback (see `docs/HEDGING_PLAN.md`).

## Slide 5 — Why now

- **LLM cost** dropped 80 % in 18 months — sub-1 USD/month per active SMB user is finally feasible.
- **Arabic NLP** crossed the usability threshold in 2024–25 (Gemini Pro, Claude Sonnet).
- **MENA digital adoption** of SaaS jumped 35 % YoY — buying behaviour caught up to product.
- **Global incumbents** are distracted by enterprise GTM in the West; the Arab SMB market is still uncontested.

## Slide 6 — Market

| Segment | Pop. | Wallet capture/yr | Note |
|---|---|---|---|
| MENA SMBs (1–250 emp.) | 60M | 1.5B USD AI tooling by 2028 | bottom-up |
| Global Arabic-speaking solos | 25M extra | 250M USD | diaspora |
| **TAM** | — | **~1.75B USD ARR by 2028** | — |
| Reachable in 5 years (SAM) | 6M SMBs | ~600M USD | conservative |
| Year-3 capture (SOM) | 50k paid SMBs | ~12M USD ARR | base plan |

## Slide 7 — Traction

(Fill with current actuals before each meeting.)

- **Signed-up:** N
- **Paying:** N
- **MRR:** N USD
- **NPS:** N
- **MoM growth (last 3):** N %, N %, N %
- **Production agents:** 16 (architecture proven)
- **Enterprise pilots in conversation:** N

## Slide 8 — Business model

- **Pro:** 19 USD/mo (target ARPU).
- **Team:** 49 USD/mo per workspace (5 seats).
- **Enterprise:** custom from 2k USD/mo (SSO, audit pro, custom models, on-prem).
- **API & Marketplace:** 30 % rev-share with partner agents (P2 launch).

Unit economics (target by month 12): CAC ≤ 25 USD · LTV ≥ 200 USD · LTV/CAC ≥ 8 · Payback ≤ 9 months · Gross margin ≥ 70 %.

## Slide 9 — Moat

1. **Authentic Arabic voice & lexicon** — codified in `src/lib/copy/{voice,lexicon,microcopy}.ts`. Hardest piece for incumbents to copy.
2. **Compliance bundle** — PDPL, Law 151, GDPR self-service shipped on day one.
3. **Fortune-500 governance layer** — RBAC, audit, webhooks, cost ledger, consent ledger. Three years ahead of MENA peers.
4. **Distribution beachheads** — incubator + bank partnerships in pilot.
5. **Data flywheel** — opt-in user feedback dataset (51 → 80 → 200 cases) to fine-tune later.

## Slide 10 — Competition

| | Kalmeron | ChatGPT | MS Copilot | Manus | Lovable |
|---|---|---|---|---|---|
| Authentic Arabic | ✅ | partial | partial | ❌ | ❌ |
| Multi-agent for entrepreneurs | ✅ | ❌ | ❌ | partial | ❌ |
| MENA compliance | ✅ | partial | partial | ❌ | ❌ |
| Price (USD/mo) | 9–19 | 20+ | 200+ | 39 | 20 |
| Brand awareness MENA | low | high | high | low | low |

Our weakness is brand awareness — solved by the GTM plan in slide 11. Their
weakness (Arabic + context) takes 12–18 months to fix. We have the window.

## Slide 11 — GTM (90-day plan post-funding)

1. **Hire** Head of Growth + Customer Success Lead (week 1–4).
2. **Sign** one distribution partner (bank, incubator, or university) (week 4–12).
3. **Run** First-100 lifetime program → 100 paying SMBs + 100 video testimonials (week 1–8).
4. **Launch** WhatsApp Business channel (week 6–10).
5. **Ship** 5 English landing pages + organic SEO foundation (week 1–3).
6. **Activate** Affiliate program with 20 mid-tier influencers (week 4–8).

## Slide 12 — The ask

**Raising 750k USD pre-seed.**

Use of funds (18-month runway):

- Engineering & product (45 %)
- GTM & content (30 %)
- Customer success & ops (15 %)
- Compliance & infra (10 %)

What you get: equity in the operating system that becomes the default first
account every Arab entrepreneur opens, the way they open a bank account.

> **Co-investors welcome.** Lead targets: 500 Global MENA, MEVP, Algebra Ventures, Sanabil. Strategic angels: founders of Mostaql, Maharah, Tabby, Vezeeta.

---

### Appendix slides (optional, kept off-deck unless asked)

- A. Detailed unit economics & sensitivity table
- B. Architecture & security overview (1 page)
- C. Founder bios + team plan
- D. Top 10 risks + mitigations (from `docs/BUSINESS_EXPERT_PANEL_45_REPORT.md` §1.1 expert 36)
- E. 36-month financial model summary
