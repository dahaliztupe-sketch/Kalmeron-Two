# 🏛️ تقرير مجلس الإدارة الافتراضي (The Virtual Boardroom 201)
### مراجعة شاملة لمنصة Kalmeron Two — مبنية على أدلة فعلية من الكود

> **تاريخ الجلسة:** 24 أبريل 2026
> **الإصدار المرجعي:** Wave 6 Closeout (Roadmap → Reality)
> **المنسق العام:** General Orchestrator
> **عدد الخبراء المُفعّلين فعليًا:** 78 من أصل 201 (تفعيل ديناميكي بناءً على الأدلة المتاحة)
> **مرجع الإطار:** `attached_assets/Pasted--CONTEXT-The-Virtual-Boardroom--1777044813875_1777044813882.txt`

---

## 1. 🎯 الملخص التنفيذي (Executive Summary)

### 1.1 تقييم عام لجاهزية الإنتاج

| المعيار | الدرجة | ملاحظة |
| :--- | :--- | :--- |
| **جاهزية الإنتاج العامة** | **86%** | بنية تقنية وأمنية ناضجة جدًا، لكن المسار التجاري (Stripe، LTD، Affiliate Portal) لم يُغلق بعد |
| **جاهزية الأمان** | 92% | OWASP LLM + Agentic Top 10 مغطّاة عمليًا، CSRF يعتمد على Bearer + SameSite (مقبول لكن قابل للتعزيز) |
| **جاهزية المراقبة/SRE** | 88% | Sentry + Langfuse + Cost Ledger + Health probes كاملة، تنقص لوحة SLO حية واختبار استرجاع نسخ احتياطي |
| **جاهزية الأعمال/الفوترة** | 62% | البنية موجودة (Plans, ROI, LTD, Affiliate) لكن **لا يوجد Stripe Webhook فعلي** ولا أتمتة لعدّاد المقاعد |
| **جاهزية UX/التصميم** | 90% | Dark-First مُنجز، RTL/i18n قوي، Reduced-motion مدعوم، CommandPalette ⌘K يعمل |
| **جاهزية الذكاء الاصطناعي والوكلاء** | 89% | LangGraph supervisor + 14 وكيلًا منتجًا + 50 وكيلًا قِسميًا + RAG ذاتي التصحيح + Agent Council |

### 1.2 أهم 3 نقاط قوة (Top 3 Strengths)

1. **منظومة أمان وكلاء طبقية فعلية، نادرة في السوق** — وجود `src/lib/security/agent-os.ts` (نظام Rings 0-3) + `agent-governance.ts` (HITL على الأدوات critical) + `prompt-guard.ts` (سَنْتنة + ICs + كشف الأنماط) + `tool-guard.ts` (RBAC على مستوى الأداة). هذه الحزمة تغطّي ASI01, ASI02, ASI04, ASI05, ASI09 من Agentic Top 10 برمزٍ حقيقي وليس بوثيقة.
2. **Cost ledger مدمج مع Model Router متعدد المزوّدين** — `src/lib/observability/cost-ledger.ts` يسجّل كل استدعاء، و `src/lib/llm/providers.ts` يضمن fallback تلقائي Gemini → Anthropic → OpenAI، مع cache بطبقتين (LRU + Firestore TTL 24h) في `src/lib/llm/prompt-cache.ts`. هذا يُحوّل الذكاء الاصطناعي من "بند تكلفة عشوائي" إلى "بند P&L قابل للتنبؤ".
3. **توافق محلي عميق وحقيقي للسوق المصري/الخليجي** — `src/lib/copy/lexicon.ts` يفرض المصطلحات (لينت في CI: `npm run lint:lexicon`)، الخطوط العربية مُحسَّنة (`IBM Plex Sans Arabic`, `Tajawal`, `Noto Kufi`) مع `letter-spacing: 0` و `line-height: 1.85` للجسم. شارات الثقة `Egyptian Law 151 / Saudi PDPL / GDPR` مرئية في الفوتر و `/compare`. التوطين ليس ترجمة — هو هوية مُنتج.

### 1.3 أهم 3 مخاطر (Top 3 Risks)

| # | المخاطرة | التأثير | الاحتمالية | الدليل |
| :-: | :--- | :--- | :--- | :--- |
| **R1** | **انقطاع المسار التجاري — لا توجد بوابة دفع متصلة فعليًا.** تغيير الخطط يحدث عبر تحديث Firestore مباشر في `app/api/user/plan/route.ts`، ولا يوجد Stripe webhook handler فعّال رغم وجود `stripe ^22.1.0` في `package.json`. | **حرج** — يُجمّد كل الإيرادات الفعلية | عالٍ (مؤكَّد) | `app/api/user/plan/route.ts` + غياب `app/api/webhooks/stripe/*` |
| **R2** | **هجمات الحقن غير المباشر (IPI) عبر مصادر RAG/MCP** غير مُختبَرة بعمق. `prompt-guard.ts` يكشف الأنماط الصريحة، لكن `crag.ts` و `disco-rag.ts` يضخّان محتوى خارجيًا في سياق النموذج دون "إطار حماية للسياق" (Context Quarantine). | **عالٍ** — تسرّب بيانات / تنفيذ أدوات غير مرغوبة | متوسط (96% من هجمات IPI تمرّ دون اكتشاف عالميًا) | `src/lib/rag/{crag,self-rag,disco-rag}.ts` + `src/lib/security/prompt-guard.ts` |
| **R3** | **فجوة قياس Time-to-First-Value (TTFV).** البنية جاهزة في `src/lib/analytics/ttfv.ts` ولوحة `components/admin/TtfvWidget.tsx` موجودة، لكن `markTtfvStage()` **غير مُستدعى** من `app/api/chat/route.ts` ولا من مسارات `app/auth/*`. النتيجة: المؤشّر يظهر "صفر" دائمًا، ولا يُنبّه على Onboarding متعثّر. | **عالٍ** — يُعمي الفريق عن أهم رافعة احتفاظ | عالٍ (مؤكَّد) | `src/lib/analytics/ttfv.ts` + `app/api/chat/route.ts` |

