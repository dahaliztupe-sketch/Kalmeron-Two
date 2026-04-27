# Kalmeron AI — ملف تعريف شامل للمشروع

> **الهدف من هذا الملف:** تقديم صورة كاملة عن المشروع لأدوات بحث خارجية (Claude، Kimi، GPT، Gemini، إلخ) كي تستطيع إجراء أبحاث تقنية معمّقة، اقتراح تحسينات، أو مراجعة أفضل الممارسات. الملف **مكتفٍ بذاته** — لا يحتاج قارئه إلى أي ملف آخر من المشروع للفهم الأساسي.
>
> **آخر تحديث:** 27 أبريل 2026 · **الحالة:** Production-ready · **المستودع:** GitHub `dahaliztupe-sketch/Kalmeron-Two`

---

## 1. ملخّص تنفيذي

**كلميرون** (Kalmeron AI) منصّة ذكاء اصطناعي عربية الواجهة (RTL، IBM Plex Arabic) موجّهة لمؤسّسي الشركات الناشئة في **مصر والسعودية والإمارات**. تعمل كـ **"مقرّ عمليّات افتراضي"** يضمّ **16+ وكيلاً متخصّصاً** يديرون كل وظائف الشركة:

- المالية (CFO Agent + حاسبة الضرائب المصرية)
- القانون (Legal Guide بقاعدة معرفة محلّية)
- التسويق والمبيعات والموارد البشرية والعمليات والمنتج
- التحقّق من الأفكار، بناء الخطط، درع الأخطاء، رادار الفرص
- مستشار العقارات، صوت العملاء، متحف النجاح

**المميّز التقني الرئيسي:** نظام **توجيه نماذج هجين** يصنّف كل سؤال إلى 5 طبقات (`trivial → critical`) ويختار نموذج Gemini المناسب (Flash-Lite / Flash / Pro) ديناميكياً لتقليل التكلفة 8-10× مقابل استخدام Pro لكل شيء، مع **Panel of Experts** (مجلس استشاري افتراضي) للأسئلة الحرجة يستخدم LangGraph لتنسيق وكلاء متعدّدين.

**حجم الكود:** ~64 ألف سطر TypeScript/React + ~2 ألف سطر Python · **107 صفحة** · **92 API route** · **26 ملف اختبار**.

---

## 2. التقنيات المُعتمدة (Stack)

| الطبقة | التقنية | الإصدار | ملاحظة |
|---|---|---|---|
| Framework | Next.js (App Router + Turbopack) | **16.2.4** | Server Components + Server Actions |
| Lang | TypeScript | **5.7** (strict) | `noImplicitAny`, `strictNullChecks` |
| Runtime | Node.js 20 + Edge Runtime (لـ proxy) | — | معظم API routes Node-only (Firebase Admin) |
| UI | React | **19.2** | Concurrent + use() + RSC |
| Style | Tailwind CSS | **4.2** | بدون tailwind.config.js (CSS-first) |
| Components | shadcn/ui + Base UI + Radix | — | `components.json` + `components/ui/` |
| Animations | Motion (Framer-Motion fork) | **12.38** | `transpilePackages: ['motion']` |
| 3D | three + @react-three/fiber + drei | 0.184 / 9.6 / 10.7 | لصفحات investor/demo |
| State | TanStack Query 5 + persistQueryClient | 5.100 | بديل Redux (ممنوع) |
| i18n | next-intl | **4.9** | افتراضي `ar`، خيار `en` |
| Auth | Firebase Auth | 12.12 (client) + 13.8 (admin) | Google OAuth + Email + Phone OTP |
| DB | **Firestore** + Firestore Rules | — | مع `firestore.indexes.json` للـ composite indexes |
| AI SDK | `@ai-sdk/google` (Vercel AI SDK) + `@google/genai` | 3.0.64 + 1.50.1 | تسلسلات SSE للدردشة |
| Orchestration | LangGraph + LangChain Core + Mastra | 1.2.9 / 1.1.41 / 1.28 | Supervisor pattern + Council |
| Memory | mem0ai | 3.0.1 | ذاكرة طويلة المدى للوكلاء |
| Vector | Qdrant (override 1.17) + ONNX local embeddings | — | Multilingual MiniLM L12 (384d) |
| Knowledge Graph | neo4j-driver | 6.0.1 | (محجوز للمستقبل) |
| Workflows | @temporalio/client + workflow | 1.16 | للمهام الخلفية الموثوقة |
| Payments | Stripe + Fawry (مصر) | 22.1 + custom | عملات: EGP / USD / SAR / AED |
| Email | Resend | (REST) | للنشرة اليومية والـ transactional |
| Observability | Sentry + Langfuse + OpenTelemetry + pino | 10.50 / 3.38 / 1.9 / 10.3 | نتايج LLM + traces + structured logs |
| PDF | pdfkit + pdf-parse + @react-pdf/renderer | 0.18 / 2.4 / 4.5 | عربي عبر `arabic-reshaper` |
| Spreadsheet | xlsx | 0.18 | تصدير CSV/Excel للتقارير |
| Forms / Validation | zod | 4.3 | تحقق على الجانبين |
| PWA | Service Worker مخصّص + Web Push | — | `app/firebase-messaging-sw.js` |
| WebLLM | @mlc-ai/web-llm | 0.2.82 | تجريبي — تشغيل نماذج صغيرة في المتصفح |
| Tests | Vitest 4 + Playwright 1.59 + @firebase/rules-unit-testing | — | Unit + Integration + E2E + Rules |
| Lint | ESLint 9 (flat config) + eslint-config-next | — | + lexicon-lint مخصّص للعربية |
| QA Tooling | Playwright Chromium مع 7 فاحصين مخصّصين | — | layout, content, perf, RTL, SEO, auth, agents |

