# Kalmeron AI Studio — خطة التطوير الشاملة (30+ مرحلة)

**تاريخ التحديث:** 2026-05-01  
**الحالة:** نشطة — المرجع الإلزامي لكل فريق التطوير  
**المنصة:** Next.js 16 (Turbopack) + Firebase + LangGraph + Python Microservices

---

## ملخص الحالة الراهنة — ما تمّ حتى اليوم

### ✅ البنية التحتية المكتملة
| العنصر | الحالة |
|---|---|
| Next.js 16 + React 19 على port 5000 | ✅ يعمل |
| PDF Worker (port 8000) | ✅ يعمل |
| Egypt Calc (port 8008) | ✅ يعمل |
| LLM Judge (port 8080) | ✅ يعمل |
| Embeddings Worker (port 8099) | ✅ يعمل |
| Gemini AI Integration (Replit AI Proxy) | ✅ متصل الآن |
| Firebase Auth (Google Sign-In) | ✅ يعمل |
| 57 وكيل ذكاء اصطناعي (LangGraph) | ✅ مسجّل |
| RAG System (PDF/CSV/Excel) | ✅ بنية كاملة |
| Workflow Engine (5 قوالب) | ✅ يعمل |
| Multi-Agent Council (Panel System) | ✅ بنية كاملة |
| Billing Plans (Free/Starter/Pro/Founder/Enterprise) | ✅ معرّف |
| Security (Rate Limiting, PII Redaction, Prompt Guard) | ✅ مطبّق |

### ✅ إصلاحات اليوم (2026-05-01)
- ✅ ربط Gemini AI Integration عبر Replit AI Proxy (بدون API key شخصي)
- ✅ إصلاح نماذج غير مدعومة: `gemini-2.5-flash-lite` → `gemini-2.5-flash` في 12 ملفاً
- ✅ إصلاح `gemini-embedding-001` → embeddings-worker sidecar في كل مسارات RAG
- ✅ إنشاء `src/lib/embed-helper.ts` — مساعد تضمين موحّد يوجّه بذكاء للـ worker أو Gemini
- ✅ تسريع workflow restart (skip npm install عند وجود node_modules)
- ✅ تحديث `src/lib/rag/user-rag.ts` → embed-helper
- ✅ تحديث `src/ai/panel/router-cache.ts` → embed-helper
- ✅ تحديث `src/lib/digital-twin/graphrag.ts` → embed-helper
- ✅ تحديث `src/lib/embeddings.ts` → embed-helper

### 🔴 ما يحتاج تكويناً يدوياً (Secrets مفقودة)
| Secret | الغرض | الأولوية |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin SDK (Firestore، Auth Verification) | P0 |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | نظام الدفع | P1 |
| `FAWRY_API_KEY` | بوابة الدفع المصرية | P1 |
| `RESEND_API_KEY` أو `SENDGRID_API_KEY` | إرسال البريد الإلكتروني | P1 |
| `SENTRY_DSN` | مراقبة الأخطاء في production | P2 |
| `LANGFUSE_SECRET_KEY` + `LANGFUSE_PUBLIC_KEY` | تتبع LLM calls | P2 |

---

## المراحل الإجمالية — نظرة عامة

```
المرحلة P0 (1-3):    الاستقرار والبيئة والأمان
المرحلة P1-A (4-7):  تجربة المستخدم الأساسية  
المرحلة P1-B (8-11): تعزيز الذكاء الاصطناعي
المرحلة P2-A (12-15): الأعمال والمبيعات
المرحلة P2-B (16-19): النمو والتسويق
المرحلة P3-A (20-23): التقنية المتقدمة
المرحلة P3-B (24-27): التكاملات الخارجية
المرحلة P4 (28-30+): المنصة المؤسسية
```

---

## المرحلة 1: الاستقرار والبيئة (P0 — أسبوع 1)

**الهدف:** المنصة تعمل 100% بدون أخطاء في بيئة التطوير.

