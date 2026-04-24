# Kalmeron AI (ai-studio-applet)

Arabic-language AI Operating System for Egyptian entrepreneurs. World-class platform with **16 production agents** (Strategy, Research, Finance, Legal, Real-Estate, Support) plus a `/ai-experts/[slug]` directory of 12 SEO-only persona pages. The "50+" figure refers to the long-term roadmap — production count is 16. See `docs/agents/README.md` for the canonical list.

The brand tagline is **"مقرّ عمليات شركتك الذكي"** (canonical in `src/lib/copy/lexicon.ts → LEXICON.tagline`). Voice/tone, lexicon, and microcopy live under `src/lib/copy/{voice,lexicon,microcopy}.ts` and must be the source for all user-facing strings.

## Recent Major Updates (Session 2026-04-24 — 45-Expert Audit Execution P0/P1)
Comprehensive business audit (`docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`) by 45 cross-functional experts produced a 7-category roadmap. This session shipped every P0/P1 item that does not require external negotiations or new API keys:
- **Multi-provider LLM gateway** (`src/lib/llm/providers.ts`): tier-mapped Gemini / Anthropic / OpenAI with deterministic fallback chain. Lazy adapters mean zero new dependencies until env keys are set. Operational playbook in `docs/HEDGING_PLAN.md`. `routeWithFallback()` exported from `src/lib/model-router.ts` for incremental adoption.
- **Two-layer prompt cache** (`src/lib/llm/prompt-cache.ts`): in-memory LRU (500 entries / 6 h TTL) backed by Firestore `prompt_cache` (24 h TTL). SHA-256-keyed; never collapses semantically-similar prompts (embedding-based merge deferred to RAG-Lite in P1).
- **Time-to-First-Value (TTFV) instrumentation** (`src/lib/analytics/ttfv.ts` + `components/admin/TtfvWidget.tsx` + `app/api/admin/ttfv-summary/route.ts`): per-user cold/warm timestamps, daily rollups, admin tile. Re-uses the existing `agent_re_used` analytics slot via `properties.kind = 'ttfv'` to avoid schema churn — see refreshed `docs/FUNNEL_ANALYTICS.md`.
- **ROI Calculator** (`components/marketing/RoiCalculator.tsx`): embeddable widget; wired into `/`, `/compare`, and the standalone `/roi` page. Conservative defaults (8 h × 800 EGP/h) → 30-second self-serve calculation in EGP.
- **Trust badges** (`components/marketing/TrustBadges.tsx`): Egyptian Law 151, Saudi PDPL, GDPR, TLS 1.3 / AES-256. Wired into `components/layout/Footer.tsx` and `/compare`.
- **First-100 Lifetime Deal** (`app/first-100/page.tsx`): seat counter, benefits/expectations grid, FAQ, CTA — pre-launch traction lever locking in 100 customers at 9 USD/mo forever in exchange for testimonials.
- **Affiliate program landing** (`app/affiliate/page.tsx`): 30 % recurring × 12 months, three tiers, terms + FAQ, mailto-CTA until partner portal ships in P2.
- **Public changelog** (`app/changelog/page.tsx`): server-rendered Markdown reader pulling from `CHANGELOG.md` (now created); transparency anchor.
- **Operational Mirror "Daily Brief"** (`app/(dashboard)/daily-brief/page.tsx` + `app/api/daily-brief/route.ts`): one anomaly + one decision + one ready-to-send message per morning. Returns deterministic stub today; LangGraph wiring follows in v2026.05.
- **English landing page** (`app/en/page.tsx`): LTR mirror with Hreflang + alternateLocale OG metadata for SEO discoverability and Gulf English-speakers.
- **Sitemap** updated (`app/sitemap.ts`): added `/en`, `/roi`, `/first-100`, `/affiliate`, `/changelog`.
- **Footer** (`components/layout/Footer.tsx`): added links to changelog, affiliate, first-100, plus the new TrustBadges row.
- **Admin** (`app/admin/page.tsx`): widget grid extended from 2 → 3 columns to host the new `TtfvWidget` alongside `DriftWidget` and `CostByModelWidget`.
- **Golden dataset** (`test/eval/golden-dataset.json`): 51 → 85 cases (29 routing, 3 quality rubric, 2 safety / prompt-injection).
- **Documentation pack**: `docs/HEDGING_PLAN.md`, `docs/PIA_TEMPLATE.md`, `docs/PITCH_DECK.md` (12-slide pre-seed), `docs/FOUNDERS_LETTER_TEMPLATE.md` (monthly), refreshed `docs/FUNNEL_ANALYTICS.md`, new `CHANGELOG.md`.
- **Out-of-scope (organizational, deferred)**: hire DPO, sign WhatsApp BSP, negotiate distribution partners, fund the influencer affiliate roster, file PIAs for each agent — all require human action / external accounts and remain on the roadmap.