> **ممنوع تقنيات:** Redux، Yarn، MongoDB، Prisma، tRPC، أي ORM، أي Babel plugin. أي إضافة تقنية رئيسية تستلزم **ADR** (Architecture Decision Record) في `docs/decisions/`.

---

## 3. هيكل المجلدات (File Map)

```
.
├── app/                          ← Next.js App Router (107 page, 92 API route)
│   ├── (dashboard)/              ← Route group محمي بالـ AuthGuard
│   │   ├── dashboard/            ← الصفحة الرئيسية للمستخدم المسجَّل
│   │   ├── chat/                 ← واجهة الدردشة الرئيسية (SSE streaming)
│   │   ├── ideas/analyze/        ← تحليل أفكار الأعمال
│   │   ├── investor/             ← Pitch deck + readiness health
│   │   ├── meetings/             ← اجتماعات افتراضية
│   │   ├── okr/                  ← أهداف ونتائج فصلية
│   │   ├── workflows-runner/     ← تشغيل سير العمل
│   │   ├── virtual-office/       ← مكتب افتراضي ثلاثي الأبعاد
│   │   ├── settings/             ← API keys, webhooks, privacy, referrals, usage
│   │   └── ...30+ صفحة dashboard
│   ├── api/                      ← API Routes (Node.js runtime افتراضياً)
│   │   ├── chat/                 ← SSE streaming via Vercel AI SDK
│   │   ├── orchestrator/         ← LangGraph supervisor entry point
│   │   ├── council/              ← Panel of Experts mode
│   │   ├── billing/              ← Stripe checkout + portal + Fawry
│   │   ├── webhooks/             ← Stripe + Telegram + WhatsApp
│   │   ├── cron/                 ← مهام مجدولة (5 cron jobs)
│   │   ├── rag/                  ← Vector ingest + search + documents
│   │   ├── admin/                ← Mission control + cost analytics + drift
│   │   └── ...92 endpoint إجمالاً
│   ├── auth/login, signup        ← صفحات Firebase Auth
│   ├── pricing/, terms/, privacy/ ← الصفحات العامة
│   ├── en/                       ← (مخصّص لمسارات الإنجليزية)
│   ├── layout.tsx                ← Root layout + AuthProvider + i18n
│   └── globals.css               ← Tailwind 4 + CSS variables + RTL
│
├── components/
│   ├── ui/                       ← shadcn primitives (Button, Card, Dialog…)
│   ├── auth/                     ← AuthGuard, GoogleButton, EmailForm
│   ├── chat/                     ← MessageList, ThoughtChain, AgentSelector
│   ├── pricing/                  ← PricingHero, PricingCards, PricingFAQ
│   ├── dashboard/                ← WelcomeCard, ActivityFeed, QuickActions
│   ├── admin/                    ← MissionControl, CostChart, DriftMonitor
│   ├── 3d/                       ← Three.js scenes للـ investor demo
│   ├── effects/                  ← Animations + decorative gradients
│   ├── layout/                   ← Header, Footer, Sidebar
│   ├── billing/, brand/, demo/, landing/, marketing/, onboarding/, pwa/, rag/, seo/, workspaces/
│   └── theme-provider.tsx
│
├── contexts/
│   └── AuthContext.tsx           ← Firebase Auth state + kal_session cookie
│
├── src/
│   ├── ai/                       ← منطق الذكاء الاصطناعي الأساسي
│   │   ├── orchestrator/         ← LangGraph supervisor.ts (router + agent dispatch)
│   │   ├── agents/               ← 18 وكيلاً متخصّصاً (cfo, legal, hr, …)
│   │   ├── crews/                ← مجموعات وكلاء (HR crew, Sales crew, QA crew)
│   │   ├── panel/                ← Council of Experts (debate + refine)
│   │   ├── organization/         ← هيكل تنظيمي للوكلاء (departments, governance)
│   │   ├── reasoning/            ← Tree-of-thoughts + chain-of-thought
│   │   ├── recipes/              ← قوالب مهام جاهزة (business plan, pitch, …)
│   │   ├── meta/                 ← Meta-cognition (self-reflection)
│   │   └── evaluation/           ← LLM-as-judge integration
│   ├── lib/
│   │   ├── model-router.ts       ← التوجيه الهجين للنماذج (TaskTier classifier)
│   │   ├── billing/              ← plans.ts + Stripe + Fawry
│   │   ├── rag/                  ← Document chunking + retrieval + reranking
│   │   ├── memory/               ← mem0 integration + per-user context
│   │   ├── temporal/workflows/   ← DLQ replay + long-running tasks
│   │   ├── observability/        ← Sentry + Langfuse + OTel wrappers
│   │   ├── security/             ← XSS sanitization + rate limiting helpers
│   │   ├── consent/              ← GDPR/PDPL consent ledger
│   │   ├── learning/             ← Self-evolution (skill consolidation)
│   │   └── ...30+ مجلد lib
│   ├── hooks/                    ← React hooks مخصّصة
│   ├── workers/                  ← Web Workers (Comlink-based)
│   └── mobile-app/               ← (مخصّص لإصدار Capacitor مستقبلي)
│
├── services/                     ← Python FastAPI sidecars
│   ├── pdf-worker/               ← استخراج وتنظيف PDFs العربية (port 8000)
│   ├── egypt-calc/               ← حسابات الضرائب والتأمينات المصرية (port 8008)
│   ├── llm-judge/                ← تقييم مخرجات LLM بـ Gemini كحَكَم (port 8080)
│   ├── embeddings-worker/        ← FastEmbed multilingual ONNX (port 8099)
│   ├── data-warehouse/           ← dbt + DuckDB → BigQuery للإنتاج
│   └── eval-analyzer/            ← تحليل نتائج تقييمات LLM
│
├── i18n/                         ← next-intl config
│   ├── routing.ts                ← locales: ['ar', 'en'], default: 'ar'
│   └── request.ts                ← getRequestConfig
├── messages/                     ← ar.json + en.json (مفاتيح الترجمة)
│
├── qa/                           ← نظام QA المخصّص (Playwright + 7 فاحصين)
│   ├── checkers/                 ← layout, content, performance, rtl, seo, auth, agents
│   ├── runner.ts, index.ts, config.ts, devices.ts, reporter.ts
│   └── reports/                  ← HTML + JSON reports (لكل تشغيل)
│
├── docs/                         ← توثيق هندسي
│   ├── decisions/                ← ADRs
│   ├── THREAT_MODEL.md           ← STRIDE-based
│   ├── RUNBOOK.md                ← إجراءات التشغيل
│   ├── SECRETS_ROTATION.md
│   ├── SIDECAR_DEPLOYMENT.md
│   └── ...
│
├── test/                         ← Vitest unit + integration tests
├── e2e/                          ← Playwright E2E
├── hooks/                        ← React hooks مشتركة
│
├── proxy.ts                      ← Edge proxy: GeoIP + rate limit + auth guard
├── instrumentation.ts            ← OpenTelemetry + Sentry init
├── next.config.ts                ← CSP + security headers + bundle analyzer
├── firestore.rules, firestore.indexes.json
├── vercel.json                   ← cron schedules + build env
├── AGENTS.md                     ← دستور العمل لوكلاء AI الذين يحرّرون الكود
└── replit.md                     ← دليل المساهمة + سجل التغييرات الداخلي
```

