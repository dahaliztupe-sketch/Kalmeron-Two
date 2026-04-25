# 0003 — CSP صارم مع `unsafe-inline` للـ styles فقط

**الحالة:** Accepted
**التاريخ:** 2026-04-25
**المقرِّرون:** Security + Frontend

## السياق

كلميرون يحتاج Content-Security-Policy لمنع XSS وإكسلت بيانات الـ tenants. لكن:

- Tailwind v4 يحقن styles inline في build time → نحتاج `'unsafe-inline'` في `style-src`.
- Framer Motion يحقن styles inline runtime.
- Stripe.js + Sentry يحتاجان origins خارجيّة.
- Firebase + Gemini APIs تحتاج WebSocket + REST.
- في dev: HMR يحتاج `'unsafe-eval'` و WS local.

## القرار

في `next.config.ts`، `buildCsp()`:

- **prod:** `script-src` بدون `'unsafe-eval'`، مع `'unsafe-inline'` للتوافق مع Next.js bootstrap.
- **prod:** `style-src` بـ `'unsafe-inline'` (مقبول لأنّ XSS عبر styles محدود الأثر).
- **prod:** `connect-src` allow-list صريح للـ origins المعروفة.
- **dev:** `'unsafe-eval'` مفعَّل + WebSocket local.
- `frame-ancestors: 'self'` يمنع clickjacking.
- `object-src: 'none'` يمنع plugins.
- `Content-Security-Policy-Report-Only` في dev، `Content-Security-Policy` في prod.

عند إضافة origin خارجي جديد، يُحدَّث `next.config.ts` **+ يُذكر السبب في PR**.

## البدائل المُفحوصة

### CSP nonces (Next.js automatic strict CSP)
**مؤجَّل لأنّ:**
- Next.js 16 يدعمه لكن يحتاج middleware + edge runtime لكل route.
- مشروعنا يخلط Node + Edge — لا نقدر نوحّد بسهولة.
- يحتاج اختبار تكاملي شامل.
- ADR مستقبلي يُفتح حين نهاجر كل API إلى Edge.

### Hash-based CSP
**رفضناه لأنّ:**
- يفشل مع Tailwind dynamic + Framer Motion.

### بدون `'unsafe-inline'` أبداً
**رفضناه لأنّ:**
- يكسر Tailwind v4 + Framer Motion كاملاً.

## النتائج

### Positive
- ✅ XSS عبر script blocked في prod.
- ✅ SSRF + clickjacking blocked.
- ✅ Origins خارجيّة محدودة بـ allow-list.

### Negative
- ❌ `'unsafe-inline'` في styles = XSS عبر CSS injection ممكن نظريّاً (محدود الأثر).
- ❌ كل integration جديد يحتاج تحديث `next.config.ts`.

## المراجع
- `next.config.ts` → `buildCsp()`
- `docs/THREAT_MODEL.md`