### 1.1 إعداد الـ Secrets الأساسية
- [ ] إضافة `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON من Firebase Console) → تُفعّل Firestore + Admin Auth
- [ ] التحقق من `NEXT_PUBLIC_FIREBASE_*` vars موجودة في `.replit [userenv.shared]`
- [ ] اختبار تسجيل الدخول بـ Google Sign-In يعمل كاملاً

**الملفات:**
- `src/lib/firebase-admin.ts`
- `src/lib/firebase-client.ts`
- `.replit` (userenv.shared)

### 1.2 إصلاح TypeScript
- [ ] إزالة `@ts-nocheck` من `app/api/rag/ingest/route.ts`
- [ ] إزالة `@ts-nocheck` من `app/api/rag/search/route.ts`
- [ ] تشغيل `npm run typecheck` وإصلاح الأخطاء بدون `@ts-ignore`
- [ ] إضافة Zod validation للـ API routes التي تفتقرها

### 1.3 اختبار شامل للصفحات
- [ ] فتح كل صفحة dashboard والتحقق من تحميلها
- [ ] اختبار Chat API مع Gemini (أول رسالة فعلية)
- [ ] اختبار RAG upload بـ PDF صغير
- [ ] اختبار Workflow runner (تشغيل قالب جاهز)
- [ ] اختبار Ideas Analyze API

**الأدوات ذات الصلة:** `environment-secrets`, `database`

---

## المرحلة 2: قاعدة البيانات والمخطط (P0 — أسبوع 1)

**الهدف:** Firestore يعمل بكفاءة مع مخطط موثّق كامل.

### 2.1 توثيق Firestore Schema
- [ ] مراجعة وتحديث `docs/firestore-schema.md` بكل Collections الحالية
- [ ] إضافة Firestore indexes المفقودة (`firestore.indexes.json`)
- [ ] مراجعة `firestore.rules` — التأكد من لا `if true` في أي مكان
- [ ] إضافة TTL للـ collections المؤقتة (rag_chunks، session cache)

### 2.2 تحسين RAG Performance
- [ ] الانتقال من In-memory cosine search إلى Firestore vector index (or pgvector)
- [ ] تحديد حد 500 chunk للبحث (موجود بالفعل — ✅)
- [ ] إضافة caching لـ query embeddings (semantic-cache موجود — ✅)
- [ ] اختبار إدخال مستند كبير (100+ صفحة) وقياس الأداء

### 2.3 Neo4j Knowledge Graph (اختياري مرحلياً)
- [ ] إضافة fallback graceful عند غياب Neo4j (موجود جزئياً — ✅)
- [ ] اختبار `GraphRAG.retrieveContext()` مع sidecar نشط
- [ ] توثيق إعداد Neo4j للـ production

**الملفات:**
- `firestore.rules`, `firestore.indexes.json`
- `src/lib/rag/user-rag.ts` (✅ محدّث)
- `src/lib/digital-twin/graphrag.ts` (✅ محدّث)

---

## المرحلة 3: الأمان والمراقبة (P0 — أسبوع 1-2)

**الهدف:** منظومة الأمان والمراقبة تعمل بالكامل في production.

### 3.1 Rate Limiting شامل
- [ ] التحقق من كل API endpoint يملك rate limit
- [ ] مراجعة أحجام الـ windows: guests 3/min، users 10/min، paid 60/min
- [ ] اختبار rate limit يُرجع 429 عند الإفراط

### 3.2 Observability — Sentry + LangFuse
- [ ] إضافة `SENTRY_DSN` secret
- [ ] تحقق من `sentry.client.config.ts` و `sentry.server.config.ts` تعملان
- [ ] إضافة `LANGFUSE_SECRET_KEY` + `LANGFUSE_PUBLIC_KEY`
- [ ] تحقق من LLM calls تظهر في LangFuse dashboard
- [ ] إضافة Custom error boundaries في كل dashboard page

### 3.3 Security Hardening
- [ ] مراجعة CSP headers — التأكد من تغطية كل العمليات
- [ ] التحقق من لا يوجد sensitive data في browser console logs
- [ ] تشغيل `npm audit` وإصلاح vulnerabilities
- [ ] مراجعة PII redactor يعمل على كل chat messages

**الملفات:**
- `sentry.client.config.ts`, `sentry.server.config.ts`
- `src/lib/security/`, `src/lib/compliance/`
- `next.config.ts`

**الأدوات ذات الصلة:** `security_scan`, `threat_modeling`

---

## المرحلة 4: واجهة Chat المتقدمة (P1 — أسبوع 2)

**الهدف:** تجربة المحادثة هي أقوى مزايا المنصة — تضاهي claude.ai بالعربية.

### 4.1 Chat UI Improvements
- [ ] إضافة اقتراحات ذكية بناءً على سياق الشركة
- [ ] تحسين عرض `<AgentBlock>` — charts، forms، checklists بشكل أجمل
- [ ] إضافة Voice Input (Web Speech API)
- [ ] تحسين عرض Citations و Sources مع روابط قابلة للنقر
- [ ] إضافة Copy، Share، Save لكل رسالة
- [ ] إضافة Reactions (👍 👎) لتقييم ردود الوكلاء

### 4.2 Chat Intelligence
- [ ] تحسين Agent Selection Logic (intents أدق بالعربية)
- [ ] إضافة "يفكّر..." indicator أثناء معالجة المجلس
- [ ] تحسين SSE streaming — إظهار اسم الوكيل النشط حالياً
- [ ] Error Recovery — retry ذكي عند فشل الشبكة مع رسالة واضحة

### 4.3 Chat History & Search
- [ ] تحسين واجهة تاريخ المحادثات
- [ ] Search في تاريخ المحادثات بالعربية والإنجليزية
- [ ] Pin للمحادثات المهمة
- [ ] Export محادثة كـ PDF مُنسّق

**الملفات:**
- `app/(dashboard)/chat/page.tsx`
- `components/chat/`
- `src/ai/orchestrator/supervisor.ts`

**الأدوات ذات الصلة:** `frontend-design`, `design`

---

## المرحلة 5: لوحة القيادة الرئيسية (P1 — أسبوع 2-3)

**الهدف:** Dashboard هو مركز العمليات اليومية لكل مؤسس.

### 5.1 Dashboard Widgets
- [ ] Widget: ملخص AI يومي (Daily Brief) بالعربية يتجدد كل صباح
- [ ] Widget: مهام معلقة من الوكلاء (Actionable items)
- [ ] Widget: مؤشرات الشركة الرئيسية (KPIs مع رسوم بيانية)
- [ ] Widget: آخر الأفكار والفرص المرصودة
- [ ] Widget: حالة فريق الوكلاء (أي وكيل نشط ومتى)

### 5.2 Quick Actions & Command Palette
- [ ] زر سريع لكل وكيل رئيسي (C-Suite + Department heads)
- [ ] Ctrl+K → Command Palette عربي/إنجليزي
- [ ] Notification center في الـ Sidebar مع Real-time updates
- [ ] اختصارات لوحة المفاتيح موثّقة في Help panel

### 5.3 Personalization
- [ ] تخصيص ترتيب وحجم Widgets (Drag & Drop)
- [ ] وضع Focus (إخفاء Sidebar وعناصر غير ضرورية)
- [ ] Themes: Dark / Light / Auto / Egyptian Blue
- [ ] حفظ تفضيلات المستخدم في Firestore

**الملفات:**
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/`
- `src/lib/daily-brief/`

---

## المرحلة 6: بناء الشركة الافتراضية (P1 — أسبوع 3)

**الهدف:** Company Builder هو المنتج الأكثر تميزاً في السوق العربي.