---

## 4. نموذج البيانات (Firestore Collections)

| Collection | الوصف | قواعد الوصول |
|---|---|---|
| `users/{uid}` | ملف المستخدم (email, role, plan, locale, createdAt) | قراءة/كتابة المالك فقط |
| `users/{uid}/tasks/{taskId}` | مهام المستخدم (status, priority, assignee) | المالك + status ≠ completed للتحديث |
| `user_credits/{uid}` | رصيد المستخدم الحالي + monthlyResetAt | قراءة المالك، كتابة Admin SDK فقط |
| `workspaces/{wid}` | ميتاداتا فريق العمل | قراءة الأعضاء فقط |
| `workspaces/{wid}/members/{uid}` | role: owner/admin/member | قراءة الأعضاء فقط، **كل** الكتابات Admin SDK |
| `chat_history/{docId}` | محادثات المستخدم (threaded) | المالك فقط |
| `ideas/{docId}` | أفكار الأعمال المُحلَّلة | المالك فقط |
| `business_plans/{docId}` | خطط العمل المُولَّدة | المالك فقط |
| `user_memory/{docId}` | ذاكرة طويلة المدى لكل مستخدم (mem0) | المالك فقط |
| `personas/{docId}` | شخصيات المستخدمين والعملاء | المالك فقط |
| `market_experiments/{docId}` | تجارب السوق المُحاكاة | المالك فقط |
| `saved_companies/{docId}` | شركات محفوظة من رادار الفرص | المالك فقط |
| `mistakes_viewed/{docId}` | أخطاء شاهدها المستخدم | المالك فقط |
| `skills/{skillId}` | مهارات مكتسبة لكل وكيل (self-evolution) | قراءة أعضاء الـ workspace، كتابة Admin |
| `consent_events/{doc}` | سجل الموافقات (append-only لـ GDPR/PDPL) | قراءة المالك، كتابة Admin |
| `analytics_events/{doc}` | أحداث المنتج | server-only |
| `cost_events/{doc}` | أحداث استهلاك LLM (raw) | server-only |
| `cost_rollups/{doc}` | تجميعات ساعية | server-only |
| `cost_rollups_daily/{doc}` | تجميعات يومية | server-only |
| `account_deletions/{doc}` | قائمة انتظار حذف الحسابات | server-only |
| `opportunities/{doc}` | فرص أعمال عامة | قراءة عامة |
| `success_stories/{doc}` | قصص نجاح عامة | قراءة عامة |

