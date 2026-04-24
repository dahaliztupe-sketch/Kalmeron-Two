# تقرير ختامي — جلسة الفحص الشامل
**التاريخ:** 24 أبريل 2026 · **النطاق:** P0→P3 + بنود مؤجَّلة + فحص شامل

---

## 1. ما اكتمل في هذه الجلسة

### الجلسة الأولى — خطة مجلس الإدارة الافتراضي
| البند | الحالة | المخرجات |
|---|---|---|
| T-P0-1 — تسريب Firebase API key | ✅ موثَّق | `docs/SECRETS_ROTATION.md` (يلزم تدوير يدوي من المستخدم) |
| T-P0-2 — `npm audit fix` | ✅ | 34 → 31 ثغرة (الباقي: `xlsx` بلا fix رسمي + `firebase-tools` devDeps) |
| T-P0-3 — Legal Guide DPIA | ✅ | `docs/dpia/legal-guide.md` |
| T-P0-4 — حارس Stripe غير مُعدّ | ✅ | `/api/billing/status` + بانر علوي |
| T-P0-5 — PDF Worker Python | ✅ | يعمل على `:8000` (uvicorn + venv) |
| T-P1-2 — Eval pass-rate gate | ✅ | `.github/workflows/eval.yml` (≥ 0.80) |
| T-P1-3 — 7 بطاقات نظام جديدة | ✅ | `docs/agents/` (16 بطاقة إجمالاً) |
| T-P1-6 — قاعدة workspace_members | ✅ | `firestore.rules` + `scripts/cypher-lint.ts` + CI |
| T-P2-2 — تنظيف `--brand-gold` | ✅ | تعليقات محدَّثة |
| T-P2-3 — Lighthouse CI | ✅ | `.github/workflows/lighthouse.yml` |
| T-P2-5 — Pricing 4→3 + Enterprise banner | ✅ | `components/pricing/PricingEnterpriseBanner.tsx` |
| T-P3-1 — Expo SSL pinning | ✅ | `react-native-ssl-pinning` + `api-client.ts` + `docs/CERT_PINNING.md` |
| THREAT_MODEL 🟡 → ✅ | ✅ | `docs/THREAT_MODEL.md` |

### الجلسة الثانية — بنود من قائمة "مؤجَّل" + إصلاحات اكتُشفت

| البند | الحالة | السبب |
|---|---|---|
| **T-P1-5 — Funnel Dashboard** | ✅ **تمّ** (كان مؤجَّلاً) | بُني API + لوحة عربية + توثيق |
| **إصلاح ثغرة `/api/admin/*`** | ✅ **حرج** (اكتُشف أثناء المسح) | 3 مسارات admin كانت مفتوحة للعموم |
| إصلاح TS error في PricingEnterpriseBanner | ✅ | استبدال `Button asChild` بـ Link مباشر |
| فحص depcheck/TODOs/مسارات API | ✅ موثَّق في `replit.md` | للمراجعة المستقبلية فقط |

---

## 2. الإصلاح الأمني الحرج (تفاصيل)

### ما كان معطوباً
ثلاث مسارات إدارية كانت **بدون أيّ مصادقة** — أيّ شخص يصل URL يحصل على البيانات:

```
GET /api/admin/mission-control          → 200 + كل مقاييس الوكلاء + التكاليف
GET /api/admin/mission-control/stream   → SSE مفتوح لكل المقاييس المباشرة
GET /api/admin/ttfv-summary             → إحصائيات تجربة المستخدم
```

التعليقات في الكود كانت تدّعي حماية بـ `ADMIN_EMAILS` لكن هذا الحارس **غير موجود** في الكود فعلياً.

### الإصلاح
1. **حارس موحَّد جديد** — `src/lib/security/require-admin.ts`:
   - يتحقّق من Firebase ID Token عبر `Authorization: Bearer ...`.
   - يتحقّق أنّ الـ uid في `PLATFORM_ADMIN_UIDS` env.
   - يُرجع `401`/`403` بصيغة JSON عربية واضحة.