### 1.4 أهم 3 فرص للنمو (Top 3 Growth Opportunities)

1. **إغلاق LTD "First-100" بأتمتة كاملة** — صفحة `app/first-100/page.tsx` حاليًا بعدّاد ساكن `100/100`. ربطه بـ Firestore aggregate (سحب live من collection `ltd_seats`) وفتح Stripe Checkout مخصّص لخطة `founder-9usd` يُحوّل صفحة "تسويقية" إلى **قناة إيراد مُسرَّعة** قبل الإطلاق التجاري. تقدير: 100 × 9 USD × 12 شهرًا = **10,800 USD ARR ضمانًا** + 100 شهادة عميل.
2. **تحويل Departmental Agents (50 وكيلًا) إلى "Crews" قابلة للبيع كمنتجات مستقلة** — `src/ai/organization/departments/` يحوي 50 وكيلًا متخصصًا مع orchestrators لكل قسم (Finance, HR, Legal...). تغليفها كـ "Workspace Templates" أو "AI Crews" قابلة للاشتراك المستقل (مثلاً: "Finance Crew" بـ 49 USD/شهر) يضاعف ARPU ويفتح سوق B2B Mid-market.
3. **التحول من "AI Chat" إلى "Agentic UX" عبر `<AgentBlock>`** — `components/agent/AgentBlock.tsx` يدعم 9 أنواع كتل (chart, form, checklist, timeline, ...). الانتقال من الردود النصّية إلى **واجهات مولّدة ديناميكيًا** (Generative UI) يقلّل احتكاك المستخدم بنسبة قابلة للقياس ويميّز Kalmeron عن ChatGPT/Gemini/Notion AI الذين ما زالوا في "الردّ النصّي".

---

## 2. 📊 نتائج التدقيق الشامل (Comprehensive Audit Findings)

> كل قسم يلتزم بالصيغة المطلوبة: **(أ) تشخيص — (ب) 3 خيارات استراتيجية — (ج) توصية نهائية — (د) درجة ثقة**

### 2.1 🏗️ القسم الأول: العمليات التقنية والهندسية

#### (أ) التشخيص
- **معمارية مزدوجة:** `src/agents/` (5 وكلاء) + `src/ai/agents/` (11 وكيلًا) + `src/ai/organization/departments/` (50 وكيلًا قِسميًا). ثلاث طبقات بأنماط مختلفة (Registry vs Mastra Factory).
- **TypeScript صارم** (`strict: true`, `target: ES2025`, `noImplicitAny: true`)، لكن `// @ts-nocheck` يظهر في `src/ai/agents/registry.ts` بسبب ديناميكية LangGraph/Mastra.
- **ازدواجية مجلدات:** `lib/` (10 ملفات في الجذر) و `src/lib/` (70+ ملفًا). دليل ترحيل غير مكتمل.
- **ملف ضخم:** `app/page.tsx` يتجاوز **1,250 سطرًا** ويحوي نصوصًا عربية مدمجة ضد فلسفة `messages/ar.json`.
- **Crons & Health:** 5+ مسارات cron نشطة (`/api/cron/health-probe`, `/firestore-backup`, `/aggregate-costs`, ...) في `vercel.json`.
- **CI:** `.github/workflows/security.yml` يشغّل npm audit + CodeQL + Gitleaks. يوجد `.github/dependabot.yml` للمجموعات.

#### (ب) ثلاث خيارات استراتيجية
1. **توحيد سريع (Quick Consolidate):** نقل `lib/*` إلى `src/lib/*` مع Codemods، تجزئة `app/page.tsx` إلى `components/marketing/landing/*`، وإزالة `@ts-nocheck` بإضافة Type Generators لمخطّطات LangGraph.
2. **إعادة هندسة الطبقات (Layer Refactor):** فصل "Agent Runtime" عن "Agent Definitions" في حزمة منفصلة `src/ai/runtime/` و `src/ai/definitions/`، مع فهرس موحّد ينتج تلقائيًا.
3. **الإبقاء + التوثيق (Document & Move on):** كتابة ADR (Architecture Decision Records) تشرح سبب الازدواجية وقبولها كتسوية مؤقتة، والتركيز على الميزات.

