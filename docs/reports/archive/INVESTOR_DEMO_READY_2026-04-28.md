# كلميرون — تقرير جاهزية عرض المستثمرين
**التاريخ:** 28 أبريل 2026  
**المرحلة:** Seed Round  
**المُعد بواسطة:** Replit Agent (جلسة تحضير العرض)

---

## ✅ ما تم إنجازه في هذه الجلسة

### 1) خدمات Python (sidecars) — 4/4 تعمل
| الخدمة | المنفذ | الحالة | الزمن |
|---|---|---|---|
| PDF Worker | 8000 | ✅ ok | ~37 ms |
| Egypt Calc | 8008 | ✅ ok | ~20 ms |
| Embeddings Worker | 8099 | ✅ ok | ~18 ms |
| LLM Judge | 8080 | ✅ ok (stub mode) | ~17 ms |

- ثُبِّتت الحزم: `fastapi`, `uvicorn[standard]`, `pydantic`, `pypdf`, `python-multipart`, `regex`, `google-generativeai`, `hypothesis`, `pytest`, `fastembed`, `numpy`.
- اختبار حقيقي: `Egypt-Calc /income-tax` على راتب 180,000 ج.م. → ضريبة سنوية 21,750 ج.م. (رد صحيح، تفصيل الشرائح كامل).
- اختبار حقيقي: `Embeddings /embed` → نواتج بُعد 384 لنموذج multilingual MiniLM.

### 2) صفحات عامة جديدة (4 صفحات)
| المسار | الحالة | الوصف |
|---|---|---|
| `/investors` | ✅ 200 | صفحة المستثمرين الكاملة: Hero + سوق + مشكلة/حل + تقنية + خارطة طريق + CTA |
| `/about` | ✅ 200 | من نحن: قصة، مهمة، رؤية، قيم، فريق، تواصل |
| `/affiliate` | ✅ 200 | برنامج الشركاء: 30% × 12 شهر، حاسبة أرباح، CTA |
| `/affiliate-terms` | ✅ 200 | شروط الإحالة الكاملة (9 أقسام، قانون مصري) |

كل الصفحات: RTL سليم، PublicShell موحّد، Open Graph metadata، عربية فصحى.

### 3) فحوصات شاملة
**صفحات عامة (200 OK):** `/`, `/pricing`, `/demo`, `/terms`, `/privacy`, `/compliance`, `/changelog`, `/first-100`, `/auth/login`, `/auth/signup`, `/about`, `/affiliate`, `/affiliate-terms`, `/investors`.

**API endpoints:**
- `/api/health` → 200
- `/api/social-proof` → 200
- `/api/investor/health` → 200 (readinessScore: **60/100**, criticalIssues: **0**)
- `/api/investor/metrics` → 200
- `/api/investor/seed` → 401 (محمي بشكل صحيح)

---

## 📊 Investor Health Snapshot
```json
{
  "readinessScore": 60,
  "criticalIssues": 0,
  "sidecars": [
    { "name": "PDF Worker",        "ok": true, "latencyMs": 37 },
    { "name": "Egypt Calc",        "ok": true, "latencyMs": 20 },
    { "name": "Embeddings Worker", "ok": true, "latencyMs": 18 },
    { "name": "LLM Judge",         "ok": true, "latencyMs": 17 }
  ]
}
```
> النقاط الأربعون المتبقية في الـ readinessScore تعود للمفاتيح المفقودة (انظر القسم التالي) — لا توجد أخطاء كود حرجة.

---

## ⚠️ ما يحتاج تدخّلاً منك (لا يستطيع الوكيل تنفيذه)

### 🔴 إلزامي قبل العرض الحي
1. **`GOOGLE_GENERATIVE_AI_API_KEY`** — لتفعيل الردود الحقيقية للـ 16 وكيل  
   المصدر: <https://aistudio.google.com/app/apikey>
2. **`FIREBASE_ADMIN_PROJECT_ID`**, **`FIREBASE_ADMIN_CLIENT_EMAIL`**, **`FIREBASE_ADMIN_PRIVATE_KEY`**  
   المصدر: Firebase Console → Project Settings → Service Accounts → "Generate new private key"
   > متغيّرات `NEXT_PUBLIC_FIREBASE_*` (7 متغيّرات للـ client) مضبوطة بالفعل في `.replit`.

### 🟡 اختياري لتجربة عرض كاملة
3. **`STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY`** (test keys) — للتظاهر بالدفع.
4. **`PLATFORM_ADMIN_UIDS`** (UID مستخدمك في Firebase) — للوصول لصفحات الإدارة.
5. **`HF_TOKEN`** — لرفع حدود تنزيل نماذج HuggingFace في Embeddings Worker.

### 🟢 للإنتاج بعد العرض
6. **Fawry merchant code** — للدفعات المصرية.
7. **`RESEND_API_KEY`** — لإرسال الإيميلات المعاملاتية.
8. **`SENTRY_DSN`** — للمراقبة في الإنتاج.
9. نشر الـ sidecars على Cloud Run (أو ما يعادله) لإنتاج موثوق.

---

## 🎯 مسار العرض المقترح (15 دقيقة)
1. **(2 د) `/`** → قصة المشكلة، Hero
2. **(2 د) `/investors`** → السوق، التقنية، خارطة الطريق
3. **(3 د) `/demo`** → سيناريو حي
4. **(5 د) `/dashboard`** → تشغيل 2-3 وكلاء فعلياً
5. **(2 د) `/investor/health`** → الأرقام التقنية الحقيقية
6. **(1 د) `/pricing`** → نموذج الإيرادات

---

## 📌 ملاحظات
- الخادم يعمل على `localhost:5000` (Next.js 16.2.4 + Turbopack).
- كل الـ sidecars تشتغل وتستجيب بدون GEMINI_API_KEY (في وضع stub آمن للـ LLM Judge).
- `tsconfig.tsbuildinfo` كبير (≈1MB) — قد يبطئ أوّل بناء، لكن لا يؤثّر على dev.
- لا توجد تغييرات على `firestore.rules`, `tsconfig.json`, أو إعدادات TypeScript الصارمة في هذه الجلسة.