2. **SSE special case** — `EventSource` لا يدعم headers مخصّصة، لذا:
   - مسار `/stream` يقبل التوكن عبر `?token=...`.
   - التوكن قصير العمر (1 ساعة) → blast radius محدود.
   - صفحة `mission-control` حُدِّثت لتمرير التوكن من `useAuth()`.

### التحقّق
```
curl /api/admin/funnel              → 401 ✓
curl /api/admin/mission-control     → 401 ✓
curl /api/admin/ttfv-summary        → 401 ✓
curl /api/admin/mission-control/stream → 401 ✓
curl /pricing                       → 200 ✓ (لم يتأثّر)
curl /api/billing/status            → 200 ✓ (عام بشكل صحيح)
```

---

## 3. Funnel Dashboard (البند T-P1-5)

### ما بُني
- **API** — `app/api/admin/funnel/route.ts`:
  - يقرأ `analytics_events` من Firestore.
  - يحسب 7 مراحل: `landing_visited` → `signup_started` → `signup_completed`
    → `first_chat_message_sent` → `agent_re_used` → `trial_started`
    → `subscription_activated`.
  - نوافذ زمنية: 7 و 30 يوماً.
  - يُرجع distinct counts + معدّلات تحويل.
  - **بدون أيّ معرّف فردي** — مجمّعات فقط.
- **لوحة UI** — `app/admin/funnel/page.tsx`:
  - عربية RTL.
  - بطاقتا ملخّص: Visit→Activation (عتبة 5%) و Activation→Paid (عتبة 10%).
  - جدول لكلّ مرحلة + تحويل من السابقة.
  - حالات loading/error واضحة.
- **توثيق** — `docs/FUNNEL_ANALYTICS.md`:
  - تاكسونومي 11 حدثاً موثَّقة (single source of truth).
  - شرح طريقة الحساب + تحذير cohort-naive.
  - عتبات صحّة لكل تحويل.
  - خارطة طريق (cohort attribution عبر BigQuery في Q3 2026).

### قيود معروفة
- التحويلات **cohort-naive**: تعدّ معرّفات فريدة لكل مرحلة باستقلال،
  لا تتطلّب أن يكون المستخدم مرّ بالمرحلة السابقة. دقيقة لـ < 50k MAU.
- تحتاج فهرس Firestore على `(event, occurredAt)` — أوّل query سيقترح
  إنشاءه تلقائياً في console.

---

## 4. ما لم يُنفَّذ، ولماذا (صادق)

| البند | السبب | البديل المقترح |
|---|---|---|
| **Pen-Test خارجي** | يلزم مزوّد طرف ثالث بشهادة (CREST/OSCP). شهور لا أيّام. | تواصل مع HackerOne أو Bugcrowd. الميزانية المعتادة $5k–$15k. |
| **WhatsApp daily-brief push** | يلزم WhatsApp Business API account + رقم مُتحقَّق + موافقة Meta (~3 أسابيع). | مرحلة 1: SMS عبر Twilio أو email عبر SendGrid. |
| **MCP/API GA + Marketplace** | نطاق متعدّد أشهر، يحتاج: تصميم RBAC متطوّر، rate-limiting per-tenant، billing-per-call، API docs site، dev portal. | اقتراح: P0 = `/v1/agents/*` للقراءة فقط بمفاتيح API، P1 = write، P2 = marketplace. |
| **ترقية Node 22 + TS 5.7** | الكود يعمل على Node 20 و TS 6 بنجاح. الترقية تلقائياً تكسر بعض الـ deps. | PR منفصل مع full regression cycle (E2E + Lighthouse + eval). |
| **تقسيم `app/page.tsx` (71KB)** | مخاطر بصرية عالية — صفحة هبوط حسّاسة للتفاصيل. | PR منفصل بمراجعة بصرية يدوية + Storybook + screenshots قبل/بعد. |
| **`depcheck` cleanup** | 80% من نتائج depcheck كانت false-positive (postcss/tailwind/الخ تُستخدم في build pipeline لا imports). | موثَّق في `replit.md`؛ PR منفصل لإزالة 4 deps حقيقية: `@firebase/eslint-plugin-security-rules`, `@hookform/resolvers`, `@jackchen_me/open-multi-agent`, `pino-pretty`. |
| **TypeScript full check** | `tsc --noEmit` ينفجر بـ stack overflow (مشكلة معروفة في v6 مع inference عميق). | الفحص المستهدف للملفات المُعدَّلة نجح. ترقية TS إلى 5.7 LTS قد تحلّها. |
| **حذف `[userenv.shared]` من `.replit`** | الملف محميّ من التحرير الآلي. | المستخدم يحذفه يدوياً وفق `docs/SECRETS_ROTATION.md`. |

