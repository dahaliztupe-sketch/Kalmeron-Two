# 0001 — استخدام Firestore بدلاً من MongoDB كقاعدة بيانات أساسيّة

**الحالة:** Accepted
**التاريخ:** 2026-04-25 (موثّقة بأثر رجعي — القرار اتُّخذ في بداية المشروع 2026-Q1)
**المقرِّرون:** Founding team + Principal Architect

## السياق

كلميرون منصّة SaaS متعدّدة المستأجرين (multi-tenant) لـ:

- ~10,000 مستخدم متوقّع في السنة الأولى (مصر + السعودية + الإمارات).
- 16 وكيل AI، كل واحد يقرأ/يكتب بيانات user-scoped.
- متطلّبات real-time (chat history، agent runs، notifications).
- متطلّبات أمان صارمة: row-level security per `userId`.
- فريق مبكّر صغير (≤ 3 مهندسين) لا يقدر على تشغيل DB cluster.
- Stack مُعتمد على Google Cloud (Gemini AI، Cloud Run للـ sidecars، Firebase Auth).
- لغة عربية + بحث نصّي بسيط (مش بحث متقدّم — لذلك Algolia/Meilisearch خارج النطاق).

كان السؤال: نختار قاعدة بيانات **document-oriented managed** (Firestore، MongoDB Atlas)، أو **relational managed** (Supabase، PlanetScale)، أو **self-hosted**.

## القرار

نستخدم **Google Cloud Firestore** كقاعدة بيانات أساسيّة، مع **Firebase Admin SDK** على الـ server و **Firebase Web SDK** على الـ client.

العمليّات الحسّاسة (billing، membership، cost ledger، deletion queue) تتمّ **حصراً** عبر Admin SDK من API routes؛ الكلاينت **يُمنَع** من الكتابة المباشرة عبر `firestore.rules`.

البيانات التحليليّة (data warehouse) تُنقَل إلى **DuckDB** محلّيّاً في `services/data-warehouse/` عبر pipeline يومي (`dw:build`).

## البدائل المُفحوصة

### MongoDB Atlas
**رفضناه لأنّ:**
- لا يوجد row-level security مدمج → نحتاج middleware معقّد على كل query.
- لا real-time listeners مجّاناً (Atlas Triggers مدفوعة).
- يحتاج SDK منفصل للموبايل (لا توجد PWA-first story).
- Cold-start أبطأ من Firestore على Cloud Run/Vercel.
- التسعير أعلى لـ < 100K reads/day (نقطة انطلاقنا).

### Supabase (Postgres)
**رفضناه لأنّ:**
- relational schema يفرض migrations مع كل تغيير في شكل بيانات الوكلاء (شكل الـ output يتغيّر بسرعة في MVP).
- RLS قويّ لكن نحتاج خبرة Postgres ليست متوفّرة في الفريق.
- Realtime عبر `pg_logical` أبطأ من Firestore listeners للـ low-write loads.
- لا يندمج بشكل native مع Firebase Auth (نحتاج JWT bridge custom).

### PlanetScale (MySQL)
**رفضناه لأنّ:**
- نفس مشكلة الـ schema migrations.
- ضعيف في الـ realtime.
- لا يندمج مع Firebase Auth.

### Self-hosted Postgres على Cloud SQL
**رفضناه لأنّ:**
- يحتاج DBA — الفريق لا يحتمل ذلك.
- Cost ثابت أعلى من Firestore في الـ low-traffic.

## النتائج

### Positive
- ✅ **Time to MVP أسرع 3×** — لا migrations، لا schema design ابتدائي.
- ✅ **Row-level security مدمج** عبر `firestore.rules` (انظر `firestore.rules`).
- ✅ **Realtime مجّاناً** عبر `onSnapshot` listeners.
- ✅ **اندماج native مع Firebase Auth** — `request.auth.uid` متاح في الـ rules مباشرةً.
- ✅ **Cost predictable** للـ ≤ 100K reads/day.
- ✅ **Scaling تلقائي** بدون تدخّل.
- ✅ **PWA-friendly** — SDK واحد للـ web + mobile + offline persistence.

### Negative
- ❌ **لا joins** — نحتاج نُزدوج البيانات أو نعمل multi-step reads.
- ❌ **لا transactions عبر collections متعدّدة** بسهولة — Firestore transactions محدودة بـ 500 docs.
- ❌ **التسعير ينفجر فوق 1M reads/day** — حلّناه بـ:
  - `@tthbfo2/firebase-cost-trimmer` لتقليل reads المُتكرّرة.
  - TanStack Query caching في الـ client.
  - DuckDB للتحليلات (بدل ما نقرأ Firestore).
  - Hourly + daily rollups في `cost_rollups` collection.
- ❌ **بحث نصّي ضعيف** — معالج بـ embeddings-worker (sidecar) + vector search عبر Qdrant (مستقبلاً).
- ❌ **Vendor lock-in** على Google Cloud — مقبول استراتيجيّاً لأنّ كامل الـ stack (Gemini، Cloud Run) Google.

### Neutral
- ⚪ مهارات الفريق ركّزت على Firebase — لو احتجنا توسيع التوظيف، نوظّف Firebase devs.
- ⚪ كل ما هو "تحليل" في DuckDB، كل ما هو "operational" في Firestore — فصل واضح.

## القواعد الذهبيّة المُشتقّة من هذا القرار

1. **كل query لها `.limit()` صريح.** بدون استثناء (انظر `AGENTS.md` §6).
2. **العمليّات الحسّاسة على الـ server فقط** عبر Admin SDK. الكلاينت لا يكتب في `user_credits`، `workspaces/{wid}/members`، `cost_events`، إلخ.
3. **`request.auth.uid` في كل قاعدة** — لا قواعد `if true`.
4. **Composite indexes في `firestore.indexes.json`** — يُدار في git.
5. **قواعد Firestore تُختبَر** عبر `npm run test:rules`.

## المراجع

- `firestore.rules` — التطبيق الفعلي للـ row-level security.
- `firestore.indexes.json` — الـ indexes المُهيَّأة.
- `src/lib/firebase.ts` — client init مع persistence chain.
- `src/lib/firebase-admin.ts` — server init.
- `services/data-warehouse/` — DuckDB pipeline للتحليلات.
- `docs/THREAT_MODEL.md` — نموذج التهديد الذي يفترض هذا القرار.
- `replit.md` — قسم "Recent Major Updates" يحوي تحسينات الـ cost trimming.