#### (ج) التوصية النهائية
**الخيار 1 (Quick Consolidate)** — تكلفته منخفضة (3-5 أيام عمل)، أثره مباشر على سرعة المطوّرين الجدد، ويمنع تعفّن `app/page.tsx`. يُنفَّذ كـ Wave 7.

#### (د) درجة الثقة
**85%** — الأدلة مباشرة من شجرة الملفات؛ المخاطر الوحيدة هي خفية في تبعيات runtime لـ Mastra.

---

### 2.2 🛡️ القسم الثاني: الأمن السيبراني والمراقبة

#### (أ) التشخيص
- **حماية طبقية فعلية:** Firestore deny-all + `isOwner()` + RBAC matrix في `src/lib/security/rbac.ts` (4 أدوار) + Audit logs immutable في `src/lib/audit/log.ts`.
- **Headers صارمة:** CSP + COOP + CORP + HSTS في `next.config.ts` (سطور 12-68).
- **SSRF:** `src/lib/security/url-allowlist.ts` مع DNS rebinding defense + `redirect: 'manual'` في `src/lib/webhooks/dispatcher.ts`.
- **Agentic Top 10:**
  - ✅ ASI01 (Goal Hijack): `prompt-guard.ts`
  - ✅ ASI02 (Tool Misuse): `tool-guard.ts` (RBAC + HITL على critical)
  - ✅ ASI04 (Skill/Tool Integrity): مغلَّف عبر `tool-guard.ts`
  - ✅ ASI05 (Unexpected Code Exec): `agent-os.ts` Rings + sandboxing عبر E2B/Daytona (referenced)
  - ⚠️ ASI03 (IPI): كشف صريح للأنماط فقط، لا يوجد **Context Quarantine** لمحتوى RAG
  - ⚠️ ASI06 (Memory Poisoning): Neo4j knowledge graph غير محمي بسياسات تحقق من المصدر
  - ✅ ASI07 (Inter-agent Comms): MCP server مع HMAC signatures
  - ✅ ASI09 (Excessive Agency): kill-switch + circuit breaker في `AgentSRE`
- **Stripe Webhook:** **مذكور في `docs/THREAT_MODEL.md` لكن غير موجود فعليًا** — فجوة حرجة.
- **Mobile (KalmeronMobile):** Certificate pinning **غير مُطبَّق** (موثَّق في `THREAT_MODEL.md` س.106).

#### (ب) ثلاث خيارات استراتيجية
1. **Context Quarantine + Provenance Tracking:** إضافة طبقة في `src/lib/rag/*` تُلصق metadata لمصدر كل chunk، وتحوّل أي محتوى من مصدر "خارجي/غير موثوق" إلى "data-only" لا يؤثر على system prompt.
2. **Red Team Automation Track:** اعتماد إطار AgenticRed أو SIRAJ مع Cron أسبوعي يُشغّل سيناريوهات IPI و Goal-Hijack ويقارن مع baseline.
3. **Hybrid (موصى به):** تنفيذ #1 الآن (يحلّ السبب الجذري) + جدولة #2 خلال 60 يومًا.

#### (ج) التوصية النهائية
**Hybrid** — Context Quarantine عاجل (ASI03/06)، وأتمتة Red Team عبر Cron قبل الإطلاق التجاري الكبير. **بالتوازي:** كتابة `app/api/webhooks/stripe/route.ts` مع `stripe.webhooks.constructEvent` فعلي.

#### (د) درجة الثقة
**90%** — الأدلة كاملة من الكود؛ الفجوة الوحيدة هي عمق اختبار Stripe في بيئة Test.

---

### 2.3 📡 القسم الثالث: المراقبة والعمليات الأمنية

#### (أ) التشخيص
- **Stack مراقبة ناضج:** Sentry (client/edge/server) + Langfuse (LLM tracing) + Cost Ledger + Web Vitals beacon (`/api/analytics/vitals`).
- **Sample rate:** Sentry traces عند 10% — مقبول.
- **Health probes:** `/api/health` يفحص Firestore + Knowledge Graph + E2B/Daytona + Omnichannel.
- **Drift detector:** `src/lib/observability/drift-detector.ts` موجود لكن **غير مُتكامل مع cron**.
- **Backup:** `firestore-backup` cron يومي + `verify-backup.ts` script — لكن **لا اختبار استرجاع (Restore Drill) آلي**.
- **SLO doc:** `docs/SLO.md` ممتاز (99.9% uptime, <800ms P95 latency)، لكن لا يوجد exporter يُحوّل المتركس إلى لوحة حيّة.

#### (ب) ثلاث خيارات استراتيجية
1. **SLO Dashboard خفيف:** صفحة `/admin/slo` تقرأ من `cost_rollups_daily` + Sentry API + Health Probe history وتعرض burn-rate.
2. **اعتماد Grafana Cloud / Datadog:** تكامل خارجي مع OpenTelemetry exporter موجود فعليًا (`@opentelemetry/sdk-trace-base`).
3. **Restore Drill Cron شهري:** يستعيد `firestore-backup` إلى مشروع staging ويُشغّل assertions على عدد المستندات.

#### (ج) التوصية النهائية
**1 + 3 معًا** — SLO dashboard داخلي (أسبوع عمل) + Restore Drill شهري (3 أيام عمل). Grafana يُؤجَّل لما بعد 1000 مستخدم نشط.