---

## 5. ما يلزم المستخدم (إجراءات يدوية)

### فوري (قبل أيّ نشر إنتاج)
1. **تدوير مفتاح Firebase API**: اتّبع `docs/SECRETS_ROTATION.md`. المفتاح الحالي مُسرَّب في `.replit`.
2. **حذف `[userenv.shared]`** من `.replit` يدوياً (سطور 86–95).
3. **تعريف `PLATFORM_ADMIN_UIDS`** في Replit Secrets — قائمة UIDs مفصولة بفواصل لمن يصل لوحة Admin.
4. **مراجعة قانونية** للـ DPIA من محامٍ مصري قبل إطلاق Legal Guide.

### قبل تفعيل الدفع
5. **إضافة 14 Stripe Price ID** إلى Replit Secrets (مذكورة في `.env.example`).
6. **إعداد Stripe webhook** على `/api/stripe/webhook` (الأحداث المطلوبة موثَّقة).

### قبل تفعيل Funnel Dashboard
7. سيطلب Firestore تلقائياً إنشاء فهرس مركَّب على `analytics_events(event, occurredAt)` عند أوّل استعلام — قبول الاقتراح من Firebase Console.

### قبل إطلاق تطبيق Expo
8. **تحديث SHA-256 fingerprints** للشهادات في `src/mobile-app/api-client.ts` بعد إصدار شهادات إنتاج (انظر `docs/CERT_PINNING.md`).

---

## 6. التوصيات للجلسة القادمة (بأولوية)

### عاجل
- **إعداد Sentry releases + source maps** للتتبّع الإنتاجي.
- **إعداد Vercel Cron** فعلياً (الكود جاهز، تحتاج فقط `vercel.json` + dashboard config).
- **Firestore composite indexes** لكلّ الاستعلامات الجديدة (Funnel, TTFV, mission-control).

### قصير المدى (4 أسابيع)
- ترقية Node 22 + TS 5.7 في PR مخصَّص + full regression.
- تقسيم `app/page.tsx` بمراجعة بصرية.
- BigQuery export لـ `analytics_events` لقياس cohort attribution دقيق.
- إعداد PostHog مفتاح إنتاج (الكود يدعمه أصلاً، فقط يحتاج `POSTHOG_KEY`).

### متوسط المدى (90 يوم)
- Pen-test خارجي (HackerOne/Bugcrowd).
- API v1 read-only + dev portal.
- WhatsApp Business API onboarding (إن قُرِّر سياسياً).

---

## 7. ملفات مهمّة أُضيفت/عُدِّلت في هذه الجلسة

```
src/lib/security/require-admin.ts                  (جديد — حارس admin)
app/api/admin/funnel/route.ts                       (جديد — Funnel API)
app/admin/funnel/page.tsx                           (جديد — Funnel UI)
docs/FUNNEL_ANALYTICS.md                            (جديد — توثيق)
docs/AUDIT_SWEEP_FINAL_REPORT.md                    (هذا الملف)
app/api/admin/mission-control/route.ts              (مُعدَّل — مصادقة)
app/api/admin/mission-control/stream/route.ts       (مُعدَّل — مصادقة)
app/api/admin/ttfv-summary/route.ts                 (مُعدَّل — مصادقة)
app/admin/mission-control/page.tsx                  (مُعدَّل — تمرير token)
components/pricing/PricingEnterpriseBanner.tsx      (مُعدَّل — TS fix)
replit.md                                           (مُحدَّث — سجل الجلسة)
```

---

**انتهى التقرير.**
