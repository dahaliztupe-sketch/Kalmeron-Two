# مهام Firebase اليدوية المطلوبة منك

> آخر تحديث: 2026-04-25
> هذه المهام **يجب أن تُنفَّذ يدوياً** من لوحة تحكم Firebase / Google Cloud — لا يمكن للـ agent تنفيذها لأنّها تحتاج صلاحيّات Owner على المشروع.

أصلحتُ من جانب الكود كل ما يخصّ:
1. ثبات جلسة تسجيل الدخول (persistence chain صريحة).
2. التحويل التلقائي إلى `signInWithRedirect` على الموبايل والـ in-app browsers.
3. تسريع تحميل صفحات `/auth/login` و `/auth/signup`.
4. إصلاح الـ responsive على الهاتف.

لكن لكي يعمل تسجيل الدخول بـ Google **في الإنتاج (n-two.vercel.app)** ولا يطلع المستخدم من حسابه، يلزم تنفيذ المهام التالية في Firebase Console:

---

## 🔴 P0 — مهام حرجة (بدونها سجّل الدخول يفشل في الإنتاج)

### 1. إضافة نطاق Vercel إلى Authorized Domains
**أين:** Firebase Console → Authentication → Settings → **Authorized domains**

أضف **كل** النطاقات التالية (لو ناقص واحد، Google Sign-in بيرمي `auth/unauthorized-domain`):

```
n-two.vercel.app
*.vercel.app                  ← لتغطية preview deployments
kalmeron.app                  ← الدومين الإنتاجي النهائي إن وُجد
www.kalmeron.app
localhost                     ← يكون مضافاً تلقائيّاً
```

> ⚠️ إن غيّرتَ الدومين النهائي لاحقاً، أضِفه هنا أوّلاً قبل النشر.

### 2. تفعيل Google كـ Sign-in Provider
**أين:** Firebase Console → Authentication → **Sign-in method** → Google

- Status: **Enabled**
- Project support email: ضع إيميلك
- احفظ الـ **Web SDK configuration** (Web client ID + secret) — Firebase يولِّدها تلقائياً، لكن تأكّد أنّها ظاهرة.