**Composite Indexes** (`firestore.indexes.json`):
- `skills`: `(workspaceId, agentType, enabled)` و `(workspaceId, updatedAt desc)`
- `virtual_office_vms`, `virtual_office_tasks`, `launch_runs`, `virtual_meetings`, `channel_identities`

**أنماط أمان مهمة:**
- **Deny-all default**: `match /{document=**} { allow read, write: if false; }`
- **Privilege escalation hardening**: `members/{uid}` لا يمكن للعميل تعديله أبداً (يمنع الترقية الذاتية لـ owner)
- **Append-only ledgers**: `consent_events` لا تُحدَّث أو تُحذف من العميل

---

## 5. نظام الذكاء الاصطناعي

### 5.1 توجيه النماذج الهجين (`src/lib/model-router.ts`)

```ts
TaskTier = 'trivial' | 'simple' | 'medium' | 'complex' | 'critical'
```

| Tier | النموذج | تكلفة (input/output per 1M tokens) | الاستخدام |
|---|---|---|---|
| trivial | gemini-2.5-flash-lite | $0.10 / $0.40 | تصنيف، تحيّات، استخراج كلمات |
| simple | gemini-2.5-flash-lite | $0.10 / $0.40 | تلخيص، إعادة صياغة |
| medium | gemini-2.5-flash | $0.30 / $2.50 | محادثة عامة |
| complex | gemini-2.5-flash | $0.30 / $2.50 | تحليل سوق، خطة عمل |
| critical | gemini-2.5-pro | $1.25 / $10.00 | قانوني، مالي، استراتيجي |

التصنيف يتم بـ regex على المحتوى + طول النص (`< 40` تافه، `> 800` معقّد). نقاط التبديل المستقبلية موثّقة في `MODEL_ALIASES` (Gemma 4 / DeepSeek V4 / GLM-5.1 عند توفّرها).

### 5.2 Orchestrator (LangGraph Supervisor)

**`src/ai/orchestrator/supervisor.ts`** ينفّذ نمط Supervisor:
1. **Router** يصنّف نية المستخدم بـ Flash-Lite
2. يوجّه لأحد الـ 18 agent المتخصّص (cfo-agent, legal-guide, hr, marketing, …)
3. كل agent له `tools/`, `prompt/`, و state schema خاص
4. **Streaming** عبر SSE لإظهار `ThoughtChain` للمستخدم

### 5.3 Panel of Experts (مجلس الخبراء)