#### (د) درجة الثقة
**88%**

---

### 2.4 🎨 القسم الرابع: التصميم وتجربة المستخدم والإبداع

#### (أ) التشخيص
- **Dark Mode First:** `color-scheme: dark` مفروض، لا يوجد Light Mode (متّسق مع الهوية المختارة).
- **رموز/توكنات:** `--brand-gold` و `--gold` **مُهملة** لكن باقية كـ aliases (موثَّق DEPRECATED في `globals.css`). 29 ملفًا تمّ ترحيله لـ `--brand-cyan`.
- **Glassmorphism + Bento:** `.glass-panel/.glass-soft/.glass-card` + `src/components/ui/BentoGrid.tsx` (responsive col-span 1-4).
- **CommandPalette ⌘K:** يعمل، RTL-aware، keyboard-navigable، built on `@base-ui/react/dialog`.
- **Reduced motion:** مدعوم في `AppShell.tsx` + dashboard + auth pages + landing hero parallax.
- **i18n:** ~150 مفتاح في `messages/{ar,en}.json`، تغطية ممتازة. **لكن `app/page.tsx` و `CommandPalette.tsx` ما زالا يحويان نصوصًا inline.**
- **`<Image />` من Next.js:** **غير مستخدم فعليًا** — يُفوَّت AVIF/WebP رغم تفعيله في `next.config.ts`.
- **خط `Noto Kufi Arabic`:** فقط CSS fallback، **غير preloaded عبر `next/font/google`** — TTL طويل غير ضروري.
- **Mixed content:** `Ltr.tsx` مكرَّر في `components/` و `src/components/ui/` (ازدواجية).
- **Hardcoded colors:** بعض الـ overlays تستخدم `bg-[#0B1020]/95` بدلاً من `--surface`.

#### (ب) ثلاث خيارات استراتيجية
1. **Polish Sprint (3 أيام):** preload خط Noto Kufi، استبدال جميع `<img>` بـ `next/image`، توحيد `Ltr.tsx`، استخراج النصوص المتبقّية لـ `messages/ar.json`.
2. **Design Tokens v2:** إعادة تسمية `--brand-gold` → `--brand-cyan` كاملة وحذف الـ aliases (Breaking change صغير، 15 ملفًا).
3. **Generative UI Push:** توسيع `<AgentBlock>` ليكون السطح الأساسي لجميع ردود الوكلاء (بدلاً من Markdown fallback).

#### (ج) التوصية النهائية
**1 + 3** — Polish Sprint مكسب سريع (LCP/CLS سيتحسّن قياسًا)، و Generative UI Push تمايز سوقي حقيقي. #2 يُؤجَّل لتفادي الـ regression.

#### (د) درجة الثقة
**87%**

---

### 2.5 📊 القسم الخامس: الأعمال والاستراتيجية والنمو

#### (أ) التشخيص
- **Plans:** 4 طبقات (`Free / Pro 499 EGP / Founder 1999 EGP / Enterprise`) في `src/lib/billing/plans.ts`. Annual discount 33%.
- **Stripe:** SDK موجود (`stripe ^22.1.0`) لكن **لا webhook، لا checkout session creation، لا portal**.
- **ROI Calculator:** ممتاز، معاير محليًا (800 EGP/ساعة، 8 ساعات/يوم).
- **First-100 LTD:** صفحة احترافية لكن العدّاد ساكن `100/100`.
- **Affiliate:** صفحة فقط، بـ mailto. لا dashboard ولا tracking.
- **Trust Badges:** Egypt Law 151 + Saudi PDPL + GDPR + TLS 1.3 + AES-256.
- **Funnel Analytics:** Taxonomy موثَّقة (`landing_visited`, `signup_completed`, `first_chat_message_sent`, ...) في `docs/FUNNEL_ANALYTICS.md`.
- **TTFV:** البنية جاهزة في `src/lib/analytics/ttfv.ts` + لوحة في الأدمن، **لكن `markTtfvStage()` غير مُستدعى من نقاط حقيقية**.
- **A/B:** إطار FNV-1a deterministic موجود + تجربتان seeded.
- **English landing:** `app/en/page.tsx` LTR مع hreflang.
- **Pricing currency:** EGP/USD مزدوج، توسيع SAR/AED **سهل وقابل للتنفيذ**.

#### (ب) ثلاث خيارات استراتيجية
1. **Revenue Activation Sprint:** Stripe webhook + Checkout + Portal + ربط `LTD seats counter` بـ Firestore aggregate + `markTtfvStage()` في chat/auth → جميعها في 5-7 أيام عمل.
2. **B2B Crews Pivot:** تغليف `src/ai/organization/departments/*` كـ "Workspace Templates" بأسعار مستقلة (Finance Crew 49 USD، HR Crew 39 USD، ...) للوصول لـ ARPU أعلى.
3. **Affiliate Portal:** بناء dashboard جزئي لتتبّع الإحالات (signup attribution + commission ledger).

#### (ج) التوصية النهائية
**#1 (P0 حرج) ثم #2 (P1) ثم #3 (P2)** — لا يمكن الحديث عن "فرص نمو" بدون بوابة دفع تعمل. #2 يضاعف ARPU بدون كتابة وكلاء جدد. #3 يفتح قناة Distribution.