### 6.1 Org Chart Interactive
- [ ] تحسين رسم الهيكل التنظيمي (react-flow أو d3)
- [ ] Click على موظف يفتح Chat معه مباشرةً
- [ ] Drag & Drop لإعادة ترتيب الموظفين
- [ ] عرض KPIs لكل قسم على الـ chart

### 6.2 Simulation Engine
- [ ] تشغيل مهمة حقيقية عبر Cross-Department Router
- [ ] عرض Delegation Tracker بالوقت الفعلي
- [ ] تسجيل نتائج كل مهمة في Firestore
- [ ] تقرير أداء يومي لكل قسم

### 6.3 Company Templates
- [ ] 20+ قالب شركة جاهز (Startup، Restaurant، Clinic، Agency، E-commerce...)
- [ ] Import/Export هيكل الشركة كـ JSON
- [ ] مشاركة قالب مع مؤسس آخر (رابط قابل للمشاركة)

**الملفات:**
- `app/(dashboard)/company-builder/`
- `src/lib/company-builder/`
- `src/ai/organization/`

---

## المرحلة 7: أدوات المؤسس الأساسية (P1 — أسبوع 3-4)

**الهدف:** كل مؤسس يجد ما يحتاجه في 3 نقرات.

### 7.1 Investor Dashboard
- [ ] مستوى الاستعداد للاستثمار (1-10) مع تفاصيل
- [ ] Pitch Deck Generator تلقائي بالعربية والإنجليزية
- [ ] Cash Runway حاسبة تفاعلية مع رسم بياني
- [ ] Cap Table إدارة بسيطة
- [ ] نموذج DCF مدمج مع Egypt Calc

### 7.2 Ideas Analyzer Enhancement
- [ ] SWOT Analysis مصري مُفصّل (يعمل الآن — ✅ Gemini متصل)
- [ ] مقارنة بمنافسين مصريين وعرب فعليين
- [ ] حساب حجم السوق المصري (TAM/SAM/SOM)
- [ ] خطوات validation مخصصة (MVP أسبوعين في مصر)
- [ ] حفظ التقييمات في Firestore للرجوع إليها لاحقاً

### 7.3 Opportunity Radar
- [ ] قاعدة بيانات فرص تمويل مصرية وعربية
- [ ] تنبيهات بمواعيد تقديم للهاكاثونات والمسابقات
- [ ] فرص شراكة قطاعية (Tech، AgriTech، FinTech مصر)
- [ ] تصفية بالصناعة والمرحلة وحجم التمويل

**الملفات:**
- `app/(dashboard)/investor/`
- `app/(dashboard)/ideas/`
- `app/(dashboard)/opportunities/`
- `app/api/ideas/analyze/route.ts` (✅ يعمل مع Gemini)

---

## المرحلة 8: تحسين وكلاء الذكاء الاصطناعي (P1 — أسبوع 4)

**الهدف:** الوكلاء أذكى وأكثر تخصصاً للسوق المصري والعربي.

### 8.1 Agent Quality — تحسين الـ Prompts
- [ ] تحديث system prompts لجميع الـ 57 وكيل بـ Cairo/Egypt context
- [ ] إضافة أمثلة مصرية حقيقية في كل system prompt (شركات مصرية، أسعار بالجنيه)
- [ ] اختبار كل وكيل مع 10 حالات استخدام حقيقية من السوق المصري
- [ ] تقييم جودة الردود بـ LLM Judge (موجود — port 8080)

### 8.2 Agent Memory — الذاكرة طويلة الأمد
- [ ] Company Profile Context: كل وكيل يعرف اسم الشركة ومجالها وموظفيها
- [ ] Shared context بين جميع الوكلاء (لا يسأل كل وكيل من الصفر)
- [ ] Memory decay: تقليل وزن المعلومات القديمة تدريجياً
- [ ] Auto-import context من Company Builder

### 8.3 Multi-Agent Council Enhancement
- [ ] عرض رأي كل خبير في المجلس بشكل منفصل مع اسمه
- [ ] نظام تصويت وتوافق بين الخبراء
- [ ] إظهار الخلافات بين وجهات النظر (يجعل النتيجة أكثر مصداقية)
- [ ] Council في وضع "fast" للأسئلة السريعة

**الملفات:**
- `src/ai/agents/` (57 ملف)
- `src/ai/orchestrator/supervisor.ts`
- `src/ai/panel/council.ts`, `src/ai/panel/experts.ts`

---

## المرحلة 9: محرك سير العمل المتقدم (P1 — أسبوع 4-5)

**الهدف:** Automation engine يوفر 10+ ساعات أسبوعياً لكل مؤسس.

### 9.1 Workflow Builder UI
- [ ] Visual drag-and-drop workflow builder
- [ ] مكتبة 30+ قالب workflow جاهز بالعربية
- [ ] Scheduled workflows (cron: يومي/أسبوعي/شهري)
- [ ] Event-triggered workflows (عند رفع مستند، عند نتيجة معينة)

### 9.2 Workflow Outputs
- [ ] Output كـ PDF قابل للتنزيل (PDF Worker — موجود ✅)
- [ ] Output كـ Email تلقائي عند اكتمال Workflow
- [ ] Output كـ Firestore document مرتّب
- [ ] Output كـ Webhook إلى أنظمة خارجية

### 9.3 Workflow Marketplace
- [ ] مشاركة workflows بين المستخدمين (public/private)
- [ ] تقييم وـrating للـ workflows
- [ ] Revenue sharing مستقبلاً للمنشئين المميزين

**الملفات:**
- `src/lib/workflows/`
- `app/(dashboard)/workflows-runner/`
- `app/api/workflows/`

---

## المرحلة 10: قاعدة المعرفة المتقدمة — RAG 2.0 (P1 — أسبوع 5)

**الهدف:** كل مؤسس يبني "دماغ" شركته المميز.