**`src/ai/panel/`** ينفّذ نمط multi-agent debate:
- يولّد مسوّدة جواب أولية بالـ tier الأنسب
- يرسلها لـ 3-5 personas (CFO + Legal + Strategist…) للنقد
- يدمج النقود في جواب نهائي محسّن
- يُفعَّل عبر `KALMERON_COUNCIL=on` env var

### 5.4 Self-Evolution Loop

**`src/lib/learning/`** + **cron `/api/cron/consolidate-skills`**:
- يلتقط أنماط ناجحة من المحادثات
- يحفظها كـ `skills/{skillId}` في Firestore
- يُدمجها كـ context عند مهام مشابهة لاحقاً

### 5.5 RAG (Retrieval-Augmented Generation)

- **Ingestion**: المستخدم يرفع PDFs → `pdf-worker` ينظّف ويقسّم → `embeddings-worker` يولّد vectors → Qdrant
- **Search**: hybrid (BM25 + vector) + reranking
- **Context Quarantine**: محتوى المستخدم لا يصل لـ system prompt مباشرة (لمنع prompt injection)

### 5.6 Memory (mem0)

- ذاكرة طويلة المدى لكل مستخدم
- يلتقط معلومات شخصية (اسم الشركة، قطاعها، مرحلتها)
- يُحقن في system prompt كل محادثة جديدة

---

## 6. خدمات Python (Sidecars)

كل خدمة FastAPI مستقلّة، تُنشر كحاوية منفصلة (Cloud Run / Railway / Fly):

| الخدمة | المنفذ | الوظيفة | الاعتماد |
|---|---|---|---|
| **pdf-worker** | 8000 | استخراج نص من PDFs مع `arabic-reshaper` لتصحيح اتجاه الحروف العربية + chunking ذكي | `pypdf`, custom Arabic normalization |
| **egypt-calc** | 8008 | حسابات حتمية للضرائب المصرية (دخل + تأمينات + إجمالي تكلفة الموظف) — يتجنّب hallucinations الـ LLM | `mathjs`, جداول الضرائب 2025 |
| **llm-judge** | 8080 | تقييم مخرجات LLM ضد rubrics (Accuracy/Tone/Completeness) — Gemini-2.5-flash-lite كحَكَم | `@google/genai`, rubrics في `judges.py` |
| **embeddings-worker** | 8099 | `paraphrase-multilingual-MiniLM-L12-v2` (384d) عبر FastEmbed/ONNX — بدون GPU | `fastembed` |
| **data-warehouse** | (offline) | dbt models تنقل Firestore → DuckDB (dev) أو BigQuery (prod) للتحليلات | `dbt`, `duckdb` |
| **eval-analyzer** | (offline) | تحليل تقارير judging | `pandas` |

---

## 7. المصادقة والأمان

### 7.1 تدفّق المصادقة
1. **Firebase Auth** على الجانب العميل (`contexts/AuthContext.tsx`):
   - Google OAuth (الأساسي)
   - Email + Password
   - Phone OTP (مصر/الخليج)
   - Passkeys: API routes موجودة (`/api/auth/passkey/*`) لكن ترجع 501 (مخطّط لاحقاً)
2. عند نجاح الدخول: `AuthContext` يحفظ كوكي `kal_session=1` (non-HTTPOnly، علامة فقط)
3. **Edge Proxy** (`proxy.ts`) يفحص الكوكي على المسارات المحمية ويعمل redirect لـ `/auth/login?next=...`
4. **API routes** تتحقّق فعلياً من Firebase ID Token عبر Admin SDK (الكوكي مجرّد صفّارة UX)

### 7.2 المسارات المحمية (في `proxy.ts`)
`/dashboard`, `/profile`, `/billing`, `/admin`, `/ideas/analyze`, `/settings`, `/inbox`, `/operations`, `/onboarding`

### 7.3 طبقات الأمان
- **CSP صارم** (`next.config.ts → buildCsp()`): فصل بين dev/prod، nonces في prod للـ inline scripts
- **HSTS** بـ `max-age=2y; includeSubDomains; preload`
- **Permissions-Policy**: تعطيل camera/microphone/geolocation/topics/cohort
- **COOP/CORP**: same-origin-allow-popups + same-site
- **Rate limit في Edge Proxy**: 100 req/min per IP (in-memory)
- **Firestore rules**: deny-all default + per-collection allowlist
- **GDPR/PDPL compliance**: `consent_events` ledger + `/api/account/delete` + `/api/account/export`
- **Threat model** كامل في `docs/THREAT_MODEL.md` (STRIDE-based)
- **DPIA** (Data Protection Impact Assessment) في `docs/dpia/`