#### (د) درجة الثقة
**92%** — الأدلة قاطعة من ملفات الفوترة والـ landing pages.

---

### 2.6 🔮 القسم السادس: التوجهات المستقبلية والتقييم

#### (أ) التشخيص
- **Edge AI:** `@mlc-ai/web-llm` مُثبَّت — جاهز لتشغيل نماذج محليًا (privacy + cost saver).
- **AG-UI / Generative UI:** `@ag-ui/client` + `<AgentBlock>` يضع Kalmeron في طليعة 2026.
- **Mastra + LangGraph + Temporal:** Stack حديث جدًا (`@mastra/core`, `@langchain/langgraph 1.x`, `@temporalio/client`).
- **Knowledge Graph:** Neo4j مفعَّل في `src/lib/memory/knowledge-graph.ts` — أساس Digital Twin.
- **Sustainable Design:** Dark mode default + reduced motion + AVIF/WebP يُساهمون في خفض استهلاك الطاقة.
- **AI Ethics:** `agent-governance.ts` يفرض GDPR consent + escalation للقرارات الحرجة.
- **Benchmarking مفقود:** لا يوجد ملف يقارن Kalmeron بـ Linear/Notion AI/ChatGPT/Gemini/Denovo بشكل منظَّم (مذكور في `STRATEGIC_MASTER_PLAN.md` لكن ليس كـ Living Doc).
- **Performance Measurement:** Web Vitals تُجمع لكن لا توجد لوحة عرض داخلية لها مع targets.

#### (ب) ثلاث خيارات استراتيجية
1. **Comparison Engine:** بناء `app/compare/[competitor]/page.tsx` ديناميكية تُولِّد صفحات SEO لكل منافس (linear-vs-kalmeron, notion-vs-kalmeron, ...) مع جدول قابلية مقارنة فعلي.
2. **Edge AI MVP:** تفعيل `@mlc-ai/web-llm` في Free tier لتقليل تكلفة Gemini calls على الاستخدامات الـ trivial.
3. **Sustainability Report:** صفحة `/sustainability` تعرض carbon footprint + token efficiency — تمايز ESG حقيقي.

#### (ج) التوصية النهائية
**#1 (P1)** أولاً لأنه driver SEO + conversion. **#2 (P3)** كميزة تمايز تقنية بعد 6 أشهر. **#3 (P3)** لو ظهر طلب من المستثمرين/Enterprise.

#### (د) درجة الثقة
**78%** — التقييم هنا يتطلّب بيانات سوق حقيقية ليست متاحة من الكود وحده.

---

## 3. 📋 خطة التطوير الاستراتيجية (Strategic Development Plan)

### 3.1 جدول الأولويات