### 10.1 RAG 2.0 — Vector Database
- [ ] الانتقال من In-memory cosine search إلى vector database حقيقية
- [ ] خيارات: Pinecone، Weaviate، pgvector (Supabase)
- [ ] دعم أنواع ملفات إضافية: Word (.docx)، PowerPoint (.pptx)، Images (OCR)
- [ ] Arabic-aware chunking: تقسيم ذكي بالجملة العربية

### 10.2 Knowledge Graph — رسم بياني للمعرفة
- [ ] عرض الـ Knowledge Graph بشكل مرئي (D3 أو Cytoscape)
- [ ] إضافة entities يدوياً (شخص، شركة، منتج، عقد)
- [ ] ربط entities ببعضها (يعمل مع، ينافس، شريك...)
- [ ] استخدام الـ graph في توجيه الوكلاء للإجابة بدقة أعلى

### 10.3 Smart Ingestion — استيعاب ذكي
- [ ] Auto-summarize المستندات المرفوعة (ملخص تلقائي عند الرفع)
- [ ] Extract key entities تلقائياً (أسماء، تواريخ، مبالغ)
- [ ] Detect duplicates وتوحيد المعلومات المتكررة
- [ ] API webhook للـ real-time ingestion من مصادر خارجية

**الملفات:**
- `src/lib/rag/user-rag.ts` (✅ محدّث)
- `src/lib/memory/knowledge-graph.ts`
- `app/api/rag/`
- `services/embeddings-worker/` (✅ يعمل)

---

## المرحلة 11: الذكاء المتخصص المصري (P1 — أسبوع 5-6)

**الهدف:** كلميرون هو الخيار الأول والأوحد للمؤسس المصري والعربي.

### 11.1 Egypt Calc Enhancement
- [ ] تحسين حاسبة التأمينات الاجتماعية (قانون 2024)
- [ ] حاسبة ضريبة القيمة المضافة (VAT) الكاملة
- [ ] حاسبة ضريبة الدخل للأفراد والشركات (الشرائح الجديدة)
- [ ] حاسبة ضريبة الأرباح التجارية والصناعية
- [ ] تكامل Fawry payment calculator في نماذج التسعير

### 11.2 Arabic NLP Quality
- [ ] تحسين فهم اللهجة المصرية (Egyptian Arabic) في المحادثة
- [ ] دعم Arabizi (عربي بحروف إنجليزية: "ana 3ayez...")
- [ ] تحسين RTL في كل المكونات (لا يزال ببعض الاختلالات)
- [ ] Arabic spell checker للمحتوى المولّد

### 11.3 Local Market Intelligence
- [ ] بيانات أسعار السوق المصري (EGX، USD/EGP)
- [ ] بيانات قطاع التقنية المصرية (top startups، VCs، ecosystems)
- [ ] تقارير بيئة الأعمال المصرية (مؤشر مناخ الأعمال)
- [ ] مؤشر ثقة المستثمر في مصر (ربع سنوي)

**الملفات:**
- `services/egypt-calc/main.py`
- `services/embeddings-worker/main.py`
- `src/lib/egypt-calc/`

---

## المرحلة 12: منظومة الدفع والاشتراكات (P0-Business — أسبوع 6)

**الهدف:** Revenue-generating platform من اليوم الأول.

### 12.1 Stripe Integration — الربط الكامل
- [ ] إضافة `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` secrets
- [ ] إنشاء Products + Prices في Stripe Dashboard:
  - Free: مجاني (100 credits/شهر)
  - Starter: 199 EGP/شهر (500 credits)
  - Pro: 499 EGP/شهر (2000 credits)
  - Founder: 999 EGP/شهر (unlimited)
- [ ] تفعيل Checkout flow كامل مع redirect
- [ ] Stripe Webhook: معالجة `checkout.session.completed`، `invoice.payment_failed`

### 12.2 Fawry Integration — بوابة الدفع المصرية
- [ ] إضافة `FAWRY_API_KEY` secret
- [ ] تفعيل Fawry كبوابة رئيسية للمصريين
- [ ] إضافة Vodafone Cash، Orange Cash، Instapay
- [ ] Testing sandbox flow كامل

### 12.3 Credits System — نظام الرصيد
- [ ] Credits wallet واضح في الـ UI مع شريط التقدم
- [ ] إشعار عند اقتراب نفاد الـ credits (20% + 10% + 0%)
- [ ] شراء credits إضافية بدون تغيير الخطة
- [ ] Credit cost لكل نوع طلب (LITE: 1، FLASH: 3، PRO: 10)

**الملفات:**
- `app/api/billing/`, `app/api/webhooks/stripe/`
- `src/lib/billing/plans.ts` (✅ معرّف)
- `app/(dashboard)/settings/`

**الأدوات ذات الصلة:** `stripe`

---

## المرحلة 13: الـ Onboarding والتفعيل (P0-Growth — أسبوع 6-7)

**الهدف:** كل مستخدم جديد يصل إلى "Aha moment" في أقل من 5 دقائق.

### 13.1 Onboarding Flow — Wizard 4 خطوات
1. بيانات الشركة الأساسية (الاسم، المجال، المرحلة، عدد الموظفين)
2. اختيار الصناعة + المرحلة (Idea/MVP/Growth/Scale)
3. أول سؤال حقيقي للذكاء الاصطناعي
4. إعداد الفريق الافتراضي تلقائياً

- [ ] Progress indicator واضح (خطوة 1 من 4)
- [ ] Skip option للمتعجلين مع إمكانية الإكمال لاحقاً
- [ ] Auto-populate Company Builder من الـ Onboarding

