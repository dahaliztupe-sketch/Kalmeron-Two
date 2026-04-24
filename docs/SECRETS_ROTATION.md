# Secrets Rotation Runbook
## Kalmeron Two — مرجع تدوير الأسرار

**آخر تحديث:** 24 أبريل 2026 · **المسؤول:** Security Engineering

---

## ⚠️ تنبيه حرج (P0-1) — مفتاح Firebase API مكشوف

### الوضع الحالي
الملف `.replit` يحتوي على مفتاح Firebase API + معرّفات المشروع داخل الكتلة `[userenv.shared]` (الأسطر 86-95).
هذا الملف مُلتزَم في Git ويُعرَض في كل clone للمستودع.

### المخاطر
- **استنزاف الحصة:** أي طرف ثالث يقرأ المفتاح يستطيع توليد طلبات Firebase Auth/Identity وتضخيم فاتورتك.
- **انتحال الهوية على مستوى المشروع:** مع مفتاح API + Project ID + App ID + Sender ID، يمكن المهاجم محاولة:
  - تسجيل مستخدمين spam في `kalmeron-two` Firebase project.
  - استدعاء Identity Toolkit endpoints بمعدّل عالٍ (إن لم يكن App Check مُفعَّل).
- **تتبُّع تاريخ Git:** التدوير لا يمحو القيمة من commits السابقة. **يجب** اعتبار المفتاح "محروقاً" نهائياً.

### الإصلاح الفوري المطلوب من المستخدم (لا يمكن للوكيل تنفيذه)

#### الخطوة 1 — حذف الكتلة من `.replit`
افتح `.replit` في محرر Replit واحذف الأسطر التالية بالكامل:

```toml
[userenv]

[userenv.shared]
NEXT_PUBLIC_FIREBASE_API_KEY = "..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID = "..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "..."
NEXT_PUBLIC_FIREBASE_APP_ID = "..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = "..."
```

> **سبب:** الوكيل البرمجي مُحظَّر من تعديل `.replit` مباشرةً.

#### الخطوة 2 — تدوير المفتاح في Firebase Console
1. افتح [Firebase Console → Project Settings → General](https://console.firebase.google.com/project/kalmeron-two/settings/general).
2. اذهب إلى تبويب **Web apps**، اختر التطبيق.
3. انسخ **Web API Key** الحالي للحذف لاحقاً من Google Cloud Console.
4. افتح [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials?project=kalmeron-two).
5. **احذف** المفتاح القديم `AIzaSy8RRcFPp...` (تأكد لا يُستخدم في أي مكان آخر).
6. **أنشئ مفتاحاً جديداً** ثم طبّق فوراً:
   - **Application restrictions:** HTTP referrers → أضف:
     ```
     https://*.replit.app/*
     https://*.replit.dev/*
     https://kalmeron.com/*
     https://*.kalmeron.com/*
     ```
   - **API restrictions:** اختر "Restrict key" واسمح فقط بـ:
     - Identity Toolkit API
     - Token Service API
     - Firebase Installations API
     - Firebase Cloud Messaging API
     - Firebase Storage API
     - Cloud Firestore API
7. اضغط **Save**.

#### الخطوة 3 — تخزين المفتاح الجديد في Replit Secrets
1. في Replit، افتح **Tools → Secrets**.
2. أضف 7 أسرار (Type = "Secret"، Environment = "Shared"):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | المفتاح الجديد من الخطوة 2 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `kalmeron-two.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `kalmeron-two` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `kalmeron-two.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `686711690176` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | المعرّف الجديد للتطبيق (إن أُعيد إنشاؤه) أو القديم |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-GLX7PM8VCE` |

#### الخطوة 4 — تفعيل Firebase App Check (دفاع متقدّم)
1. في Firebase Console → **App Check**.
2. اختر تطبيق Web → **Register** مع reCAPTCHA Enterprise (مُوصى به) أو reCAPTCHA v3.
3. أضف مفتاح reCAPTCHA Site Key إلى Replit Secrets كـ `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY`.
4. حدّث `src/lib/firebase.ts` لتشغيل App Check (راجع مثال التهيئة في تعليقات الملف).

#### الخطوة 5 — التحقق
بعد إكمال الخطوات 1-3 وإعادة تشغيل التطبيق:
- افتح `/api/health` — يجب أن يعود `200 OK`.
- افتح صفحة تسجيل الدخول — تأكد أن Google sign-in يعمل.
- افتح Firebase Console → Authentication — يجب أن ترى محاولات تسجيل الدخول الجديدة.

---

## دورة تدوير دورية لجميع الأسرار

| السرّ | الدورة المُوصى بها | المسؤول |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | كل 90 يوم + بعد كل تغيير في الفريق | Security |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | كل 90 يوم + فوراً عند مغادرة عضو | Security |
| `GEMINI_API_KEY` | كل 60 يوم | Engineering |
| `STRIPE_SECRET_KEY` | كل 180 يوم + فور أي شك في تسريب | Finance |
| `STRIPE_WEBHOOK_SECRET` | كل 180 يوم | Finance |
| `LANGFUSE_SECRET_KEY` | كل 90 يوم | Engineering |
| `SENTRY_AUTH_TOKEN` | كل 180 يوم | Engineering |
| `OPENMETER_API_KEY` | كل 90 يوم | Finance |

## الإجراء العام للتدوير
1. أنشئ السرّ الجديد قبل حذف القديم (لتجنّب downtime).
2. حدّث Replit Secrets (Shared environment).
3. أعد تشغيل workflow `Start application`.
4. تحقق عبر `/api/health`.
5. احذف السرّ القديم من المزوّد بعد ساعة من التحقق.
6. سجّل التدوير في `audit_logs` Firestore collection (manual entry حالياً).

## الكشف الاستباقي عن تسريب
- `gitleaks` يعمل في `.github/workflows/security.yml` — يمنع الـ commits التي تحوي أسراراً.
- مراجعة شهرية لـ `.replit`, `package.json`, `*.env*`, `vercel.json`, `firebase.json` للتأكد من خلوّها من قيم سرية.