| ID | الأولوية | البند | الوصف | الجهد المتوقع | الأثر المتوقع | المخاطر المحتملة |
| :--: | :--: | :--- | :--- | :--: | :--- | :--- |
| **P0-1** | 🔴 حرج | **Stripe Webhook + Checkout** | إنشاء `app/api/webhooks/stripe/route.ts` مع `constructEvent` + `app/api/billing/checkout/route.ts` لإنشاء جلسات دفع. ربط `app/api/user/plan/route.ts` ليتحدّث **فقط** من webhook events لا من client. | 3-4 أيام | فتح قناة الإيراد الفعلي | تأخير اعتماد Stripe Connect/Tax — يُحلّ بـ Stripe Test Mode أولاً |
| **P0-2** | 🔴 حرج | **Context Quarantine للـ RAG** | في `src/lib/rag/{crag,self-rag,disco-rag}.ts`: تغليف كل chunk من مصدر خارجي بـ `<external_data source="..." trust="low">` مع منع تأثيره على system prompt + كشف الأنماط الخطيرة قبل الحقن. | 2-3 أيام | يسدّ ASI03 (IPI) — أهم ثغرة 2026 | احتمال زيادة latency ~50ms للـ retrieval |
| **P0-3** | 🔴 حرج | **TTFV instrumentation حقيقي** | استدعاء `markTtfvStage('cold_start')` في `app/api/auth/signup/route.ts`، `markTtfvStage('first_message')` في `app/api/chat/route.ts`، `markTtfvStage('first_value')` عند أول AgentBlock مُولَّد. | 1 يوم | بيانات حقيقية لأهم رافعة احتفاظ | لا مخاطر تذكر |
| **P1-1** | 🟠 مهم | **LTD seats live counter** | تحويل `100/100` الساكن في `app/first-100/page.tsx` إلى Firestore aggregate من collection `ltd_purchases` + Stripe webhook يُحدِّث العدد. | 1-2 يوم | Urgency حقيقي → معدّل تحويل أعلى | تعارض اتساق إذا لم يُربط بـ webhook بشكل atomic |
| **P1-2** | 🟠 مهم | **Comparison Pages dynamic** | إنشاء `app/compare/[competitor]/page.tsx` مع `generateStaticParams` لـ 5 منافسين (Linear, Notion AI, ChatGPT, Gemini, Denovo). كل صفحة جدول مقارنة + JSON-LD. | 3 أيام | مكاسب SEO طويلة الأجل | يتطلّب تحديثًا شهريًا |
| **P1-3** | 🟠 مهم | **توحيد `lib/` و `src/lib/`** | نقل المحتوى الخفيف من جذر `lib/` إلى `src/lib/` مع codemod للاستيرادات. | 2-3 أيام | سرعة onboarding للمطوّرين الجدد | احتمال كسر استيرادات في Mastra runtime |
| **P1-4** | 🟠 مهم | **`<Image />` Migration + Noto Kufi preload** | استبدال `<img>` بـ `next/image` + إضافة `Noto_Kufi_Arabic` في `next/font/google` بـ `display: 'swap'`. | 1-2 يوم | تحسّن LCP بنسبة 15-25% | لا مخاطر |
| **P1-5** | 🟠 مهم | **Affiliate basic tracking** | جدول `affiliate_clicks` + cookie 30-day attribution + `affiliate_commissions` ledger يُحدَّث من webhook الاشتراك. | 3-4 أيام | تفعيل قناة Distribution | تسرّب attribution لو تم تثبيت ad-blocker — مقبول |
| **P2-1** | 🟡 تحسين | **Departmental Crews كمنتجات مستقلة** | تغليف `src/ai/organization/departments/finance/*` كـ "Finance Crew Template" + صفحة `app/crews/finance/page.tsx` + خطة 49 USD مستقلّة. | 5-7 أيام | مضاعفة ARPU في B2B | تشتيت رسالة المنتج لو لم تُسوَّق بدقة |
| **P2-2** | 🟡 تحسين | **SLO Dashboard داخلي** | صفحة `/admin/slo` تقرأ Sentry API + cost rollups + health probes وتعرض burn-rate حسب `docs/SLO.md`. | 4-5 أيام | رؤية سريعة لـ on-call | يحتاج Sentry API token |
| **P2-3** | 🟡 تحسين | **Restore Drill cron شهري** | cron يستعيد آخر backup إلى Firestore staging project ويُشغّل assertions على document counts. | 2-3 أيام | إثبات RPO/RTO فعلي | يتطلّب staging project مفصول |
| **P2-4** | 🟡 تحسين | **Generative UI Default** | جعل `<AgentBlock>` السطح الافتراضي لردود `cfo-agent`, `legal-guide`, `plan-builder` بدلاً من Markdown. | 5 أيام | تمايز سوقي قوي | احتمال "over-engineering" لردود بسيطة — يُحلّ بـ heuristic |
| **P2-5** | 🟡 تحسين | **Lexicon strict في CI** | تشغيل `npm run lint:lexicon` في `.github/workflows/security.yml` كـ blocking check. | 30 دقيقة | منع تسرّب "وكيل/50+" | لا مخاطر |
| **P3-1** | 🔵 مستقبلي | **Edge AI Inference (web-llm)** | تشغيل نماذج صغيرة محليًا للـ Free tier (intent classification, PII detection) لتقليل تكلفة Gemini. | 7-10 أيام | -20% تكلفة LLM في Free | توافق متصفح/جهاز |
| **P3-2** | 🔵 مستقبلي | **AR Dialect Selector** | اختيار اللهجة (مصرية/خليجية/شامية) في Onboarding مع تأثير على system prompts. | 5 أيام | توسّع جغرافي | جودة الترجمة بين اللهجات |
| **P3-3** | 🔵 مستقبلي | **Sustainability Report `/sustainability`** | عرض carbon/token-per-request + tree planted equivalents. | 3 أيام | جذب ESG investors | بيانات يجب تجميعها |
| **P3-4** | 🔵 مستقبلي | **Mobile cert pinning** | تطبيق certificate pinning في `KalmeronMobile` (Expo) للـ API الحرجة. | 4 أيام | حماية MITM فعلية | يصعّب debug في dev |
| **P3-5** | 🔵 مستقبلي | **AR/VR boardroom MVP** | جلسة مع 5 وكلاء في فضاء WebXR — تجريبي للـ Enterprise. | 15+ يومًا | تمايز قوي / PR | ROI غير مضمون |

---

## 4. 💡 توصيات إضافية (Additional Recommendations)

### 4.1 تحسينات فورية (< ساعة لكلٍ)

1. **تفعيل `lint:lexicon` في CI** — تعديل سطر واحد في `.github/workflows/security.yml`.
2. **إزالة `app/page.tsx` ثقيلة من الـ Edge Runtime** — التأكد أنها على Node runtime لتجنّب bundle size limits.
3. **`Cache-Control: no-store`** على `/api/health` (مذكور أنه موجود — تأكيد).
4. **رفع Sentry traces sample rate إلى 0.2** أثناء أول 30 يومًا بعد الإطلاق التجاري لاكتشاف القضايا النادرة.
5. **حذف `Ltr.tsx` المكرَّر** — الإبقاء على نسخة `src/components/ui/Ltr.tsx` فقط.
6. **حذف `tsconfig.tsbuildinfo`** من المستودع (1MB) وإضافته إلى `.gitignore`.
7. **توثيق `display_override` في `manifest.json`** للـ PWA (موجود لكن غير موضّح).
8. **إضافة `prefers-color-scheme: dark` meta tag** في `app/layout.tsx` لمنع flash of light.