### 13.2 Guided Tours
- [ ] Tour تفاعلي لأول مرة (Shepherd.js أو مخصص بالعربية)
- [ ] Video hints قصيرة لكل ميزة رئيسية (30 ثانية)
- [ ] Tooltips ذكية (تظهر مرة واحدة فقط وتُحفظ في Firestore)
- [ ] "ابدأ من هنا" checklist للمستخدمين الجدد

### 13.3 First Value Fast
- [ ] أول رد AI خلال 10 ثواني من إنهاء Onboarding
- [ ] Pre-built demo شركة للاستكشاف (كلميرون Demo Corp)
- [ ] Template library قابل للتطبيق بنقرة واحدة

**الملفات:**
- `app/onboarding/page.tsx`
- `components/onboarding/`
- `app/api/analytics/`

---

## المرحلة 14: Inbox وإدارة المهام (P1 — أسبوع 7)

**الهدف:** Inbox هو مركز قرارات المؤسس — كل شيء في مكان واحد.

### 14.1 AI Inbox Enhancement
- [ ] تصنيف تلقائي للرسائل (أولوية عالية/متوسطة/منخفضة)
- [ ] اقتراحات رد ذكية لكل رسالة (بناءً على نمط الشركة)
- [ ] Snooze + Archive + Pin + Labels
- [ ] Bulk actions (تحديد الكل، أرشفة، حذف)

### 14.2 Task Management
- [ ] Tasks مستخرجة تلقائياً من المحادثات
- [ ] ربط Task بـ Workflow تلقائياً
- [ ] Due dates وتنبيهات قبل الموعد
- [ ] Kanban view بالعربية (قيد التنفيذ، منتهٍ، معلّق)

### 14.3 Team Collaboration
- [ ] Delegate task لـ AI agent مباشرةً
- [ ] Comments على الـ tasks مع ذكر وكيل
- [ ] Activity log مرتب زمنياً لكل شركة

**الملفات:**
- `app/(dashboard)/inbox/page.tsx`
- `app/api/inbox/`

---

## المرحلة 15: تقارير وتحليلات الأعمال (P1 — أسبوع 7-8)

**الهدف:** كل مؤسس يتخذ قرارات بناءً على بيانات حقيقية.

### 15.1 Business Reports
- [ ] تقرير أسبوعي تلقائي (Daily Brief Agent يُرسله)
- [ ] مقارنة الأداء شهر بشهر (Month-over-Month)
- [ ] Burn rate + Runway forecast تلقائي
- [ ] Customer acquisition funnel مُرسوم بشكل جميل

### 15.2 AI Analytics
- [ ] أكثر الوكلاء استخداماً (هل يستخدم المؤسس CFO أكثر؟)
- [ ] أكثر الأسئلة تكراراً (Privacy-safe anonymized)
- [ ] مقارنة جودة الردود عبر الزمن (LLM Judge score trend)
- [ ] ROI Calculator: كم وفّر كلميرون في وقت وتكلفة استشارات

### 15.3 Export & Sharing
- [ ] Export تقارير كـ PDF مُنسّق (PDF Worker — ✅ موجود)
- [ ] Shareable link للتقرير (token-protected)
- [ ] Investor-ready report generator بالعربية والإنجليزية

**الملفات:**
- `app/(dashboard)/investor/`
- `src/lib/analytics/`

---

## المرحلة 16: التسويق والـ SEO (P1-Growth — أسبوع 8-9)

**الهدف:** كلميرون تظهر في أول 3 نتائج Google لكل استعلام ريادة أعمال بالعربية.

### 16.1 SEO Technical
- [ ] Structured data (JSON-LD: Organization، SoftwareApplication) لكل صفحة
- [ ] Sitemap.xml تلقائي وشامل (`app/sitemap.ts`)
- [ ] Meta tags كاملة: OG + Twitter Card + canonical لكل صفحة
- [ ] Core Web Vitals: LCP < 2.5s، CLS < 0.1، FID < 100ms
- [ ] Arabic SEO: keywords research مصري + عربي

### 16.2 Content Strategy
- [ ] Blog بالعربية: "دليل ريادة الأعمال في مصر 2026"
- [ ] Landing pages مخصصة لكل صناعة مصرية (مطاعم، عيادات، شركات تقنية...)
- [ ] Comparison pages: كلميرون vs ChatGPT، vs Notion AI
- [ ] Use cases: "كيف تبني خطة عمل لمطعم في القاهرة"

### 16.3 Programmatic SEO
- [ ] صفحات تلقائية لكل محافظة مصرية رئيسية
- [ ] صفحات لكل قطاع صناعي مصري (30+ قطاع)
- [ ] مقالات دليلية: "كيف تبني [نوع شركة] في [مدينة] خطوة بخطوة"
- [ ] FAQ pages من أسئلة المستخدمين الشائعة (Schema markup)

**الملفات:**
- `app/blog/`, `app/sitemap.ts`, `app/robots.ts`

**الأدوات ذات الصلة:** `seo-audit`, `programmatic-seo`

---

## المرحلة 17: البريد الإلكتروني والإشعارات (P1 — أسبوع 9)

**الهدف:** التواصل مع المستخدم في اللحظة المناسبة بالرسالة الصحيحة.

### 17.1 Email System — Resend/SendGrid
- [ ] إضافة `RESEND_API_KEY` أو `SENDGRID_API_KEY` secret
- [ ] قوالب React Email بالعربية (RTL):
  - Welcome email (ترحيب دافئ)
  - Daily brief (ملخص يومي)
  - Billing invoices (فواتير)
  - Credit low warning (تحذير نفاد الرصيد)
  - Workflow completed (انتهاء مهمة)
- [ ] Unsubscribe flow قانوني مطابق للـ CAN-SPAM

### 17.2 Push Notifications — FCM
- [ ] Firebase Cloud Messaging إعداد كامل
- [ ] "وكيلك أنهى المهمة" — إشعار فوري
- [ ] "فرصة جديدة تناسب شركتك" — إشعار ذكي
- [ ] Notification preferences panel في الإعدادات