### 3. التحقّق من إعدادات OAuth Consent Screen في Google Cloud
**أين:** [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **OAuth consent screen** (نفس الـ project ID المربوط بـ Firebase)

- User type: **External**
- Publishing status: لو ما زال `Testing`، أضف إيميلات المستخدمين كـ Test users، أو اضغط **PUBLISH APP** ليصبح متاحاً للجميع.
- Authorized domains: أضف نفس قائمة النطاقات أعلاه.
- Scopes: تأكّد من وجود `email`, `profile`, `openid`.

> هذا أهمّ سبب يخلّي المستخدم يضغط "تسجيل الدخول" ولا يحدث شيء — التطبيق في وضع Testing وإيميله مش في القائمة.

### 4. تفعيل Identity Toolkit API
**أين:** [Google Cloud Console](https://console.cloud.google.com/apis/library) → ابحث عن:
- **Identity Toolkit API** → Enable
- **Token Service API** → Enable

---

## 🟡 P1 — مهام مهمّة (لتحسين موثوقيّة الجلسة على الموبايل)

### 5. تفعيل reCAPTCHA Enterprise (موصى به للإنتاج)
**أين:** Firebase Console → Authentication → **Settings** → reCAPTCHA Enterprise

تفعيل هذا يمنع الـ bots من إنشاء حسابات مزيّفة، وكمان يحسّن نسبة نجاح الـ Google Sign-in على الموبايل (Firebase يستخدم reCAPTCHA كـ fallback لتحقّق الأمان).

### 6. تأكيد متغيّرات البيئة في Vercel
**أين:** [Vercel Dashboard](https://vercel.com/dashboard) → مشروعك → Settings → **Environment Variables**

تحقّق من وجود **كلّ** هذه المتغيّرات (بقيم الإنتاج، ليست قيم الـ dev):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN          ← ⚠️ يجب أن يكون <project-id>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

> أكثر خطأ شائع: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` يكون فيه `https://` أو `/` في النهاية. القيمة الصحيحة هي مجرّد `your-project.firebaseapp.com` (بدون بروتوكول، بدون مسار).

بعد التعديل: اضغط **Redeploy** على آخر deployment ليأخذ القيم الجديدة (Vercel ما يعيد البناء تلقائياً عند تغيير env vars).

### 7. مراجعة Firestore Security Rules
**أين:** Firebase Console → Firestore Database → **Rules**

تأكّد أنّ الـ rules تسمح للمستخدم المسجَّل بقراءة/كتابة وثيقته في `users/{uid}`:

```
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

(الملف عندك في الكود `firestore.rules` — اضغط **Publish** عليه من Console أو شغّل `firebase deploy --only firestore:rules`).

---

## 🟢 P2 — تحسينات اختياريّة

### 8. تفعيل App Check (حماية من إساءة الاستخدام)
**أين:** Firebase Console → **App Check**

تفعيل App Check يمنع الـ scripts الخارجيّة من استدعاء Firestore/Auth بدون marker شرعي. يحسِّن الأمان ويقلِّل التكلفة. يحتاج إعداد reCAPTCHA v3 site key.

### 9. إعداد Custom Domain لـ Auth (إن أردت)
**أين:** Firebase Console → Authentication → Settings → **Custom domain**

افتراضيّاً، الـ redirect popup يطلع من `<project-id>.firebaseapp.com` — وهذا قد يبدو غريباً للمستخدم. ربط custom domain (مثل `auth.kalmeron.app`) يعطي تجربة أكثر احترافيّة.

### 10. مراجعة Quotas في Google Cloud
**أين:** Google Cloud Console → APIs & Services → **Quotas**

- Identity Toolkit: تأكّد من حدّ **Sign-ins per minute** > 1000.
- Firestore: راقب الـ **Read/Write operations per day**.

---

## ✅ كيف تتحقّق أنّ كل شيء يعمل

1. افتح `https://n-two.vercel.app/auth/signup` في **متصفّح خاص (Incognito)**.
2. اضغط "التسجيل باستخدام Google" — يجب أن تفتح صفحة اختيار حساب Google خلال ثانيتين على الأكثر.
3. بعد اختيار الحساب، يجب أن يحوِّلك إلى `/onboarding` خلال ثانيتين.
4. **أغلق المتصفح كلياً وأعد فتحه** ثم ادخل `n-two.vercel.app/dashboard`. يجب أن يفتح بدون طلب تسجيل دخول مرّة أخرى → الـ persistence يعمل.
5. كرّر نفس الاختبار من **هاتف موبايل** (Chrome/Safari) — يجب أن يستخدم redirect-flow بدل الـ popup ويعمل بسلاسة.
6. كرّر من **متصفّح Telegram/WhatsApp** (افتح اللينك من رسالة) — يجب أن يعمل redirect-flow بدون أن تُفتح نافذة فارغة.

---

## ❓ لو ما زالت المشكلة قائمة

اختبر في console المتصفّح (`F12 → Console`) وابحث عن أيّ من هذه الأخطاء وأرسلها لي:

| الخطأ | المعنى | الحلّ |
|---|---|---|
| `auth/unauthorized-domain` | الدومين مش في Authorized domains | المهمّة #1 |
| `auth/popup-blocked` | المتصفّح حظر النافذة | الكود الآن يحوِّل تلقائياً لـ redirect — إن استمرّت تأكّد من نشر آخر إصدار |
| `auth/network-request-failed` | الإنترنت أو CSP | تحقّق من أنّ `connect-src` في `next.config.ts` يسمح بـ `*.googleapis.com` (موجود حالياً) |
| `auth/operation-not-allowed` | Google sign-in مش مفعَّل | المهمّة #2 |
| `auth/internal-error` | غالباً مشكلة OAuth Consent | المهمّة #3 |

---

أبلغني بعد ما تنتهي من المهام **P0 (1-4)** وسأتأكّد معك أنّ كل شيء يعمل في الإنتاج.