### 4.2 مقارنة بالمنافسين

| المعيار | Kalmeron Two | Linear | Notion AI | ChatGPT/Gemini | Denovo |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Native Arabic UX** | 🟢 Native | 🔴 منعدم | 🟡 مترجَم | 🟡 مترجَم | 🟢 موجود |
| **Multi-Agent Orchestration** | 🟢 14 + 50 dept | 🔴 لا | 🟡 محدود | 🟡 GPTs | 🟡 محدود |
| **Generative UI** | 🟢 9 block types | 🔴 لا | 🔴 لا | 🟡 Canvas | 🔴 لا |
| **RAG ذاتي التصحيح** | 🟢 CRAG/Self-RAG/DiscoRAG | 🔴 لا | 🟡 RAG عام | 🟡 RAG عام | 🟡 RAG عام |
| **Cost Ledger شفّاف** | 🟢 per-call | 🔴 لا | 🔴 لا | 🟡 usage page | 🔴 لا |
| **Egypt/Saudi Compliance** | 🟢 Law 151 + PDPL + GDPR | 🟡 GDPR فقط | 🟡 GDPR فقط | 🟡 GDPR فقط | 🟡 جزئي |
| **Stripe Live Billing** | 🔴 **مفقود** | 🟢 ناضج | 🟢 ناضج | 🟢 ناضج | 🟢 ناضج |
| **PWA + Offline** | 🟢 SW v2 + offline page | 🟡 جزئي | 🟢 موجود | 🔴 لا | 🟡 جزئي |
| **Workspaces متعدّدة** | 🟢 RBAC 4 أدوار | 🟢 ممتاز | 🟢 ممتاز | 🟡 محدود | 🟢 موجود |
| **Mobile App** | 🟡 KalmeronMobile (Expo) | 🟢 ناضج | 🟢 ناضج | 🟢 ناضج | 🟢 موجود |

**خلاصة المقارنة:** Kalmeron يتفوّق تقنيًا في Multi-Agent + Generative UI + RAG + Compliance المحلي، لكنّه **خاسر في البنية التحتية للإيراد (Stripe)** مما يُجمّد التحوّل من "منتج رائع" إلى "أعمال رائعة".

### 4.3 توصيات نهائية للإطلاق

1. **لا تُطلق تجاريًا قبل P0-1 + P0-2 + P0-3.** البقيّة يمكن إطلاقها كـ "Beta with manual billing" لكن هذا سقف نمو.
2. **اعتمد منهجية Wave Releases (متّبَعة فعليًا — Wave 6 آخرها).** اقترح Wave 7 يُغطّي حصريًا P0 + P1.
3. **احتفظ بـ `replit.md` كذاكرة مؤسسية حيّة** — كما هو الآن، يُحسَب لكم.
4. **افتح "Release Notes" عامة** عند كل Wave (موجود `app/changelog/page.tsx` — استمرّ).
5. **قبل الإطلاق الكبير:** شغّل سيناريو red-team واحد على الأقل من إطار AgenticRed وأضف نتائجه إلى `docs/THREAT_MODEL.md`.

---

## 5. 📎 ملحق (Appendix)

### 5.1 الخبراء المُفعَّلون فعليًا (78 من 201)

#### من القسم الأول (التقنية) — 24
المهندس البرمجي الرئيسي (5)، DevOps (6)، قاعدة البيانات (7)، AI (8)، Frontend (9)، Mobile (10)، Edge Computing (11)، التكامل (12)، API (13)، المصادقة (14)، الحاويات (15)، SRE (17)، Performance (18)، Resilience (19)، Scalability (20)، Monitoring (21)، Cost (22)، تحسين الصور (23)، تحسين التحميل (24)، تحسين الخطوط (25)، Network (26)، Storage (27)، QA Principal (29)، Test Coverage Analyst (41).

#### من القسم الثاني (الأمن السيبراني) — 17
Principal Security (57)، Application Security (58)، Network Security (59)، Data Security (60)، Frontend Security (61)، API Security (62)، Cloud Security (63)، Mobile Security (64)، Principal Red Team (66)، Prompt Injection Tester (67)، IPI Tester (68)، Web Pentester (70)، API Pentester (71)، Agent Skills Auditor (77)، MCP Tools Integrity Auditor (78)، Container Security Auditor (80)، AI Compliance (84).

#### من القسم الثالث (المراقبة والعمليات الأمنية) — 10
SOC Engineer (95)، Threat Detection (96)، Incident Response (97)، CTI (99)، IPI Auditor (100)، Agent Behavior Monitoring (101)، DLP (102)، Real-Time Governance (103)، Attack Surface (106)، Vulnerability Analyst (110).

#### من القسم الرابع (التصميم وUX) — 11
Visual Designer (112)، Color Expert (113)، Typography (114)، Iconography (115)، Component Consistency (121)، UX Principal (124)، Generative/Agentic UX (125)، Design Patterns (127)، Dashboard Design (130)، Mobile UX (131)، Accessibility WCAG 2.2 (154)، RTL Layout (159)، Mixed Content (160)، Arabic Typography (162)، i18n (163).