### 17.3 In-App Notifications
- [ ] Notification bell في الـ header مع عداد
- [ ] Real-time updates عبر Firestore listeners
- [ ] Read/Unread state مع تسليط الضوء
- [ ] Group by type وتصفية

**الملفات:**
- `app/api/notifications/`, `emails/`
- `src/lib/fcm.ts`

---

## المرحلة 18: PWA والتطبيق الجوال (P1 — أسبوع 9-10)

**الهدف:** كلميرون يعمل كتطبيق جوال احترافي على iOS و Android.

### 18.1 PWA Enhancement
- [ ] Web App Manifest كامل مع أيقونات بالأحجام الكاملة
- [ ] Service Worker: Offline support للصفحات الأساسية
- [ ] Push notifications عبر PWA
- [ ] Install prompt (Add to Home Screen) ذكي
- [ ] Splash screen بالهوية البصرية لكلميرون

### 18.2 Mobile UX
- [ ] Bottom navigation bar للجوال (Chat، Dashboard، Company، Settings)
- [ ] Gesture navigation (swipe للعودة، pull-to-refresh)
- [ ] Voice input محسّن على الجوال
- [ ] Haptic feedback للتفاعلات المهمة

### 18.3 Performance Mobile
- [ ] Lazy loading لكل الصور والمكونات الثقيلة
- [ ] Bundle size: استهداف < 300KB Initial JS
- [ ] API response caching بـ SWR أو React Query
- [ ] Prefetch الصفحات الأكثر زيارةً

---

## المرحلة 19: Brand Voice ومحتوى التسويق (P1 — أسبوع 10)

**الهدف:** كل شركة تملك صوتها التسويقي المميز بقوة الذكاء الاصطناعي.

### 19.1 Brand Voice Builder
- [ ] تحليل موقع الشركة واستخراج الـ brand voice تلقائياً
- [ ] تحديد أسلوب الكتابة: رسمي/ودي/جريء/محايد
- [ ] بناء Target Audience profiles ثلاثية الأبعاد
- [ ] Save + Apply على كل المحتوى المولّد

### 19.2 Content Generator المتقدم
- [ ] منشورات LinkedIn بالعربية (محسّنة لـ engagement)
- [ ] Threads و X (تويتر) content بالعربية والإنجليزية
- [ ] Email marketing بالعربية (RTL-optimized)
- [ ] Product descriptions للـ E-commerce المصري