---

## 8. التسعير والفوترة

(`src/lib/billing/plans.ts`)

| الخطة | السعر شهرياً (EGP) | الرصيد اليومي | الرصيد الشهري |
|---|---|---|---|
| Free | 0 | 200 | 3,000 |
| Starter | 199 | 800 | 12,000 |
| **Pro** ⭐ | **399** | **2,000** | **30,000** |
| Founder | 999 | 10,000 | 200,000 |
| Enterprise | بحسب الطلب | غير محدود | غير محدود |

- **خصم سنوي 33%** عند الدفع لمدّة عام مقدّماً
- بوّابات الدفع: **Stripe** (دولياً + EGP) و **Fawry** (محفظة + بطاقة + كاش — مصر)
- **GeoIP**: `proxy.ts` يقرأ `x-vercel-ip-country` ويضبط `x-kalmeron-currency` (EGP/SAR/AED)
- **Credit consumption**: ~5 credits لكل رسالة عادية، ينخفض/يرتفع بحسب الـ TaskTier المُختار من model-router
- **Stripe webhook** (`/api/webhooks/stripe`) يحدّث `users/{uid}.plan` + `user_credits/{uid}` تلقائياً

---

## 9. التوطين (i18n) واتجاه RTL

- **`next-intl@4`**: locales = `['ar', 'en']`, default = `ar`
- جميع المفاتيح في `messages/ar.json` و `messages/en.json`
- **خط افتراضي**: IBM Plex Arabic (Cairo كاحتياطي عبر `@fontsource/cairo`)
- **`<html dir="rtl" lang="ar">`** يُعيَّن في `app/layout.tsx`
- **`lint:lexicon`** سكريبت مخصّص (`scripts/lexicon-lint.ts`) يضمن مفردات عربية متّسقة (مثلاً "تسجيل الدخول" بدلاً من "تسجيل دخول")
- **Tailwind 4** يدعم RTL تلقائياً عبر `:dir(rtl)` selectors

---

## 10. المراقبة والقابلية للتشخيص

| الأداة | الاستخدام | الإعداد |
|---|---|---|
| **Sentry** | Errors + Performance + Replay | `sentry.{client,server,edge}.config.ts` |
| **Langfuse** | LLM traces + cost tracking + prompt management | `src/lib/observability/langfuse.ts` |
| **OpenTelemetry** | Distributed tracing بين الخدمات | `instrumentation.ts` |
| **pino** | Structured JSON logs | يُحوَّل إلى pino-pretty محلياً |
| **Vercel Analytics** | Web Vitals (LCP/FID/CLS/TTFB) | `app/api/analytics/vitals/route.ts` |
| **Custom Mission Control** | Dashboard في `/admin/mission-control` | يعرض cost rollups + LLM drift + TTFV (Time-To-First-Value) |

---

## 11. المهام المجدولة (Cron Jobs على Vercel)

(`vercel.json → crons`)

| المسار | الجدولة | الوظيفة |
|---|---|---|
| `/api/cron/red-team` | 02:00 يومياً | اختبارات هجومية عشوائية على الوكلاء |
| `/api/cron/consolidate-skills` | 03:00 يومياً | دمج المهارات المكتسبة في `skills/` |
| `/api/cron/health-probe` | 01:00 يومياً | فحص صحّة الـ sidecars + Firebase |
| `/api/cron/firestore-backup` | 04:00 يومياً | نسخة احتياطية من Firestore لـ Cloud Storage |
| `/api/cron/aggregate-costs` | 05:00 يومياً | تجميع `cost_events` → `cost_rollups_daily` |

محمية بـ `CRON_SECRET` (header `Authorization: Bearer ...`).

---

## 12. النشر (Deployment)

### Vercel (الإنتاج الرئيسي)
- `vercel.json` يضبط `NODE_OPTIONS=--max-old-space-size=8192` للبناء
- Cron jobs على Vercel scheduler (انظر §11)
- المنطقة: **iad1** (Washington DC) — `vercel build` على 2 cores / 8GB
- **مهم**: `next.config.ts → typescript.ignoreBuildErrors=true` لتجاوز bug معروف في Next.js 16 TS-checker (Maximum call stack size exceeded). الجودة مضمونة عبر `npm run typecheck` (مع `--stack-size=8192`) قبل النشر.

### Replit (تطوير + بيئة احتياطية)
- 5 workflows متوازية: Start app + 4 Python sidecars
- Deployment: `autoscale` · build: `npm run build` · run: `node ./dist/index.cjs`
- Post-merge script في `.local/scripts/post_merge_setup.sh`