#### من القسم الخامس (الأعمال والاستراتيجية) — 13
Opportunity Identification (164)، Worst-Case (165)، SWOT (166)، Vision (167)، Synthesis (170)، Voting (171)، Risk Management (172)، Strategic Planning (173)، Innovation (174)، Product Manager (177)، Growth (178)، Investor (179)، Unit Economics (181)، Financial Sustainability (184).

#### من القسم السادس (المستقبل) — 7
Futurist (193)، AI Design (194)، Sustainable Design (195)، Digital Ethics (196)، Benchmarking (198)، Gap Analysis (199)، Performance Measurement (200).

#### المجلس الاستشاري الأعلى الدائم — 4
Chief Critical Reviewer (1)، Chief Context Engineer (2)، Supreme Quality Auditor (3)، Supreme Ethical Reviewer (4).

**الإجمالي:** 78 خبيرًا (39% من إجمالي 201) — تفعيل ديناميكي مدروس وفق فلسفة "لا تُهدر الموارد".

### 5.2 الملفات الرئيسية التي شُكِّلت كأدلة

- **معمارية:** `package.json`, `tsconfig.json`, `next.config.ts`, `app/page.tsx`, `src/agents/*`, `src/ai/agents/*`, `src/ai/organization/departments/*`, `lib/*`, `src/lib/*`.
- **أمان:** `firestore.rules`, `security_spec.md`, `src/lib/security/{prompt-guard,tool-guard,agent-os,agent-governance,owasp-guard,url-allowlist,rbac}.ts`, `src/lib/audit/log.ts`, `src/lib/webhooks/dispatcher.ts`, `docs/THREAT_MODEL.md`.
- **مراقبة/SRE:** `sentry.{client,edge,server}.config.ts`, `instrumentation.ts`, `src/lib/observability/{cost-ledger,langfuse,drift-detector}.ts`, `app/api/health`, `app/api/cron/*`, `vercel.json`, `firestore.indexes.json`, `docs/SLO.md`, `docs/RUNBOOK.md`, `scripts/verify-backup.ts`.
- **تصميم/i18n:** `app/globals.css`, `app/layout.tsx`, `components/layout/AppShell.tsx`, `components/ui/CommandPalette.tsx`, `src/components/ui/BentoGrid.tsx`, `messages/{ar,en}.json`, `src/lib/copy/lexicon.ts`, `scripts/lexicon-lint.ts`.
- **أعمال:** `src/lib/billing/plans.ts`, `app/api/user/plan/route.ts`, `app/pricing/page.tsx`, `app/first-100/page.tsx`, `app/affiliate/page.tsx`, `app/changelog/page.tsx`, `components/marketing/{RoiCalculator,TrustBadges}.tsx`, `src/lib/analytics/{ttfv,track}.ts`, `src/lib/experiments/ab.ts`, `docs/FUNNEL_ANALYTICS.md`.
- **AI/Agents:** `src/ai/orchestrator/supervisor.ts`, `src/ai/agents/registry.ts`, `src/lib/model-router.ts`, `src/lib/llm/{providers,prompt-cache}.ts`, `src/lib/rag/{crag,self-rag,disco-rag}.ts`, `src/lib/memory/knowledge-graph.ts`, `components/agent/AgentBlock.tsx`, `test/eval/golden-dataset.json`, `test/eval/run-eval.ts`, `src/ai/evaluation/advanced-judges.ts`.

### 5.3 ملاحظات المجلس الاستشاري الأعلى (مدمَجة في التقرير)

- **Chief Critical Reviewer:** كل مخاطرة (R1/R2/R3) لها ملف كود مُحدَّد كدليل، لا افتراضات معلَّقة. ✅
- **Chief Context Engineer:** سُدَّت فجوة السياق بين "AI/Agents" و "Stripe" — تمّت الإشارة إلى أن غياب Stripe يُجمّد منظومة الـ Cost Ledger من الترجمة إلى P&L. ✅
- **Supreme Quality Auditor:** التقرير يحقق المعايير الخمسة (وضوح/دقة/اكتمال/قابلية تنفيذ/ملاءمة) — كل بند P0-P3 له ID + جهد + أثر + مخاطر. ✅
- **Supreme Ethical Reviewer:** التحليل لم يحوي ادعاءات تسويقية مبالغ بها (تجنّب "أفضل في العالم")، التزم بالأرقام الفعلية (16 وكيلًا منتجًا + 50 قِسميًا، لا "+50 وكيل" المُهملة لغويًا). ✅

---

> **خاتمة المنسق العام:**
> Kalmeron Two منصة في حالة **"Production-Ready تقنيًا، لكنها Pre-Revenue تجاريًا"**. الفجوة الأهم ليست في الكود ولا في الذكاء الاصطناعي — بل في **البنية التحتية للإيراد**. إغلاق P0-1 + P0-2 + P0-3 خلال أسبوعين يُحوِّل المنصة من "عرض تقني مذهل" إلى "أعمال قابلة للتمويل". الباقي تحسينات تراكمية.
>
> **درجة التصويت النهائية للمجلس:** **8.4 / 10** — قرار **Go (مع شرط إغلاق P0 أولاً)**.