### 19.3 Content Calendar
- [ ] خطة محتوى أسبوعية/شهرية تلقائية
- [ ] Scheduling للـ posts (Google Calendar integration)
- [ ] Analytics للمحتوى السابق (what works vs what doesn't)
- [ ] A/B testing للعناوين

**الملفات:**
- `app/(dashboard)/brand-voice/`
- `src/ai/agents/brand-builder/`, `src/ai/agents/content-creator/`

---

## المرحلة 20: API العام والـ Integrations (P2 — أسبوع 10-11)

**الهدف:** المطورون يبنون فوق كلميرون — developer ecosystem.

### 20.1 Public REST API
- [ ] توثيق OpenAPI كامل (`/api-docs` → Swagger UI)
- [ ] API Keys بصيغة: `kal_live_...` (25 حرفاً)
- [ ] Rate limiting مستقل للـ API (100 req/min للـ Pro)
- [ ] تحديث `/api-docs` بكل الـ endpoints الجديدة

### 20.2 Webhooks 2.0
- [ ] Event catalog كامل: `agent.response.completed`، `workflow.finished`...
- [ ] Retry policy مخصص (3 محاولات، exponential backoff)
- [ ] Webhook logs في الـ dashboard (last 100 events)
- [ ] HMAC-SHA256 signature verification

### 20.3 Third-party Integrations
- [ ] Zapier integration (no-code automation)
- [ ] Make (Integromat) integration
- [ ] Slack Bot (ارسل للـ channel من كلميرون)
- [ ] WhatsApp Business API (تفاعل مع الوكلاء عبر واتساب)
- [ ] Telegram Bot

**الملفات:**
- `app/api-docs/`
- `src/lib/webhooks/`

---

## المرحلة 21: الأمان المتقدم (P2 — أسبوع 11)

**الهدف:** أعلى معايير الأمان — منصة يثق بها المؤسس بنسبة 100%.

### 21.1 Authentication Advanced
- [ ] MFA إعداد كامل (TOTP: Google Authenticator)
- [ ] Passkeys/WebAuthn تفعيل (المصادقة بدون كلمة مرور)
- [ ] Session management متقدم (Refresh tokens، revocation)
- [ ] Device trust list مع إشعار عند تسجيل دخول من جهاز جديد

### 21.2 Data Privacy
- [ ] Data export (GDPR/PDPL compliant) — تنزيل كل بيانات المستخدم
- [ ] Account deletion مع تنظيف كامل (Firestore + Storage)
- [ ] Data retention policies (auto-delete بعد 90 يوم للبيانات المؤقتة)
- [ ] Privacy dashboard للمستخدم (ماذا نحفظ عنك؟)

### 21.3 Compliance مصر
- [ ] PDPL (قانون حماية البيانات الشخصية المصري) compliance
- [ ] Audit log كامل لكل العمليات الحساسة
- [ ] Data residency: خيار تخزين البيانات في منطقة Middle East
- [ ] Privacy Impact Assessment (PIA) موثّق

**الملفات:**
- `src/lib/security/`, `src/lib/compliance/`
- `app/api/auth/`

**الأدوات ذات الصلة:** `security_scan`, `threat_modeling`

---

## المرحلة 22: الأداء والقابلية للتوسع (P2 — أسبوع 11-12)

**الهدف:** كلميرون يستوعب 10,000 مستخدم نشط بدون تباطؤ.

### 22.1 Frontend Performance
- [ ] Bundle analysis (`npm run analyze`) وتقليص
- [ ] Code splitting لكل dashboard page
- [ ] Image optimization: WebP/AVIF تلقائي (Next.js Image — ✅ مُهيّأ)
- [ ] Prefetch الصفحات الشائعة

### 22.2 Backend Performance
- [ ] Edge Functions لـ middleware (proxy.ts → Edge runtime)
- [ ] Caching strategy: Firestore reads cached بـ Redis أو Upstash
- [ ] Connection pooling للـ Python sidecars
- [ ] Async task queue لـ workflows طويلة المدة (Bull MQ أو Inngest)

### 22.3 Scalability Infrastructure
- [ ] Health checks محسّنة مع circuit breakers
- [ ] Auto-scaling للـ Python services
- [ ] Horizontal scaling plan للـ Next.js (Vercel أو Cloud Run)
- [ ] Load testing: k6 أو Artillery مع هدف 1000 concurrent users

**الأدوات ذات الصلة:** `google-cloud-waf-reliability`, `google-cloud-waf-cost-optimization`

---

## المرحلة 23: الذكاء الاصطناعي التوليدي (P2 — أسبوع 12)

**الهدف:** توليد صور، تحليل صور، ومعالجة متقددة.

### 23.1 Image Generation
- [ ] توليد صور للمحتوى التسويقي (`gemini-2.5-flash-image` — متوفر عبر proxy ✅)
- [ ] توليد شعارات أولية (logo concepts)
- [ ] تصميم infographics تلقائي من البيانات
- [ ] صور للمنتجات بوصف نصي (E-commerce)

### 23.2 Document Intelligence
- [ ] تحليل عقد PDF واستخراج البنود الخطرة
- [ ] مقارنة نسختين من عقد (Contract Reviewer Agent)
- [ ] تلخيص تقارير مالية طويلة
- [ ] استخراج بيانات منظّمة من صور (Receipts، Invoices)

### 23.3 Advanced Analytics
- [ ] Predictive analytics للمبيعات
- [ ] Anomaly detection في البيانات المالية
- [ ] Pattern recognition في سلوك المستخدم
- [ ] Forecasting نموذج نمو الشركة

---

## المرحلة 24: التكاملات المالية المصرية (P2 — أسبوع 12-13)

**الهدف:** كلميرون متصل بكل المنصات المالية المصرية.

### 24.1 Banking & Payments
- [ ] Fawry API كاملة (pay, bill, refund)
- [ ] CIB Open Banking API
- [ ] Vodafone Cash B2B
- [ ] InstaPay QR code generator
- [ ] NBE (البنك الأهلي) integration

### 24.2 Accounting & ERP
- [ ] QuickBooks Online integration (للشركات التي تستخدمه)
- [ ] Odoo integration (شائع في مصر)
- [ ] Excel/Google Sheets sync ثنائي الاتجاه
- [ ] إصدار فواتير PDF تلقائية

### 24.3 Government Services
- [ ] بوابة الخدمات الحكومية المصرية (eHUKOMA)
- [ ] مصلحة الضرائب المصرية API
- [ ] السجل التجاري الإلكتروني
- [ ] GAFI (الهيئة العامة للاستثمار) integrations

---

## المرحلة 25: شبكة المؤسسين (P2 — أسبوع 13)

**الهدف:** كلميرون ليس فقط أداة، بل مجتمع رواد أعمال.

### 25.1 Founder Network
- [ ] صفحة Profile للمؤسس (قابلة للمشاركة)
- [ ] Directory المؤسسين المصريين قابل للبحث
- [ ] نظام Connections بين المؤسسين
- [ ] Referral program مع credits مجانية

### 25.2 Mentorship System
- [ ] نظام جلسات mentorship 1:1
- [ ] ربط مؤسسين خبراء بالمبتدئين
- [ ] Expert marketplace (استشارة بالساعة)
- [ ] Office Hours مجانية مع experts

### 25.3 Community Features
- [ ] Q&A مجتمعي بالعربية (مثل Stack Overflow للريادة)
- [ ] Success stories والمتحف الناجحين
- [ ] Weekly challenges ومسابقات
- [ ] Leaderboard المؤسسين الأكثر نشاطاً

---

## المرحلة 26: المنصة الدولية (P3 — أسبوع 13-14)

**الهدف:** التوسع إلى كل الأسواق العربية.

### 26.1 Multi-Market Support
- [ ] دعم السوق السعودي (VAT 15%، العمالة المحلية، Vision 2030)
- [ ] دعم السوق الإماراتي (DIFC، Free Zones، VAT 5%)
- [ ] دعم المغرب والجزائر وتونس
- [ ] دعم العراق والأردن والكويت

### 26.2 Localization
- [ ] خصائص كل سوق في Egypt Calc (قابل للتوسع إلى Saudi Calc، UAE Calc)
- [ ] Legal templates لكل دولة عربية
- [ ] Currency support: EGP، SAR، AED، MAD، DZD، JOD
- [ ] Local payment gateways لكل سوق

### 26.3 Partnerships
- [ ] شراكة مع أكاديميات ريادة الأعمال العربية
- [ ] تكامل مع منصات Accelerators (Flat6Labs، AUC Venture Lab)
- [ ] شراكة مع banks للـ Startup banking packages
- [ ] Reseller program للاستشاريين والمدربين

---

## المرحلة 27: المنصة المؤسسية — Enterprise (P3 — أسبوع 14-15)

**الهدف:** الشركات الكبيرة تشتري كلميرون للفرق.

### 27.1 Team Management
- [ ] Multi-user workspaces (فريق من 5-50 شخصاً)
- [ ] Role-based access control (Owner, Admin, Member, Viewer)
- [ ] SSO (SAML/OIDC) للـ Enterprise customers
- [ ] Audit logs للمديرين (من فعل ماذا ومتى)

### 27.2 Enterprise Features
- [ ] Private AI instances (Dedicated compute)
- [ ] Custom fine-tuning بيانات الشركة
- [ ] SLA 99.9% uptime guarantee
- [ ] Dedicated customer success manager

### 27.3 Enterprise Billing
- [ ] Annual invoicing (فاتورة سنوية مع NET-30)
- [ ] Volume discounts تلقائية
- [ ] Procurement-friendly: PO numbers، W9/W8
- [ ] Usage reporting للمديرين

---

## المرحلة 28: البنية التحتية المتقدمة (P3 — أسبوع 15-16)

**الهدف:** بنية تحتية تستحق Scale-up.

### 28.1 Infrastructure
- [ ] Multi-region deployment (Egypt + UAE + Europe)
- [ ] CDN مُحسَّن للمحتوى العربي
- [ ] Database sharding للمستخدمين الكبار
- [ ] Disaster Recovery Plan موثّق ومختبر

### 28.2 DevOps Excellence
- [ ] CI/CD pipeline كامل (GitHub Actions + Firebase Deploy)
- [ ] Automated testing: Unit + Integration + E2E (Playwright)
- [ ] Feature flags (Unleash أو LaunchDarkly)
- [ ] Blue-Green deployment للـ zero-downtime updates

### 28.3 FinOps
- [ ] Cost tracking per user per agent call
- [ ] Budget alerts تلقائية عند تجاوز الحد
- [ ] LLM cost optimization: caching + compression + routing
- [ ] Monthly cost report للفريق

**الأدوات ذات الصلة:** `google-cloud-waf-reliability`, `cloud-run-basics`

---

## المرحلة 29: المنصة الذاتية التحسين (P4 — مستقبل)

**الهدف:** كلميرون يتحسن بنفسه بناءً على بيانات المستخدمين.

### 29.1 Self-Learning System
- [ ] Reinforcement Learning من تقييمات المستخدمين (👍 👎)
- [ ] A/B testing للـ system prompts تلقائياً
- [ ] Fine-tuning مجدول للنماذج المخصصة
- [ ] Continuous evaluation pipeline

### 29.2 Agent Evolution
- [ ] إضافة وكلاء جدد بناءً على طلبات المستخدمين
- [ ] تقاعد الوكلاء منخفضي الأداء
- [ ] Agent marketplace: وكلاء يبنيها المجتمع
- [ ] Custom agents: المستخدم يبني وكيله الخاص

### 29.3 Predictive Intelligence
- [ ] التنبؤ باحتياجات المؤسس قبل أن يسأل
- [ ] Proactive insights: "شركتك ستحتاج X في 30 يوم"
- [ ] Market signals: تنبيه "هذا التوقيت مناسب للتمويل"

---

## المرحلة 30: الرؤية بعيدة المدى (2027+)

**الهدف:** كلميرون هو "Amazon AWS" لريادة الأعمال العربية.

### 30.1 AI Platform
- [ ] كلميرون كـ Platform for AI Agents (يبني عليها الآخرون)
- [ ] Agent Studio: بناء وكلاء بدون كود
- [ ] Agent Marketplace مفتوح للمجتمع
- [ ] Revenue sharing 70/30 مع بناة الوكلاء

### 30.2 Data Advantage
- [ ] أكبر قاعدة بيانات ريادة أعمال عربية مجمّعة بشكل خاص
- [ ] Benchmarks صناعية محدّثة باستمرار
- [ ] Market intelligence reports ربع سنوية
- [ ] Arabic Business Knowledge Graph

### 30.3 Impact Measurement
- [ ] عداد "وظائف أُنشئت بمساعدة كلميرون"
- [ ] عداد "شركات أُسّست بمساعدة كلميرون"
- [ ] عداد "EGP مُوّلت بمساعدة كلميرون"
- [ ] تقرير الأثر الاقتصادي السنوي

---

## مصفوفة الأولويات والمهارات المستخدمة

| المرحلة | الأولوية | الأدوات/المهارات |
|---|---|---|
| 1-3 | P0 | `environment-secrets`, `database`, `security_scan` |
| 4-7 | P1 | `frontend-design`, `design`, `shadcn-ui` |
| 8-11 | P1 | `delegation`, `cto-egypt`, `cfo-egypt` |
| 12-13 | P0-Business | `stripe`, `environment-secrets` |
| 14-15 | P1 | `frontend-design`, `database` |
| 16 | P1-Growth | `seo-audit`, `programmatic-seo` |
| 17-18 | P1 | `environment-secrets`, `mockup-sandbox` |
| 19 | P1 | `cmo-egypt`, `content-machine` |
| 20-21 | P2 | `security_scan`, `threat_modeling` |
| 22-23 | P2 | `google-cloud-waf-reliability`, `gemini-api` |
| 24-25 | P2 | `integrations`, `query-integration-data` |
| 26-27 | P3 | `ceo-egypt`, `intl-expansion` |
| 28-30 | P3-P4 | `cloud-run-basics`, `deployment` |

---

## الخطوة التالية الفورية (اليوم)

1. **P0 الأهم:** إضافة `FIREBASE_SERVICE_ACCOUNT_KEY` secret (بدونه Firestore لا يعمل)
2. **P0:** اختبار Chat مع Gemini (Gemini متصل الآن — اختبر أول رسالة حقيقية)
3. **P0:** اختبار Ideas Analyze API مع فكرة مشروع حقيقية
4. **P1:** البدء في المرحلة 4 (Chat UI improvements)

> لتفعيل Firebase Admin: اذهب إلى Firebase Console → Project Settings → Service Accounts → Generate new private key → ضع الـ JSON كاملاً في secret `FIREBASE_SERVICE_ACCOUNT_KEY`