---

## 13. القيود الحالية والـ TODOs

### قيود معروفة
1. **Passkeys**: API routes موجودة لكن ترجع `501` (لم تُنفَّذ)
2. **`cacheComponents` معطّل** في `next.config.ts` — يتعارض مع `runtime = 'nodejs'` المطلوب لـ Firebase Admin SDK
3. **TS-checker stack overflow** في Next.js 16 build (محلول حالياً عبر `ignoreBuildErrors: true`)
4. **PDF عربي معقّد** (جداول، أعمدة، صور): pdf-worker يحتاج تحسين للـ layout RTL
5. **Temporal**: البنية موجودة في `src/lib/temporal/` لكن مستخدمة فقط لـ `replayDlq` — غير مفعّلة للـ workflows طويلة الأمد
6. **Web-LLM** (`@mlc-ai/web-llm`): تجريبي لتشغيل نماذج صغيرة في المتصفح (offline mode)
7. **TTFB في dev mode** عالي (~1100ms) بسبب Turbopack HMR — في الإنتاج يكون < 200ms
8. **Sentry source maps**: لا تُرفع تلقائياً (يحتاج `SENTRY_AUTH_TOKEN` في CI)

### مسارات تطوير مخطّطة
- نقل المسارات Edge-friendly إلى Edge runtime (الآن معظمها Node بسبب Firebase Admin)
- تفعيل Vercel Edge Config للـ feature flags
- استبدال `mem0ai` بحلّ داخلي خفيف عند تجاوز 100K مستخدم
- WhatsApp + Telegram bots (الـ webhooks موجودة، الـ orchestrator يحتاج توسعة)
- Mobile app via Capacitor (`src/mobile-app/` placeholder)

---

## 14. أسئلة تستحق البحث المعمّق

> **هذه الأسئلة موجّهة لأي أداة بحث خارجية تقيّم المشروع. أرجو إعطاء توصيات مدعومة بمصادر/مقارنات.**

### 14.1 الأداء
1. هل **Turbopack** في Next.js 16 production-ready لمشروع بهذا الحجم (107 صفحة)، أم الأفضل العودة لـ Webpack؟
2. ما الأثر الفعلي لتفعيل **React Compiler** (RC في React 19) على bundle size + runtime perf؟
3. **TanStack Query + persistQueryClient**: هل localStorage أنسب أم IndexedDB لـ ~30K سطر cache؟
4. هل يجدر استبدال **Motion** بـ **CSS animations + View Transitions API** لتقليل JS؟ ما تأثير ذلك على Three.js scenes؟
5. **bundle analyzer**: ما أثقل 5 dependencies حالياً وما البدائل الأخفّ؟

### 14.2 معماريّة الـ AI
6. **Hybrid Model Routing**: هل هناك دراسات تُقارن Tier-based routing (المعتمَد حالياً) بـ **adaptive routing** (تعلّم اختيار النموذج من تغذية راجعة)؟
7. **Panel of Experts (Council)**: هل LangGraph أفضل من **AutoGen** أو **CrewAI** لهذا النمط في 2026؟
8. **mem0ai vs LangMem vs custom Postgres+pgvector**: ما أنسب حلّ ذاكرة طويلة المدى لـ 100K مستخدم بميزانية محدودة؟
9. **RAG**: hybrid search (BM25+vector) — هل **ColBERT/ColPali** يعطي قفزة جودة كافية تُبرّر تكلفة الإنفر؟
10. **Context Quarantine** ضدّ prompt injection: هل هناك أنماط أحدث من فصل system/user/document في 2026 (مثل **Spotlighting** من Microsoft)؟
11. **Self-Evolution Loop**: ما أفضل ممارسة لتجنّب **catastrophic forgetting** و**reward hacking** في skill consolidation؟

### 14.3 البنية التحتية والـ Cost
12. **Firebase/Firestore vs Convex vs Supabase vs Neon+Drizzle** لـ AI app بهذه المتطلبات (real-time, RLS, low-cost reads)؟
13. **Vercel** vs **Cloudflare Workers + D1 + R2** vs **Fly.io** للنشر الإجمالي — مقارنة TCO عند 10K MAU؟
14. **Python sidecars**: هل الأفضل دمجها كـ **Cloudflare Workers + WASM** أم تركها FastAPI على Cloud Run؟
15. **Vector DB**: Qdrant vs Weaviate vs Turbopuffer vs pgvector — أيّها يدعم Arabic embeddings (384d) بأفضل recall@10؟
16. **LLM Cost Optimization**: ما متوسط الـ savings من **Gemini Context Caching** في حالة استخدامنا (system prompts ثابتة + RAG context متغيّر)؟