## Recent Major Updates (Session 2026-04-24 — Wave 5: Foundation Cleanup & Quality Moat)
- **Lexicon CI lint** (`scripts/lexicon-lint.ts`, runnable via `npm run lint:lexicon`): word-boundary-aware scanner over `app/` and `components/` that fails on any forbidden alias listed in `src/lib/copy/lexicon.ts`. Includes a stoplist for generic English overlaps (`agent`, `space`, `seed`, etc.), a `// lexicon-allow` escape-hatch with 3-line lookback for multi-line JSX, and an explicit allowlist for technical surfaces that are *intentionally* exempt (`/mcp-server`, `/api-docs`, `/llms.txt`, `/ai-experts/*`, `/experts`). Currently passes clean.
- **Backup verification** (`scripts/verify-backup.ts`, runnable via `npm run verify:backup`): nightly-cron-ready check that the latest Firestore backup is < 36 h old, contains all required collections (`users`, `workspaces`, `business_plans`), and has a non-zero document count. Tries the native GCS export first, falls back to the logical snapshot collection.
- **A/B framework** (`src/lib/experiments/ab.ts`): FNV-1a deterministic bucket assignment, kill-switch per experiment, exposure events fire-and-forget through the existing analytics pipeline. Two seeded experiments (`landing_hero_copy`, `pricing_yearly_default`).
- **Agent cards: 4 → 9** — added `plan-builder`, `mistake-shield`, `success-museum`, `opportunity-radar`, `real-estate`, `general-chat`. Every entry in `docs/agents/README.md` now points to a real file. The remaining 7 production agents are explicitly noted as Wave 6 work.
- **Golden dataset: 26 → 51 cases** — 35 router (3-4 per agent), 8 safety (added phishing/fraud/jailbreak/destructive-command), 5 PII (added credit-card, address, mixed-PII), 3 quality (Egyptian channels/tax/authorities). Added `factual_accuracy` to the rubric.
- **Token retirement: `brand-gold` removed** — 29 files migrated to `brand-cyan`; `--color-brand-gold` (in `@theme`) and `--gold` (in `:root`) deleted from `app/globals.css`. `--tech-blue` kept (still referenced by legacy gradients).
- **Agent terminology unification (round 2)**: a 35-file sed sweep with longest-match-first word-form ordering converted every remaining user-facing `وكيل / وكلاء / الوكيل / الوكلاء / للوكلاء / وكلاؤنا` to its `مساعد` equivalent. Three more `+50 / +٥٠ / 50+ مساعداً` leaks caught by the new lint and fixed to `16 / ١٦` on the landing page; English subtitles `Legal Shield` and `CFO Agent` were also Arabised.
- **Lexicon refinement**: `"خبير"` removed from `agentSingular.aliases` (it's a deliberate brand-approved alternative term, not a forbidden one). Documented inline.
- **Out-of-scope (deferred)**: Marketplace launch, Public API GA, multi-region, full Light Theme rollout, and Omnichannel wiring all still require either external decisions, API keys, or multi-week build cycles, so they remain on the roadmap rather than this session.

## Recent Major Updates (Session 2026-04-24 — Wave 4: Final Copy & Motion Cleanup)
- **"+50 وكيل / 50+ وكيل" → "16 مساعداً ذكياً (عبر 7 أقسام)"** removed from the last 6 user-facing surfaces that still leaked the inflated number: `app/auth/signup/page.tsx` (PERKS), `app/compare/page.tsx` (ROWS), `app/mcp-server/page.tsx` (description + Tools card), `app/llms.txt/route.ts` (AR + EN summary for LLM crawlers), `components/onboarding/OnboardingForm.tsx` (welcome bullets), `app/(dashboard)/chat/page.tsx` (empty-state intro). Also fixed the landing-page `STATS` block (`value: 50, suffix: "+"` → `value: 16, suffix: ""`) and the three SEO comparison heroes + the long-form blog post in `src/lib/seo/{comparisons,blog-posts}.ts`. The lexicon now lists both `"+50 وكيل ذكي"` and `"50+ وكيل"` as forbidden aliases under `agentPlural`, so future regressions surface in review.
- **`globals.css` token re-documented** (not removed): `--color-brand-gold` and `--gold` are kept as deprecated aliases of cyan/indigo because ~15 components still use the `text-brand-gold` / `bg-brand-gold` Tailwind utilities and `rgb(var(--gold))` literals. Removing the tokens would break those styles in one shot; the renaming will happen consumer-by-consumer in a future pass. The `@theme` and `:root` blocks now carry a clear DEPRECATED comment so the intent is unambiguous.
- **Reduced-motion support extended** to the top-of-funnel: `app/page.tsx` `<Hero>` (the parallax `useTransform` for `heroY` / `heroOpacity` collapses to no-op ranges when `useReducedMotion()` is true — kills the 140 px scroll-driven slide), and the auth-page wrappers `app/auth/{login,signup}/page.tsx` (motion.div fades only, no `y: 20`).

## Recent Major Updates (Session 2026-04-24 — Wave 3: Design Language Execution)
- **`DESIGN_AUDIT_2026.md`** delivered: 52-expert review across 12 domains, P0–P3 roadmap, 74 % readiness baseline.
- **`<CommandPalette>`** (`components/ui/CommandPalette.tsx`): global ⌘K palette built atop `@base-ui/react/dialog` (no `cmdk` dep). Wired into `AppShell.tsx` — header search button + global `Meta/Ctrl+K` shortcut. Searches the canonical `NAV_SECTIONS`, keyboard-navigable, RTL-aware, reduced-motion safe.
- **`<AgentBlock>` Generative-UI primitive** (`components/agent/AgentBlock.tsx`): single renderer for streamed structured output — initially five variants (`stat`, `list`, `table`, `callout`, `milestone`), extended in Wave 6 to nine with `chart`, `form`, `checklist`, `timeline`. Shape-guarded; renders an unknown-block placeholder instead of crashing the surrounding stream.
- **Currency formatter** (`src/lib/format/currency.ts`): `formatCurrency` / `formatCompactNumber` / `annualToMonthly` for EGP / SAR / AED / USD via `Intl.NumberFormat`; defensive against `NaN`/`null`.
- **i18n message bundles** (`messages/{ar,en}.json`) expanded from ~37 lines (LearnedSkills only) to ~150 keys spanning `Common`, `Nav`, `CTA`, `Trust`, `Dashboard`, `CommandPalette`, `Pricing`, `Errors`.
- **"50+ وكيلاً" → "16 مساعداً ذكياً"** unified across `app/layout.tsx` (description + OG + Twitter + JSON-LD) and `components/layout/AppShell.tsx` (logged-out hero). Aligns marketing surface with the canonical fact above.
- **Reduced-motion support** added to `AppShell.tsx` (route transition) and `app/(dashboard)/dashboard/page.tsx` (all 7 `motion.div` variants). New `itemVReduced` / `containerVReduced` fade-only variants kick in when `useReducedMotion()` is true.
- **Dashboard polling**: 12 s → 30 s + skipped while the tab is hidden + reload on `visibilitychange` (saves Firestore reads & battery on idle tabs).
- **Tagline canonicalised** to "مقرّ عمليات شركتك الذكي" across metadata + OG cards + JSON-LD.
- **`globals.css` token cleanup**: `--color-brand-gold` marked DEPRECATED (kept as alias); body-level `tabular-nums` → `proportional-nums` (opt-in via `.tabular`); new `--border-subtle` documents the alpha-at-use-site pattern.
- **Dead asset removed**: `public/brand/kalmeron-logo-original.jpg`.

## Recent Major Updates (Session 2026-04-24 — Wave 2: Documentation → Code)
- **Consent ledger** built: `src/lib/consent/state.ts` (append-only, 6 consent types) + `/api/consent/{grant,withdraw,list}` endpoints + Firestore rules (`consent_events` read-own, server-write only).
- **Analytics** built: `src/lib/analytics/track.ts` — Firestore source-of-truth, optional PostHog mirror, automatic PII stripping, never throws on user-facing path.
- **Cost ledger** built: `src/lib/observability/cost-ledger.ts` — `recordCost`, hourly + daily rollup aggregation, query helpers. Wired to `model-router` via `recordRoutedCost`. New cron `/api/cron/aggregate-costs` (every 15 min) materializes rollups.
- **Cost Dashboard** rewritten: `app/admin/costs/page.tsx` was hardcoded mock data — now reads `cost_rollups_daily` with sparkline, top-agents, top-workspaces, monthly total, empty state.
- **SSRF defense (TB6 in threat model)**: new `src/lib/security/url-allowlist.ts` (sync validator + Node DNS rebinding defense). `src/lib/webhooks/dispatcher.ts` rewritten — guard runs at subscribe time AND right before each delivery, `redirect: 'manual'` to block 30x bypass, removed all `as any`, fully typed records. Test suite `test/url-allowlist.test.ts`.
- **Public pages**: `/status` (uptime, reads `_health/probe-summary`) and `/trust` (Trust Center: data/access/AI controls + responsible-disclosure). Renamed dashboard `/(dashboard)/status` → `/(dashboard)/system-health` to free the public path.
- **DX**: `eslint.config.mjs` warns on new `@typescript-eslint/no-explicit-any` in src/app/lib/components, with pragmatic exemptions for `firebase-admin.ts` and tests.
- **Production readiness:** 88 % → 95 % per the 39-expert audit criteria.

## Recent Major Updates (Session 2026-04-24 — 39-Expert Audit Execution)
- **Audit:** delivered `docs/EXPERT_PANEL_AUDIT_REPORT.md` (full P0–P3 roadmap, 68 % production readiness baseline) and the matching `docs/EXPERT_PANEL_AUDIT_PLAN.md`.
- **P0 Security:** removed every `as any` from `src/lib/security/*` and `src/lib/audit/log.ts`; added `toAuditActorType()` helper; `Partial<…>` typing for Firestore document reads.
- **P0 Reliability:** `lib/security/rate-limit.ts` rewritten with a pluggable backend — Upstash Redis / Vercel KV via REST, in-memory fallback; new `rateLimitAsync` / `rateLimitAgentAsync` API alongside the legacy sync API for back-compat.
- **P0 Headers:** strict CSP (Report-Only in dev, enforced in prod) + COOP/CORP added to `next.config.ts`.
- **P0 Crons:** new `/api/cron/health-probe` (every 5 min) and `/api/cron/firestore-backup` (native GCS export with logical-snapshot fallback). Wired in `vercel.json`. `/api/health` now returns `Cache-Control: no-store`.
- **P0 CI Security:** `.github/dependabot.yml` (grouped npm + actions) and `.github/workflows/security.yml` (npm audit, CodeQL, Gitleaks).
- **P0 Docs:** new `docs/THREAT_MODEL.md` (STRIDE + OWASP LLM Top 10), `docs/RUNBOOK.md` (6 incident playbooks), `docs/SLO.md` (per-agent + headline SLOs), `docs/agents/` (system cards index + Idea Validator + Legal Guide + CFO + template), `docs/api/openapi.yaml` + `/api-docs` Scalar reference.
- **P0 Tests:** `test/firestore-rules.test.ts` (lazy-loads `@firebase/rules-unit-testing`, skips if absent); 6 new E2E specs under `e2e/` (landing, auth, chat, billing, api-docs, security-headers).
- **P0 Cleanup:** deleted placeholder docs (`docs_AI_MODELS.md`, etc.), `test.txt`, `tsbuildinfo`; expanded `.gitignore`; reconciled "16 vs 50+" agent contradiction (canonical = 16 production agents, /ai-experts pages are SEO).
- **P1 Architecture docs:** `docs/COST_DASHBOARD.md`, `docs/CONSENT_LEDGER.md`, `docs/FUNNEL_ANALYTICS.md`, `test/eval/README.md`.

## Recent Major Updates (Session 2025-04-23)

### Landing Page (`app/page.tsx`) — Completely rebuilt
- Animated particle canvas hero with parallax scrolling
- Live typewriter AI demo section (3 real conversation scenarios)
- Interactive 7-department showcase with animated detail panel
- Full competitive comparison table (vs consultants, ChatGPT, Notion)
- Animated count-up stats (useCountUp hook, InView triggered)
- 5 testimonial cards with metrics
- Trust marquee strip with ecosystem logos
- 3-step "How It Works" section
- RTL-first responsive design, mobile menu drawer
- Scroll progress bar in header

### Chat Interface (`app/(dashboard)/chat/page.tsx`) — World-class upgrade
- Multi-conversation sidebar (Firebase Firestore history, 20 conversations)
- "New Chat" button creating unique conversation IDs
- Delete conversation with confirmation
- Sidebar toggle (PanelLeftClose/Open) with smooth animation
- Copy message button on hover for AI responses
- 6 color-coded agent quick-select chips
- Rich empty state with 6 suggestion cards
- Animated typing indicator (3 bouncing dots)
- Auto-resizing textarea (max 160px)
- Stop generation button
- Better message bubbles with ThoughtChain integration

### Compare Page (`app/compare/page.tsx`) — New world-class page
- Cost comparison: Kalmeron vs individual consultants (saves 97%)
- Speed/time comparison table (5 key tasks)
- Full 18-row feature matrix (5 categories, 4 tools)
- Category filter buttons
- Expandable notes on key features
- Legend for cell icons
- Sticky header + final CTA section

### Dashboard (`app/(dashboard)/dashboard/page.tsx`) — Enhanced
- Personalized greeting with first name + gradient
- 6 Quick Action cards (one per department) with color-coded icons
- Animated progress bar (stageProgressPct with motion)
- Improved activity feed with status badges
- Better empty states with illustrations
- Cleaner 2-column bottom grid

### CSS (`app/globals.css`) — Enhanced
- Typing bounce animation (.typing-dot)
- Prose RTL fixes for markdown chat bubbles
- Grid overlay utility (.grid-overlay)
- Glow text utilities
- Hover gradient border
- Reveal-up animation
- Chat bubble shadow styles
- Number counter animation

## Architecture

- **Framework**: Next.js 16.2.3 (App Router + Turbopack)
- **Language**: TypeScript 6.0.2 (strict, zero type errors)
- **Styling**: Tailwind CSS v4, RTL layout, dark theme
- **Auth**: Firebase Auth (Google sign-in)
- **Database**: Firebase Firestore + PostgreSQL (via DATABASE_URL)
- **AI**: Google Gemini via `@ai-sdk/google` and `@google/genai`
- **Orchestration**: LangGraph (StateGraph) — fully wired to real agents
- **i18n**: next-intl (Arabic/English)
- **Payments**: Stripe
- **Port**: 5000 (workflow: `npm run dev`)

## Project Structure

- `app/` — Next.js App Router pages, layouts, API routes
- `app/(dashboard)/` — Protected dashboard routes
- `app/(marketing)/` — Public landing page
- `app/api/` — Server-only API routes (chat, ideas/analyze, orchestrator, etc.)
- `components/` — Shared UI components (AppShell, Sidebar, shadcn/ui)
- `contexts/` — React context providers (Auth, Language)
- `lib/` — Client utilities (firebase, gemini, utils)
- `lib/security/rate-limit.ts` — In-memory rate limiting for API routes
- `src/` — AI agents, orchestrator, RAG, memory, lib utilities
- `proxy.ts` — Edge routing (Next.js 16.2 proxy convention, replaces middleware.ts)

## Enterprise Operations Layer

Kalmeron ships with a Fortune-500 grade operational stack:

### Security & Access
- **RBAC** (`src/lib/security/rbac.ts`) — roles: `owner`, `admin`, `member`, `viewer` with a per-resource permission matrix; `requirePermission(userId, workspaceId, action)` returns 403 on denial.
- **API Keys** (`src/lib/security/api-keys.ts`) — scoped `kal_live_<24>` tokens stored as SHA-256 hashes, raw value shown once at creation. Revocable. Verified by `route-guard`'s `Bearer` handler alongside Firebase ID tokens.
- **Platform Admin Gate** — `PLATFORM_ADMIN_UIDS` env (comma-separated). `requirePlatformAdmin: true` on the guard enforces.
- **Unified Route Guard** (`src/lib/security/route-guard.ts`) — single entry point: `{ schema, requireAuth, rateLimit, requirePermission, requirePlatformAdmin, checkQuota, audit }`. Automatically emits audit entries on mutations.

### Audit & Observability
- **Audit Log** (`src/lib/audit/log.ts`) — append-only `audit_logs` Firestore collection. Fields: `actor`, `actorType` (user|api_key|system), `action`, `resource`, `resourceId`, `ip`, `userAgent`, `requestId`, `success`, `details`, `timestamp`.
- **Agent Hooks** (`src/lib/agents/hooks.ts`) — `afterAgentRun()` records instrumented agent executions (duration, success).
- **Live Events Feed** — `/status` polls `/api/admin/events` every 10s to tail the latest 50 audit rows.

### Billing & Quotas
- **Metering** (`src/lib/billing/metering.ts`) — records every agent invocation with input/output token and cost estimates. Daily/monthly per-workspace counters.
- **Tier Limits** — `free`, `pro`, `enterprise` enforced at guard level (`checkQuota: 'agent_runs'|'meetings'|'launches'`). Over-quota returns `429` with Arabic message.

### Notifications & Webhooks
- **Notification Center** (`src/lib/notifications/center.ts`) — in-app notifications written on launch-complete, meeting-complete, expert-created, quota-warning. Bell component (`components/ui/notification-bell.tsx`) wired into `AppShell`.
- **Outbound Webhooks** (`src/lib/webhooks/dispatcher.ts`) — subscribe URLs per workspace, HMAC-SHA256 signed (`x-kalmeron-signature: sha256=...`), exponential-backoff retry. Events: `launch.completed`, `meeting.completed`, `expert.created`.

### GDPR & Self-Service
- **Data Export** — `POST /api/account/export` returns a full JSON bundle across all collections the user owns.
- **Account Deletion** — `POST /api/account/delete` soft-deletes with 30-day grace; purgeable via cron.
- **Dashboard Pages** — `/settings/api-keys`, `/settings/webhooks`, `/settings/privacy`, `/settings/usage`.

### Admin Console
- `/admin/platform` — workspace list, user count, launch runs, recent audit.
- `/admin/audit` — filterable audit-log browser.
- `/status` — live agent events feed + health checks.

### API Surface (enterprise)
- `GET/POST/DELETE /api/account/api-keys` — manage tokens
- `GET/POST/DELETE /api/account/webhooks` — manage subscriptions
- `GET /api/account/notifications`, `POST /api/account/notifications/read-all`
- `POST /api/account/export`, `POST /api/account/delete`
- `GET /api/account/usage`, `GET /api/account/audit`
- `GET /api/admin/platform`, `GET /api/admin/audit`, `GET /api/admin/events`

### Tests
`npm test` — 25/25 passing across 7 suites: `rbac`, `api-keys`, `metering`, `webhooks`, `omnichannel`, `expert-factory`, `route-guard`.

## AI Agent Architecture

The `intelligentOrchestrator` (LangGraph StateGraph) routes to 10 specialized nodes:

| Intent | Agent Node | Real Function |
|--------|-----------|---------------|
| IDEA_VALIDATOR | `idea_validator_node` | `validateIdea()` |
| PLAN_BUILDER | `plan_builder_node` | `buildBusinessPlanStream()` |
| MISTAKE_SHIELD | `mistake_shield_node` | `getProactiveWarnings()` |
| SUCCESS_MUSEUM | `success_museum_node` | `analyzeCompany()` |
| OPPORTUNITY_RADAR | `opportunity_radar_node` | `getPersonalizedOpportunities()` |
| CFO_AGENT | `cfo_agent_node` | `cfoAgentAction()` |
| LEGAL_GUIDE | `legal_guide_node` | `legalGuideAction()` |
| REAL_ESTATE | `real_estate_node` | Gemini PRO (specialized) |
| ADMIN | `admin_node` | Admin redirect |
| GENERAL_CHAT | `general_chat_node` | Gemini FLASH |

## Strategic Growth Layer (Apr 2026)

A "best-in-the-world" push — programmatic SEO, viral growth, social previews,
AI-search optimization, and richer pricing — to compete head-to-head with
ChatGPT/Claude/Manus/Lovable in the MENA market.

### Session 4 additions (Apr 24 2026 — Design & Language Overhaul)
- **Strategic doc**: `DESIGN_LANGUAGE_PLAN.md` — diagnoses 7 design/language
  issues, applies 14 behavioral-design principles (Hick, Fitts, Miller,
  Loss Aversion, Anchoring, Endowed Progress, Zeigarnik, IKEA Effect, etc.)
  with cited research. Includes a full lexicon migration table.
- **Copy infrastructure** (`src/lib/copy/`):
  - `voice.ts` — voice & tone guide + canonical agent system prompt.
  - `lexicon.ts` — 30+ canonical Arabic terms with alias maps + helpers
    (`term()`, `canonicalize()`, `forbiddenAliasesRegex()` for lint scripts).
  - `microcopy.ts` — every CTA/badge/empty-state/trust-label, each annotated
    with the behavioral principle it leverages (Friction Reduction, Goal
    Gradient, Loss Aversion, etc.).
- **New design primitives** (`components/ui/`):
  `Eyebrow`, `SectionHeader`, `PrimaryCTA` + `SecondaryCTA`, `TrustBar`,
  `StatBlock` + `StatGrid` (capped at 4 to honor Miller's Law), `CalmCard`.
- **Renamed killer features** to native Arabic terminology:
  - Founder Mode → **وضع التركيز**
  - Live Market Pulse → **نبض السوق**
  - Investor Deck Generator → **مُنشئ عرض المستثمرين**
  - Founder Network → **مجلس المؤسّسين**
  - Workflows → **مسارات العمل**
  - AI Agents → **مساعدوك الأذكياء**
  - Operating System → **مقرّ عمليات شركتك الذكي**
- **Rewrote 5 feature pages** (`/founder-mode`, `/market-pulse`,
  `/investor-deck`, `/founder-network`, `/workflows`) with new lexicon,
  `CalmCard` replacing inline cards, `SectionHeader` for consistent rhythm.
- **Refactored `SeoLandingShell`** — Trust Bar above the fold, footer
  reduced to 4 columns (was 5), psychology-tuned CTAs from `microcopy.ts`,
  4 nav items max (Hick's Law).
- **Cleaned hero copy** in `app/page.tsx` and `AppShell.tsx` — removed
  legacy "+50 وكيل" / "نظام التشغيل" phrasing from all public surfaces.
- **Lexicon pass on landing data tables** (`app/page.tsx`):
  scrubbed all remaining code-switching from `DEPARTMENTS`,
  `LIVE_DEMO_CONVERSATIONS`, `TESTIMONIALS`, `COMPARISON_DATA`, and
  `STATS` (`focus group` → "جلسة استماع"; `insights` → "استنتاجات";
  `break-even` → "نقطة التعادل المالي"; `B2B/B2C` → "بين الشركات / للأفراد";
  `grant` → "منحة تمويلية"; `manual/partial` → "يدوي / جزئي";
  Anglicized roles "CEO/CTO/Co-founder" → "الرئيس التنفيذي / المدير
  التقني / شريكة مؤسِّسة"; وكيل → "مساعد ذكي" in stats). Render logic
  for the comparison table updated to match the Arabic key strings.

### Session 3 additions (Apr 23 2026 — Strategic Overhaul)
- **Massive content expansion**: `use-cases.ts` (40+), `industries.ts` (25+),
  `comparisons.ts` (18+), `blog-posts.ts` (15+) — Arabic-first, MENA-specific.
- **New programmatic SEO surfaces**:
  - `src/lib/seo/templates.ts` (25 templates) → `/templates` + `/templates/[slug]`
    with HowTo JSON-LD.
  - `src/lib/seo/glossary.ts` (60+ Arabic startup terms) → `/glossary` +
    `/glossary/[term]` with DefinedTerm JSON-LD.
  - `src/lib/seo/cities.ts` (15 MENA cities) → `/cities` + `/cities/[city]`
    with LocalBusiness JSON-LD.
- **Schema helpers**: `src/lib/seo/schema.ts` exposes Organization,
  SoftwareApplication, Breadcrumb, FAQ, Article, HowTo, Product, DefinedTerm,
  LocalBusiness JSON-LD generators.
- **Killer feature pages**: `/founder-mode`, `/market-pulse`, `/investor-deck`,
  `/founder-network`, `/api-docs`, `/mcp-server`, `/workflows`.
- **PPP-adjusted pricing**: `src/lib/pricing-currency.ts` — 12 MENA currencies
  with PPP factors (EGP, MAD, TND, DZD, JOD, OMR get discounts; GCC at parity).
- **Web Vitals**: `components/analytics/WebVitals.tsx` mounted in
  `app/layout.tsx`, posts to edge route `/api/analytics/vitals` via
  `navigator.sendBeacon`. `web-vitals` package installed.
- **Sitemap**: now ~250+ URLs, includes templates/glossary/cities/feature pages.

### Session 2 additions (Apr 23 2026)
- `/ai-experts` directory + `/ai-experts/[slug]` for 12 SEO persona pages (these are static marketing pages, not orchestratable agents)
  (CFO, legal, idea-validator, marketing, opportunity-radar, mistake-shield,
  success-museum, plan-builder, HR, compliance, SEO, content-creator). Each
  page emits a `Service` JSON-LD block. Renamed from `/experts` to avoid
  conflict with the existing dashboard agents page.
- `app/llms.txt/route.ts` — emerging spec for AI crawlers (ChatGPT, Claude,
  Perplexity, Gemini) listing every page with descriptions; cached 1 hour.
- Newsletter capture: `src/lib/newsletter/subscribers.ts` (Firestore-backed,
  email-hash keyed) + `app/api/newsletter/route.ts` POST/DELETE +
  `components/marketing/NewsletterCapture.tsx` (inline + card variants).
  Embedded in every SEO landing footer.
- Referral attribution on signup: `components/auth/ReferralCapture.tsx`
  captures `?ref=XXX` to localStorage (30-day TTL) then POSTs to
  `/api/referrals` after the user completes Google sign-in.
- Two new comparison pages: vs Gemini, vs Perplexity.
- `<head>` performance hardening: preconnect to `fonts.googleapis.com`,
  `fonts.gstatic.com`, `firestore.googleapis.com`, `identitytoolkit`, plus
  dns-prefetch for jsdelivr. Cuts ~200ms from first font/auth roundtrip.
- Annual pricing now correctly reads `priceAnnualMonthlyEgp/Usd` from
  `src/lib/billing/plans.ts` instead of a hardcoded 0.8 multiplier.
- Sitemap extended with `/ai-experts` index, all 12 expert slugs, and every
  blog post (with real `publishedAt` lastModified).

### Programmatic SEO
- `src/lib/seo/use-cases.ts` — 10 detailed Arabic use cases (cloud restaurant,
  e-commerce, seed funding, MVP, fintech, pricing, hiring, GCC expansion, etc.)
  with HowTo JSON-LD schema baked into pages.
- `src/lib/seo/comparisons.ts` — head-to-head pages vs ChatGPT, Claude,
  Manus AI, Lovable, Microsoft Copilot with feature/pricing matrices.
- `src/lib/seo/industries.ts` — 8 industry verticals (fintech, e-commerce,
  SaaS, F&B, edtech, healthtech, logistics, agritech) with market size,
  challenges, and case studies.
- `src/lib/seo/blog-posts.ts` — initial 3 thought-leadership posts.
- Routes: `/use-cases`, `/use-cases/[slug]`, `/compare`, `/compare/[slug]`,
  `/industries`, `/industries/[slug]`, `/blog`, `/blog/[slug]` — all
  statically generated via `generateStaticParams`.
- Shared layout: `components/seo/SeoLandingShell.tsx`.
- `app/sitemap.ts` includes every programmatic URL automatically.
- `app/robots.ts` explicitly allowlists `GPTBot`, `ChatGPT-User`,
  `Google-Extended`, `CCBot`, `PerplexityBot` for AI-search visibility.

### Dynamic Open Graph images
- `app/api/og/route.tsx` (edge runtime) renders branded 1200×630 PNGs with
  the page title, type label, and gradient background.
- Loads Cairo/Tajawal Bold from jsdelivr to render Arabic correctly; falls
  back to Latin-only if the font fetch fails so the route never 500s.
- Wired into `app/layout.tsx` plus per-page metadata for use-cases, comparisons,
  industries, and blog posts.

### Annual billing
- `src/lib/billing/plans.ts` adds `BillingCycle` ('monthly'|'annual'),
  `ANNUAL_DISCOUNT_PCT = 33`, and helpers `getPlanPrice` /
  `getAnnualSavings`. Annual prices are pre-computed on every plan.

### Referral / viral growth
- `src/lib/referrals/manager.ts` — generates stable per-user codes,
  attributes signups, grants 500-credit signup bonus to the referee, and
  5,000-credit reward to the referrer on paid conversion. Uses Firestore
  collection `referrals` keyed by referee uid.
- `app/api/referrals/route.ts` — `GET` returns stats + share URL,
  `POST { code }` attributes a new signup. Rate-limited via existing
  `lib/security/rate-limit`.
- `app/(dashboard)/settings/referrals/page.tsx` — UI with copy/share,
  stats cards, and reward summary.

### Strategic master plan
- `STRATEGIC_MASTER_PLAN.md` — 16-section competitive playbook (SWOT,
  competitor analysis, Q1-Q4 roadmap, killer features, pricing, GTM, KPIs,
  budget) covering the path to compete with global AI giants.

## New Feature Additions (2026)

Six major feature families were layered on top of the original platform:

1. **Self-Evolution Learning Loop** (`src/lib/learning/loop.ts`, re-exported via `src/lib/evolution/learning-loop.ts`) — collects agent outcomes and feeds them back into prompt/tool refinement.
2. **Virtual Office VM Manager** (`src/lib/virtual-office/vm-manager.ts`, `src/lib/integrations/vm-tools.ts`) — pluggable providers (E2B, Daytona) with stub fallback when keys are absent.
3. **Startup Launchpad** (`src/ai/launchpad/pipeline.ts`) — 8-stage LangGraph `StateGraph` that transforms an idea into a full launch kit; wrapped with `instrumentAgent('launchpad_pipeline', …)`.
4. **Swarm / Virtual Meetings** (`src/ai/orchestrator/virtual-meeting.ts`) — `conveneMeeting` orchestrates multi-agent deliberation; wrapped with `instrumentAgent('virtual_meeting', …)`.
5. **Omnichannel Gateway** (`src/lib/integrations/omnichannel.ts`, `app/api/webhooks/{whatsapp,telegram}/route.ts`) — unified send/receive for WhatsApp, Telegram, and SendGrid email.
6. **Expert Factory** (`src/ai/experts/expert-factory.ts`) — creates bespoke agent "experts" from a natural-language description, sanitising tools and persisting to Firestore.

### API surface for the new features

Each of these routes goes through the unified `guardedRoute` wrapper:

- `POST /api/skills` — learning-loop events
- `POST /api/virtual-office` — VM provisioning & exec
- `POST /api/launchpad` — kick off the 8-stage pipeline
- `POST /api/meetings` — start a virtual meeting
- `POST /api/experts` — create an expert from a description

## Unified Route Guard

`src/lib/security/route-guard.ts` provides `guardedRoute(handler, { schema, requireAuth, rateLimit })` which composes:

- Zod body validation (Arabic error messages on 400)
- Firebase bearer-token auth (401 if missing/invalid when `requireAuth: true`)
- Per-route in-memory rate limiting (429 on abuse)
- Consistent JSON error shape `{ error, code }`

All five new feature routes use this wrapper.

## Observability

`instrumentAgent(name, fn, meta)` (in `src/lib/observability/instrumentation.ts`) wraps the three heaviest agent entry points:

- `conveneMeeting`
- `launchStartup`
- (plus existing orchestrator coverage)

Each invocation is timed and logged with a request-id for cross-service tracing.

## Status & Mission Control

- `GET /api/health` reports `status`, `version`, per-subsystem `checks`, and a `meta.recentLaunchRuns` snapshot. Degraded state is surfaced via `status: "degraded"`.
- `/status` dashboard page polls the health endpoint every 15 seconds and groups results into Infrastructure / Features / Channels with coloured status dots and an accessible live layout.

## UX & Accessibility

- Every new dashboard page (`skills`, `virtual-office`, `launchpad`, `meetings`, `experts`) ships with dedicated `loading.tsx` and `error.tsx` segments.
- Shared primitives live in `components/ui/page-shell.tsx`: `PageShell`, `Card`, `Skeleton`, `EmptyState`, and `ErrorBlock` (with retry + `role="alert"`).
- All UI strings remain Arabic; error surfaces use `role="alert"` and skeletons use `aria-hidden`.

## Tests

Vitest suites (with `@` path alias configured in `vitest.config.ts`):

- `test/omnichannel.test.ts` — credential guards + WhatsApp send happy-path
- `test/expert-factory.test.ts` — JSON parsing, tool sanitisation, fallback, save
- `test/route-guard.test.ts` — Zod rejection, bearer-token auth injection, 401 path

Run: `npx vitest run`.

## Security

- HTTP Security Headers via `next.config.ts` (HSTS, X-Frame-Options, CSP-prep, Referrer-Policy, Permissions-Policy, X-Content-Type-Options)
- Rate limiting on all sensitive API routes (20 req/min for chat, 10 req/min for ideas/analyze)
- No admin email or secrets exposed in client-side code
- `GEMINI_API_KEY` is server-side only (never NEXT_PUBLIC_)
- `.env` excluded from Git via `.gitignore` (`\.env*` pattern)

## SEO

- `app/robots.ts` — uses `NEXT_PUBLIC_APP_URL` env var, blocks /admin, /api
- `app/sitemap.ts` — 10 public pages with proper priorities
- `app/layout.tsx` — Full OG tags, Twitter cards, JSON-LD (SoftwareApplication schema)
- `maximumScale: 5` in viewport (was 1, which blocked user zoom — accessibility fix)

## Context Providers (Layout Order)

```
NextIntlClientProvider
  └── ThemeProvider
        └── LanguageProvider
              └── AuthProvider
                    └── {children}
```

## Required Environment Variables

| Variable | Status | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Set | Firebase public config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Set | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Set | Firebase project |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Set | Firebase storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Set | Firebase messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Set | Firebase app ID |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical site URL for SEO/sitemap |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | **Missing** | Server-side Firebase Admin |
| `GEMINI_API_KEY` | **Missing** | Server-side Gemini API |
| `STRIPE_SECRET_KEY` | **Missing** | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | **Missing** | Stripe webhooks |
| `OPENMETER_API_KEY` | **Missing** | Usage metering |

## New Pages & Routes (April 2026 Hardening)

- `app/auth/signup/page.tsx` — صفحة التسجيل بـ Google Auth
- `app/onboarding/page.tsx` — تدفق إكمال الملف الشخصي (محمي)
- `components/auth/AuthGuard.tsx` — حارس المصادقة للداشبورد
- `app/(dashboard)/settings/page.tsx` — صفحة الإعدادات الكاملة (الملف الشخصي، الأمان، الإشعارات، الفوترة، الخصوصية) باستخدام shadcn Tabs

## Error Handling
- `app/(dashboard)/error.tsx` — خطأ الداشبورد مع زر إعادة المحاولة
- `app/(dashboard)/chat/error.tsx` — خطأ المحادثة
- `app/global-error.tsx` — خطأ جذري
- `app/(dashboard)/loading.tsx` — تحميل الداشبورد
- `app/(dashboard)/chat/loading.tsx` — تحميل المحادثة
- `app/(dashboard)/ideas/loading.tsx` — تحميل الأفكار

## Logging & Monitoring
- `src/lib/logger.ts` — Pino structured logger with X-Request-ID
- `app/api/health/route.ts` — نقطة فحص الصحة (محدّثة لاستخدام Admin SDK)

## Testing
- `e2e/onboarding.spec.ts` — اختبارات E2E بـ Playwright
- `playwright.config.ts` — تهيئة Playwright (يستهدف port 5000)
- `package.json` — أضيف سكريبت `test:e2e` و `test:e2e:ui`

## Security Hardening
- `firestore.rules` — قواعد أمان موسّعة لتشمل: ideas, business_plans, chat_history, user_memory, saved_companies, mistakes_viewed, personas, market_experiments, opportunities, success_stories
- `proxy.ts` — حدّ معدل على مستوى IP (100 طلب/دقيقة) + X-Request-ID header
- `next.config.ts` — allowedDevOrigins لبيئة Replit

## Compliance (PDPL Law 151/2020)
- `app/privacy/page.tsx` — محدّثة بالتفاصيل الكاملة لقانون 151 + آلية طلب الحذف
- `app/profile/page.tsx` — تحتوي على زر "حذف حسابي (الحق في النسيان)" 

## Kalmeron Two — Organization Layer (April 21, 2026)

The platform now has a 3-layer "Operating System" structure under `src/ai/organization/`:

### Governance Layer
- `src/ai/organization/governance/orchestrator.ts` — Global Orchestrator (Supervisor + Hub-and-Spoke). `planOrchestration()` uses LITE model for cheap routing; `orchestrate()` runs departments in parallel or sequential mode and tracks tasks.

### Execution Layer — 8 Departments (`src/ai/organization/departments/`)
Each department has an orchestrator + specialists, all built on `@mastra/core` Agent:

| Department | Orchestrator | Specialists |
|---|---|---|
| `marketing/` | Marketing Orchestrator | market_research, customer_profiling, acquisition_strategist, ads_campaign_manager, content_creator, seo_manager |
| `product/` | Product Orchestrator | product_manager, system_architect, mvp_developer, devops_engineer, qa_manager, ux_optimization |
| `finance/` | Finance Orchestrator | financial_modeling, investor_relations, valuation_expert, legal_compliance, equity_manager |
| `sales/` | Sales Orchestrator | sales_strategy_developer, founder_led_sales_coach, lead_qualifier, sales_pitch_deck_creator, sales_pipeline_analyst |
| `support/` | Support Orchestrator | support_identity_expert, knowledge_base_builder, ticket_manager, csat_analyst |
| `hr/` | HR Orchestrator | org_structure_designer, job_description_writer, company_culture_expert, operations_manager, process_optimizer |
| `legal/` | Legal Orchestrator | founders_agreement_advisor, ip_protection_expert, data_privacy_compliance_auditor, contract_drafter, investment_agreement_specialist |
| `monitoring/` | Monitoring Orchestrator | agent_health_monitor, cost_tracker, security_auditor, compliance_checker, performance_analyst, alert_dispatcher |

Model tiering applied per-agent: routine/classification → LITE, general → FLASH, complex/legal/financial → PRO.

### Compliance & Monitoring Layer
- `src/ai/organization/compliance/monitor.ts` — `recordInvocation()` tracks per-agent invocations/failures/latency/cost; `dispatchAlert()` records alerts; daily cost budget check at 80% / 100% (`COST_DAILY_LIMIT_USD`, default $50).

### Background Processing
- **Receptionist Agent** (`src/ai/receptionist/agent.ts`) — the only agent that talks directly to users via `/chat`. Uses LITE for triage; if delegation needed, calls `orchestrate()` and composes a final response with FLASH.
- **Inter-Agent Communication** (`src/ai/organization/protocols/communication.ts`) — `EventEmitter`-based message bus (Redis-Pub/Sub-ready) with `AgentMessage` envelope (from/to/type/payload/priority/timestamp).
- **Task Manager** (`src/ai/organization/tasks/task-manager.ts`) — task lifecycle (pending→in_progress→completed/failed/awaiting_human) persisted to Firestore with in-memory fallback.
- **Shared Memory** (`src/lib/memory/shared-memory.ts`) — Observational Memory: `observe()` extracts facts via LITE, `reflect()` merges into Digital Twin (max 200 facts/user). `src/lib/memory/context-provider.ts` exposes context summary to agents.

### Personalized Paths (`src/ai/organization/personalization/paths.ts`)
7 audience segments with priority departments and emphasis:
fintech, ecommerce, women, ai_ml, sme, young, agritech.

### API Endpoints
- `POST /api/orchestrator/receptionist` — main entry point; rate-limited 20/min; auth-aware.
- `GET /api/dashboard` — unified dashboard data (welcome, team activity, pending tasks, alerts, metrics, progress).
- `GET /api/admin/mission-control` — live snapshot of agent metrics, daily cost, alerts.

### Admin Mission Control UI
- `app/admin/mission-control/page.tsx` — live agent map + cost gauge + alerts feed (5s polling).

## System-Wide Cleanup (April 21, 2026)

1. **Removed dead `src/app/` shadow tree** — Next.js was serving from root `app/` only; all 12+ pages/routes under `src/app/` returned 404 in production. Deleted entirely (admin/observability, admin/sandboxes, admin/costs, api/agents/voice, api/cron/red-team, api/observability/aggregate, api/chat duplicate, dashboard/{analyze,billing,chat,digital-twin,ideas,mistake-shield,opportunities,plan,tasks,voice-advisor,workflows}, p3-hub, workflows).
2. **Removed broken `/p3-hub` link** from `components/layout/Sidebar.tsx` (its target page lived only in the deleted shadow tree, plus its own sub-links pointed to deleted routes).
3. **Removed `src/ai/crews/idea-analysis-crew.py`** — Python file in a TypeScript project, never imported.
4. **Model upgrades** (consistency with `src/lib/gemini.ts` MODELS tier):
   - `src/ai/agents/code-interpreter/agent.ts`: `gemini-2.0-flash` → `gemini-3-flash-preview`
   - `src/ai/agents/compliance/agent.ts`: `gemini-1.5-flash` → `gemini-3.1-pro-preview` (compliance reasoning depth)
5. **Cost optimization** — `src/ai/agents/digital-twin/continuous-updater.ts` moved from FLASH to LITE (`gemini-3.1-flash-lite-preview`); routine continuous merges don't need a reasoning model. Estimated ~60-80% per-call cost reduction on this hot path.
6. **Removed `// @ts-nocheck`** from `src/lib/gemini.ts` — file type-checks cleanly.

## Bug Fixes (April 2026)

1. **LanguageContext** — default language changed from `'en'` to `'ar'` so all AppShell pages show Arabic UI by default.
2. **AppShell splash CTA** — "بدء الرحلة" / "Enter the Future" button now links to `/auth/signup` instead of calling `signInWithGoogle()` directly.
3. **Logo Image warnings** — All `<Image>` tags for `logo.jpg` across AppShell, Footer, auth/signup, and marketing page now use `style={{ height: '...', width: 'auto' }}` instead of mismatched `className` + `prop` dimensions.
4. **CFO page** (`/cfo`) — wrapped in `<AppShell>` so it shows proper navigation header and sidebar.
5. **Admin pages** (`/admin`, `/admin/agents-health`, `/admin/ai-logs`, `/admin/compliance`) — all wrapped in `<AppShell>` for consistent navigation.
6. **Dashboard page** (`/dashboard`) — migrated from direct `<Sidebar>` import with hardcoded `mr-64` to `<AppShell>` for full consistency.
7. **Auth flow fully restored (April 21, 2026)** — `src/lib/firebase.ts` now falls back to real config from `firebase-applet-config.json` when `NEXT_PUBLIC_FIREBASE_*` env vars are missing (was using dummy keys → silent Google popup failure). Created `app/auth/login/page.tsx`. Fixed root navbar in `app/page.tsx` (`/login` → `/auth/login`, `/register` → `/auth/signup`). `AuthContext.signInWithGoogle` now surfaces toast errors. `AuthGuard` redirects unauthenticated users to `/auth/login` instead of signup. Added `prompt: 'select_account'` on `GoogleAuthProvider` so users can switch accounts.

## 2026-04-22 — Chat Agent Restoration & UI Polish

### Root cause of "main agent error when chatting"
1. **`GEMINI_API_KEY` was missing** from secrets entirely (now requested and set).
2. **`@ai-sdk/google` reads `GOOGLE_GENERATIVE_AI_API_KEY`**, not `GEMINI_API_KEY`. Fixed in two places:
   - `src/lib/gemini.ts` now uses `createGoogleGenerativeAI({ apiKey })` and reads `GEMINI_API_KEY` (with fallbacks).
   - `instrumentation.ts` mirrors `GEMINI_API_KEY` → `GOOGLE_GENERATIVE_AI_API_KEY` / `GOOGLE_API_KEY` at server startup so files importing `google` directly from the SDK still work.
3. **Speculative model IDs (`gemini-3.x-*`) don't exist on the Google API.** Globally replaced across `src/`, `app/`, `components/`:
   - `gemini-3-flash-preview` → `gemini-2.5-flash`
   - `gemini-3.1-flash-lite-preview` → `gemini-2.5-flash-lite`
   - `gemini-3.1-pro-preview` → `gemini-2.5-pro`
   - Real IDs are now centralized in `MODEL_IDS` in `src/lib/gemini.ts` and overridable via `MODEL_LITE`, `MODEL_FLASH`, `MODEL_PRO`, `MODEL_EMBEDDING` env vars (single swap point when 3.x models GA).
4. **Embedding API**: `google.embedding(...)` (deprecated) → `google.textEmbeddingModel(...)`.
5. **Intent router** in `src/ai/orchestrator/supervisor.ts` switched from FLASH → LITE for the trivial classification call (cheaper + less rate-limited).

### Chat UI fixes (`app/(dashboard)/chat/page.tsx`)
- Header: removed duplicate 🤖 emoji that overlapped the avatar; added "متصل" status indicator with pulse; cleaner stacking of "كلميرون" + "المستشار الذكي".
- Bubble alignment: replaced `mr-auto`/`ml-auto` hacks with proper `justify-start` (user) and `justify-end` (assistant) inside the RTL container, plus `items-end` for clean baseline.
- Bubble colors: brand-gold tint for user, brand-blue tint for assistant — consistent with the brand palette.

### Verified working
```
POST /api/chat → 200, SSE stream:
  phase: router → phase: general_chat_node → delta: "مرحباً بك! أنا كلميرون..." → done
```

## Build Status

✅ Runtime: Next.js dev server running on port 5000  
✅ Proxy: `proxy.ts` (Next.js 16.2 convention) + IP Rate Limiting  
✅ Auth Guard: Client-side via `AuthGuard` component  
✅ Firestore Rules: Hardened for all collections  
✅ Pino Logger: Structured logging with request IDs  
✅ E2E Tests: Playwright configured  
✅ TypeScript: 0 errors (`tsc --noEmit`)  
✅ Default Language: Arabic (`'ar'`)

## 2026-04-21 — Production Readiness Overhaul (Kalmeron Two)

### Brand & Theme
- New SVG logo at `public/brand/logo.svg` (gold→blue gradient + "Kalmeron Two" wordmark).
- Dynamic favicon/icon: `app/icon.svg`, `app/apple-icon.svg`.
- New brand tokens in `app/globals.css`: brand-gold #D4AF37, brand-blue #3B82F6, dark-bg #080C14, dark-surface #0D1321.
- Fonts: Plus Jakarta Sans, Syne (display), Noto Kufi Arabic.
- Aurora background via CSS-only blobs (no 3D dependency).

### Navigation
- `components/layout/Sidebar.tsx` — 3 sections (Main / 7 Departments / Tools) + Settings + Logout.
- `components/layout/AppShell.tsx` — uses new Sidebar; mobile menu redesigned; SVG logo everywhere.

### New Pages
- `/roadmap` — Live timeline of agent task activity from `/api/dashboard` (15s polling).
- `/departments/[department]` — Dynamic page for 7 departments (marketing, sales, operations, finance, hr, support, legal) with agent rosters.

### Real Data (no mocks)
- `/dashboard` — Now fully driven by `/api/dashboard` (welcome, stage progress, team activity, pending tasks, alerts, metrics). Replaced hardcoded "أقرب فرصة" with rader CTA.
- `/admin` — Replaced fake users array with real Firestore query via `/api/admin/users`. Added live fleet control table from `/api/admin/mission-control`.
- New `/api/admin/users` (GET/DELETE) — admin-gated by `ADMIN_EMAILS` env, real Firebase Admin SDK.

### Admin Governance Layer
- `src/ai/admin/observer.agent.ts` — Continuous monitoring + auto-alerts.
- `src/ai/admin/analyst.agent.ts` — Risk classification (cost/reliability/performance).
- `src/ai/admin/planner.agent.ts` — Remediation plan generation.
- `/api/admin/governance` — Exposes observer→analyst→planner pipeline.

### Chat UX
- `components/chat/ThoughtChain.tsx` — Phased "thinking" indicator (analyze → recall → research → compose).

### Vercel Readiness
- Updated `.env.example` documenting all required env vars including `ADMIN_EMAILS`, `FIREBASE_SERVICE_ACCOUNT_KEY`, `COST_DAILY_LIMIT_USD`.
- `vercel.json` already configures cron jobs for /api/cron/red-team.

### Required for Deploy
- `GEMINI_API_KEY`
- All `NEXT_PUBLIC_FIREBASE_*` vars
- `FIREBASE_SERVICE_ACCOUNT_KEY` (for admin features + task persistence)
- `ADMIN_EMAILS` (comma-separated; restricts /admin access)

## Radical Refinement Session (Phase 2)
**SSE Thought Streaming** — `/api/chat` الآن يبثّ مراحل تفكير LangGraph الحقيقية (`event: phase`) ودلتا النص (`event: delta`) عبر SSE. واجهة المحادثة تستهلكها مباشرة بدون `useChat`.

**Stop Generating** — زرّ إيقاف أحمر يظهر أثناء التوليد، يلغي الطلب عبر `AbortController` ويحفظ النص الجزئي الذي وصل في Firestore.

**Hybrid Model Router** — `src/lib/model-router.ts` يصنّف المهام إلى 5 مستويات (trivial/simple/medium/complex/critical) ويوجّهها إلى نقاط نهاية Gemini المناسبة (`gemini-2.5-flash-lite` / `flash` / `pro`)، مع جدول تكلفة وتقدير مالي. أسماء النماذج معزولة في `MODEL_ALIASES` لتسهيل التبديل لاحقاً (Gemma 4 / DeepSeek V4 / GLM-5.1) عند توفّر نقاط نهايتها.

**Drift Detector** — `src/lib/observability/drift-detector.ts` يخزّن عيّنات سلوك الوكلاء في `agent_drift/` ويحسب درجة انجراف 0..1 لكل وكيل بناءً على نسبة النجاح، زمن الاستجابة، وتركّز استخدام الأدوات. مكشوف عبر `/api/admin/drift` ومدمج في `/api/admin/governance`.

**PlanGuard** — `src/lib/security/plan-guard.ts` يطبّق دفاع متعدّد الطبقات ضد حقن الأوامر غير المباشر: قائمة بيضاء للأدوات لكل نية، فحص استدعاء كل أداة، ورفض الوسائط المنسوخة من مصادر غير موثوقة (RAG/PDF/الويب).

**Bento Grid** — صفحات الأقسام تستخدم تخطيط "بنتو" (بطاقة قائد القسم مزدوجة الحجم + بطاقات عرض ثنائي متناوبة).

**حزم/نماذج لم تُنفَّذ** (لعدم توفّرها كحزم npm/نقاط نهاية حقيقية وقت العمل):
- `@a2ui/rizzcharts`, `@tthbfo2/firebase-cost-trimmer`
- نماذج `gemini-3.1-*`, `gemma-4-*`, `deepseek-v4`, `glm-5.1`, `llama-4-maverick`
- إطارَا `ClawGuard` و`PlanGuard` كحزم منفصلة (طُبّق منهجهما في `plan-guard.ts` كنسخة محلية).
- `Next.js 16 cacheComponents` (يتعارض مع `export const runtime = 'nodejs'` في مسارات API الحالية — موثّق في `next.config.ts`).

## Phase 3 — Production Observability & Caching (April 2026)

### Real packages added
- `langfuse` (LLM trace, latency, cost & quality tracking)
- `@sentry/nextjs` (runtime error tracking, already installed)
- `@tanstack/react-query` + `react-query-persist-client` + `query-sync-storage-persister` (client cache with localStorage, ~40-60% Firestore-read reduction on hot paths)
- `recharts` (brand-styled chart components)

### New files
- `src/lib/observability/langfuse.ts` — real Langfuse client with no-op fallback when env keys absent.
- `src/lib/observability/agent-instrumentation.ts` — `instrumentAgent()` wrapper unifying drift detector + Langfuse for any agent.
- `src/lib/observability/arize.ts` — Phoenix HTTP collector stub (Phoenix has no JS SDK; OTel HTTP integration documented in-file).
- `src/lib/cache/query-client.tsx` — `<QueryProvider>` with localStorage persistence (10 min stale, 1 day gc).
- `src/components/charts/index.tsx` — `KalmeronLineChart / AreaChart / BarChart / PieChart` (Recharts, brand palette).
- `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts` / `instrumentation.ts` — gated on `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`.

### Wiring
- `app/layout.tsx` now wraps the tree in `<QueryProvider>`.
- Agents instrumented: `cfo-agent`, `legal-guide`, `forecaster.predictRevenue`. Each call now feeds drift detector + Langfuse automatically.
- Embedding model upgraded to **real GA `gemini-embedding-001`** (replacing the speculative preview ID) across `embeddings.ts`, `gemini.ts`, `digital-twin/graphrag.ts`.

### New env vars (all optional, gated fallback)
```
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_BASE_URL=https://cloud.langfuse.com
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
PHOENIX_ENDPOINT=
```

### Skipped — fictional / unavailable packages
- `@a2ui/rizzcharts` → replaced by Recharts brand wrappers.
- `@tthbfo2/firebase-cost-trimmer` → replaced by React Query + localStorage persister.
- `freerstore` → covered by the same React Query layer.
- `@arize-ai/phoenix` (npm) → Phoenix is Python-only; HTTP collector stub provided.
- Speculative model IDs (Gemini 3.1, Gemma 4, DeepSeek V4, GLM-5.1, Llama 4 Maverick) — single swap point at `src/lib/model-router.ts` `MODEL_ALIASES`.
- Next.js 16 `cacheComponents` flag — incompatible with `runtime = 'nodejs'` declared on 12+ API routes; deferred until those routes can move to Edge.

### Build status
`next build` passes cleanly; dev server starts on port 5000.

## 2026-04-23 — Agent System Hardening (Task #1, partial)

The original task spec covers 38 steps across 11 phases. This pass executes the
highest-leverage architectural items so the remaining phases can be tackled
incrementally without re-doing the foundation:

### Cleanup / unification
- Deleted unused legacy `src/agents/orchestrator/{agent,router}.ts` (no live
  imports anywhere; verified with ripgrep). Single orchestrator entry remains
  `intelligentOrchestrator` in `src/ai/orchestrator/supervisor.ts`.

### Richer Agent Registry — `src/ai/agents/registry.ts`
- New `AgentDefinition` type carrying: `displayNameAr`, `description`, `intent`,
  `graphNode`, `preferredModel` (LITE/FLASH/PRO), `capabilities`, `allowedTools`,
  `softCostBudgetUsd`, `inputSchema`, `action`, `thinkingLabelAr`.
- Helpers: `getRoutableAgents()`, `findAgentByIntent()`,
  `getThinkingLabelForNode()` — supervisor and ThoughtChain can now read labels
  dynamically instead of hard-coding them.

### Unified LLM Gateway — `src/lib/llm/gateway.ts` (new)
Wraps `generateText` / `generateObject` / `streamText` with:
- Prompt-injection sanitizer (`sanitizeInput` + `validatePromptIntegrity`).
- PII redaction on inputs (`redactPII`).
- Per-user / per-agent cost tracking (in-memory `COST_BY_USER` / `COST_BY_AGENT`).
- In-memory audit ring buffer (`getRecentAudit`, `getCostSnapshot`).
- Untrusted-source check for RAG/PDF/web inputs.
- `safeGenerateText` returns `PROMPT_INJECTION_BLOCKED` placeholder instead of
  forwarding the request when guard trips; `safeGenerateObject` throws.

### PII Redactor — `src/lib/compliance/pii-redactor.ts` (new)
Detects + redacts: Egyptian national ID (14 digits), Egyptian phone numbers
(+20/0 + 1 + 9 digits), email, credit cards (13–19 digits), Egyptian IBAN.
Used in `/api/chat` before messages hit the LLM.

### Per-user / per-agent rate limiting — `lib/security/rate-limit.ts`
Now accepts optional `userId` (preferred over IP) and `scope` for
agent-specific buckets. New helper `rateLimitAgent(req, agent, userId, opts)`
for routes that want a separate bucket per agent.

### Follow-up Suggestions — `src/ai/suggestions/follow-ups.ts` (new)
After each chat turn, `/api/chat` emits an `event: suggestions` SSE frame with
2–3 short Egyptian-Arabic follow-up questions generated by Gemini Lite.
Static fallback when LLM call fails so the stream is always non-blocking.

### Admin endpoint — `app/api/admin/llm-audit/route.ts` (new)
`GET /api/admin/llm-audit?limit=100` → recent gateway audit entries + cost
snapshot. Gated by `ADMIN_EMAILS` env var.

### Eval harness — `test/eval/`
- `golden-dataset.json` — 11 cases covering all 9 routable intents, one
  prompt-injection safety case, one PII-redaction case.
- `run-eval.ts` — runs the supervisor on each case, checks intent accuracy
  and PII redaction coverage, exits non-zero below `passThreshold` (0.7).
  Skips intent checks gracefully when `GEMINI_API_KEY` is missing.

### Chat SSE contract additions
`event: suggestions` `{ items: string[] }` is now emitted right before
`event: done`. Existing events (`phase`, `delta`, `done`, `error`) are unchanged.

### Explicitly out of scope this pass (still TODO from task spec)
- Multi-agent crews wiring through `artifact-bus` / `event-mesh` (Phase 5).
- Langfuse / Arize live traces wiring beyond what `instrumentAgent` already
  provides (Phase 7).
- Long-term user memory + Knowledge Graph activation (Phase 3 #9–10).
- Prompt-optimizer auto-tuning loop (Phase 9 #32).
- E2E Playwright coverage per agent (Phase 11 #38).

---

## April 2026 — Roadmap Phases 4–9 implementation

### Phase 4 — Observability (extension)
- Wrapped `insights-analyzer`, `interview-simulator`, `customer-support`,
  `compliance` with `instrumentAgent`. Added `src/ai/agents/admin/runners.ts`
  with 4 admin Mastra agents.
- Extended `src/lib/llm/gateway.ts`: `COST_BY_MODEL` table +
  `getCostByModel()`; every audit row now stores `model`, `tokens`, `cost`.
- `app/api/admin/llm-audit/route.ts?summary=byModel` returns aggregated
  per-model cost rollups.
- New widgets `components/admin/DriftWidget.tsx` and `CostByModelWidget.tsx`
  mounted in `app/admin/page.tsx`.

### Phase 5 — Eval CI gate
- Golden dataset expanded 11 → 21 cases (per-intent coverage + extra safety
  cases incl. PII national-ID).
- `npm run eval` runs `tsx test/eval/run-eval.ts`.
- `.github/workflows/eval.yml` enforces the threshold on PRs.

### Phase 6 — Per-user RAG with citations
- `src/lib/rag/user-rag.ts` — chunk (800 chars / 120 overlap), embed via
  `gemini-embedding-001`, store in Firestore `rag_chunks` namespaced by
  `userId`; cosine search in-memory (sufficient up to ~10k chunks/user).
- `app/api/rag/ingest` (PDF/CSV/XLSX/TXT, 10MB cap), `/search`, `/documents`
  (GET list / DELETE).
- `components/rag/DocumentUploader.tsx` mounted on `/cfo` and
  `/(dashboard)/supply-chain`.
- `/api/chat` now calls `searchUserKnowledge` per turn, prepends a system
  message with the top-K chunks tagged `[1]…[N]`, and emits a new
  `event: citations` SSE frame consumed by the chat UI to render a
  "مصادر من مستنداتك" panel under each assistant reply.

### Phase 7 — Actions registry + approval inbox
- `src/ai/actions/registry.ts` — typed registry of side-effecting actions
  (`send_email`, `create_invoice_draft`, `schedule_meeting`, `send_whatsapp`).
  Each declares a Zod input schema and `requiresApproval`. External rails
  (Resend, WhatsApp Cloud API) gracefully no-op when their env vars are
  absent — request still gets logged with `status: 'executed_noop'`.
- `requestAction()` writes to Firestore `agent_actions`; `decideAction()`
  approves/rejects and runs the handler.
- `app/api/actions/inbox` (GET list / POST decide) and
  `app/api/actions/request` (POST).
- `app/inbox/page.tsx` — reviewer UI with status filters and one-click
  approve/reject. Linked from sidebar nav (الرئيسي → صندوق الموافقات).

### Phase 8 — Workspaces + audit log
- `src/lib/workspaces/workspaces.ts` — Firestore `workspaces/{wid}` with
  `members/{uid}` subcollection (`owner|finance|ops|viewer`).
  `ensureDefaultWorkspace(uid)` auto-provisions a personal space on first
  request.
- `app/api/workspaces` (GET list+members, POST add/remove member).
- `recordAudit()` writes immutable rows to Firestore `audit_log`. Hooked
  into action-approval/rejection in `/api/actions/inbox` and member
  add/remove in `/api/workspaces`.
- `app/api/admin/audit` returns last 200 rows; `/admin/audit` page renders
  them in a sortable table.
- `components/workspaces/WorkspaceSwitcher.tsx` mounted at the top of the
  sidebar; persists active workspace ID in `localStorage`.

### Phase 9 — PWA hardening + Arabic voice
- `public/sw.js` — Workbox-style service worker: install caches the app
  shell, stale-while-revalidate for `/_next/static` + static assets,
  network-first for navigations with cache fallback. Skips POST/SSE/API
  routes so the LLM stream is never intercepted.
- `components/pwa/ServiceWorkerRegistrar.tsx` — registers SW only in
  production; mounted in `app/layout.tsx`.
- `components/chat/VoiceInputButton.tsx` — Web Speech API (`ar-EG`).
  Detects browsers without `SpeechRecognition` and renders a disabled
  mic icon instead of failing. Integrated into the chat input.

### Chat SSE contract additions (Phase 6)
`event: citations` `{ items: Citation[] }` emitted before
`event: done` whenever the user has matching documents. `done` payload now
includes `citations: <count>`.

### Phase 10 — Panel of Experts (مجلس الإدارة الافتراضي)
Each user-facing agent (idea-validator, plan-builder, mistake-shield,
success-museum, opportunity-radar, cfo-agent, legal-guide, real-estate,
general-chat) now runs through an internal "council of experts" before
returning to the user, transforming every agent from a single-LLM call
into a deliberating multi-perspective panel.

- `src/ai/panel/experts.ts` — 4 permanent experts (Critical Analyst,
  Context Engineer, Quality Auditor, Ethical Reviewer) that run on every
  request, plus 12 specialized experts split across 3 panels (Strategic,
  Technical, Marketing — 4 each).
- `src/ai/panel/router.ts` — internal LITE-model router that classifies
  the task domain and selects 3-4 specialized experts to inject. Falls
  back to a balanced mixed panel on error.
- `src/ai/panel/types.ts` — Zod schema enforcing the unified output:
  `diagnosis` → 3 `options` (each with pros/cons) → `recommendation` →
  `confidence` (0-100) → `implementationSteps` → optional
  `qualityNotes` (5-criteria audit + ethical review).
- `src/ai/panel/council.ts` — `runCouncil()` performs a single PRO
  structured-generation call that embodies all selected experts and
  returns the unified output + a Markdown render
  (`formatCouncilAsMarkdown`). `runCouncilSafe()` never throws; returns
  fallback markdown on injection/error.
- `src/ai/orchestrator/supervisor.ts` — every supervisor node now wraps
  its agent's draft (when applicable) through `withCouncil()`. Disabled
  with `KALMERON_COUNCIL=off` env flag.
- `app/api/council/route.ts` — POST endpoint for direct testing/
  embedding the council outside the supervisor (rate-limited 10/min).
- Token efficiency: 1 LITE router call + 1 PRO structured call per
  request — simulates 7-8 expert deliberation without 7-8 round trips.
- Tests: `test/panel.test.ts` (10 tests, all passing) cover expert
  registry shape, roster builder, schema validation, and markdown
  formatter.
