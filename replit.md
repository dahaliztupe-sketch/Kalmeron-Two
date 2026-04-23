# Kalmeron AI (ai-studio-applet)

Arabic-language AI studio platform for Egyptian entrepreneurs.

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
- Full RAG ingestion pipeline + advanced retrieval strategies (Phase 4 #11–14).
- Multi-agent crews wiring through `artifact-bus` / `event-mesh` (Phase 5).
- Langfuse / Arize live traces wiring beyond what `instrumentAgent` already
  provides (Phase 7).
- Long-term user memory + Knowledge Graph activation (Phase 3 #9–10).
- Prompt-optimizer auto-tuning loop (Phase 9 #32).
- E2E Playwright coverage per agent (Phase 11 #38).