### 14.4 الأمان
17. **Firebase Auth**: هل هناك مخاوف 2026 حول WebAuthn/Passkeys integration؟ هل **Stack Auth** أو **WorkOS** أفضل للسوق العربي؟
18. **Stripe + Fawry** على نفس واجهة Checkout: ما أفضل ممارسة UX (دفع موحّد بدون تشتيت)؟
19. **CSP**: نستخدم `unsafe-inline` للـ styles — هل يمكن استبداله بـ **nonces** بدون كسر Tailwind 4 + Motion؟
20. **PDPL مصري** vs **GDPR**: ما الفروق العملية في حقوق المستخدم (export/delete/portability) التي يجب تطبيقها؟

### 14.5 تجربة المطوّر والجودة
21. هل **Vitest 4** أسرع من **Bun test** لمشروع بهذا الحجم؟
22. **`npm run typecheck` يحتاج `--stack-size=8192`** — هل ترقية لـ TS 5.8+ أو استخدام **Tsgolint** يحلّ المشكلة جذرياً؟
23. نظام QA المخصّص (Playwright + 7 فاحصين) — هل يمكن استبداله/تكميله بـ **Lighthouse CI + Pa11y + Storybook test-runner**؟
24. **AGENTS.md** كعقد لوكلاء الـ AI الذين يحرّرون الكود: هل هناك معايير أحدث (`.cursorrules`, `.windsurfrules`, `.aiderconfig`) يجب توحيدها؟

### 14.6 الاستراتيجية الفنية
25. متى يجدر بنا الانتقال من **monorepo بسيط** إلى **Turborepo/Nx** بالنظر لحجم 64K سطر؟
26. **Next.js 16 → 17** عند صدوره: ما المخاطر الحالية في الترقية؟ (Server Actions stability, Cache, Partial Pre-rendering)
27. هل نحتاج **Edge Workers** فعلياً، أم Node على Vercel كافٍ نظراً لـ Firebase Admin SDK requirements؟
28. **Multi-region deployment** للسوق العربي: Vercel `iad1` vs `fra1` (Frankfurt) — هل latency فرق جوهري للمستخدم المصري؟

---

## 15. كيفية التشغيل المحلي (Quickstart)

```bash
# 1. اعتماديّات الـ Node
npm install

# 2. اعتماديّات الـ Python (لكل sidecar)
cd services/pdf-worker && pip install -r requirements.txt && cd -
cd services/egypt-calc && pip install -r requirements.txt && cd -
cd services/llm-judge && pip install -r requirements.txt && cd -
cd services/embeddings-worker && pip install -r requirements.txt && cd -

# 3. متغيّرات البيئة
cp .env.example .env.local
# املأ القيم: Firebase, GOOGLE_GENERATIVE_AI_API_KEY, Stripe, Fawry, Sentry…

# 4. تشغيل الكل (5 خدمات متوازية)
npm run dev                       # Next.js على :5000
npm run pdf-worker:dev            # :8000
npm run egypt-calc:dev            # :8008
npm run llm-judge:dev             # :8080
npm run embeddings-worker:dev     # :8099

# 5. التحقّق
npm run typecheck && npm run lint && npm run test
npm run qa:smoke                  # اختبار جودة شامل (4 صفحات)
```

---

## 16. مراجع داخلية مفيدة

| الملف | المحتوى |
|---|---|
| `AGENTS.md` | عقد إلزامي لكل وكيل AI يحرّر الكود (Cursor, Replit Agent, Claude Code…) |
| `replit.md` | سجل تغييرات داخلي + قرارات معمارية |
| `CHANGELOG.md` | سجل تغييرات للمستخدم النهائي |
| `docs/RUNBOOK.md` | إجراءات الاستجابة للحوادث |
| `docs/THREAT_MODEL.md` | تحليل تهديدات STRIDE |
| `docs/decisions/*.md` | ADRs لكل قرار معماري كبير |
| `qa/reports/*.html` | تقارير QA الأخيرة |

---

**نهاية الملف.** أي أداة بحث تقرأ هذا المستند يجب أن تستطيع: (1) فهم المنتج وجمهوره، (2) معرفة كل التقنيات والإصدارات، (3) تحديد نقاط التحسين المحتملة، (4) إعطاء توصيات مدعومة بمقارنات بناءً على أسئلة §14.
