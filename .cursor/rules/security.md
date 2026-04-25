---
description: قواعد الأمان الإلزاميّة — تطبيق OWASP Top 10 + OWASP LLM/Agent Top 10
alwaysApply: true
---

# Security Rules — Kalmeron AI

أبحاث 2026 (Stanford + Snyk) تقول إن **45% من الكود المُولَّد بالـ AI يُدخل ثغرات أمنيّة**. هذه القواعد مُصمَّمة لتُوقفك قبل ما تُخطئ.

## 1. مرجع الأمان في المستودع
- `firestore.rules` — مغلق افتراضيّاً (`if false`)
- `next.config.ts` — CSP + HSTS + COOP + Permissions-Policy
- `docs/THREAT_MODEL.md` — التهديدات + التخفيفات
- `docs/SECRETS_ROTATION.md` — جدول تدوير المفاتيح
- `docs/AGENT_GOVERNANCE.md` — مخاطر OWASP للوكلاء + Microsoft Toolkit
- `src/ai/safety/` — plan-guard + sanitize-context + ClawGuard-style defense
- `src/lib/rate-limit.ts` — حدود الطلبات
- `src/lib/security/api-keys.ts` — إدارة مفاتيح API

## 2. OWASP Top 10 — تطبيقها في Kalmeron

### A01: Broken Access Control
- ✅ كل document Firestore يُفحَص بـ `userId == request.auth.uid` في الـ rules.
- ✅ كل API route تستدعي `auth()` من `src/lib/auth.ts` قبل التنفيذ.
- ❌ ممنوع `if true` في الـ rules.

### A02: Cryptographic Failures
- ✅ HSTS مفعَّل (`max-age=63072000`).
- ✅ كلمات السر تُدار بـ Firebase Auth (لا نخزّنها).
- ✅ `idToken` لا يُسجَّل أبداً.

### A03: Injection
- ✅ كل input من شبكة → `zod.parse(input)`.
- ✅ Prompt injection → `sanitizeContext()` قبل دمج RAG في system prompt.
- ✅ XSS → `xss` library على HTML user-provided.

### A04: Insecure Design
- ✅ Threat model مكتوب في `docs/THREAT_MODEL.md` ويُحدَّث ربع سنويّاً.
- ✅ ADRs لكل قرار أمني/معماري في `docs/decisions/`.

### A05: Security Misconfiguration
- ✅ CSP + headers في `next.config.ts`.
- ✅ `serverExternalPackages` للـ packages اللي تحتاج Node.
- ✅ `reactStrictMode: true`.

### A06: Vulnerable Components
- ✅ Dependabot في `.github/dependabot.yml`.
- ✅ `npm audit` في CI.

### A07: Identification + Authentication Failures
- ✅ Firebase Auth (Google + Email + Phone OTP).
- ✅ Session persistence chain صريحة (`indexedDB → local → session → memory`).
- ✅ Email verification متاحة (`isVerified()` helper في Firestore rules).

### A08: Software + Data Integrity Failures
- ✅ Webhooks موقَّعة (Stripe, Fawry, SendGrid).
- ✅ Idempotency keys في Stripe webhooks.
- ✅ `package-lock.json` مُحدَّث.

### A09: Security Logging + Monitoring Failures
- ✅ Sentry لكل client + server + edge.
- ✅ Langfuse لكل LLM call.
- ✅ pino structured logs.
- ❌ لا تُسجَّل PII (email, phone, idToken, محتوى محادثات).

### A10: Server-Side Request Forgery (SSRF)
- ✅ `connect-src` في CSP يقيّد الوجهات.
- ✅ كل URL من المستخدم يُفحَص بـ allow-list قبل `fetch`.

## 3. OWASP LLM Top 10 — تطبيقها

| المخاطر | التخفيف في Kalmeron |
|---|---|
| **LLM01: Prompt Injection** | `sanitizeContext()` — يحذف instruction-like patterns من RAG |
| **LLM02: Insecure Output Handling** | كل output من LLM يمرّ بـ `xss()` قبل العرض كـ HTML |
| **LLM03: Training Data Poisoning** | لا fine-tuning محلّي؛ نستخدم Gemini 2.5 الرسمي فقط |
| **LLM04: Model DoS** | Rate limiting على `/api/chat` + token budget per user |
| **LLM05: Supply Chain Vulnerabilities** | `npm audit` + Dependabot + pin إصدارات الـ AI SDKs |
| **LLM06: Sensitive Information Disclosure** | `redact` في pino + لا logging للـ user prompts |
| **LLM07: Insecure Plugin Design** | كل tool في `plan-guard.ts` له `risk` level + allow-list |
| **LLM08: Excessive Agency** | أدوات `risk: 'critical'\|'high'` تحتاج موافقة بشريّة |
| **LLM09: Overreliance** | Disclosures في كل رد ("هذه إجابة مولّدة، تحقّق دائماً") |
| **LLM10: Model Theft** | API keys مُدارة في Vercel/Replit Secrets، لا في الكود |

## 4. OWASP Agent Top 10 (2026)

راجع `docs/AGENT_GOVERNANCE.md` للتفاصيل الكاملة.

## 5. ممارسات يوميّة

### قبل كل commit
```bash
# 1. تأكّد أنّك ما لمست secrets
git diff --staged | grep -iE "(api[_-]?key|secret|password|token|firebase[_-]?service)" && echo "⚠️  STOP" || echo "✅"

# 2. تأكّد من القواعد
npm run test:rules

# 3. typecheck + lint
npm run typecheck && npm run lint
```

### عند إضافة API endpoint جديد
1. ✅ يستدعي `auth()` أوّل سطر.
2. ✅ يحوي `rate-limit`.
3. ✅ يحوي `zod.parse()` للـ body.
4. ✅ Error handler لا يُسرّب stack trace للـ client.
5. ✅ لو يلمس Firestore: query بها `.limit()` + `where('userId', '==', auth.uid)`.

### عند إضافة وكيل جديد
1. ✅ System prompt ثابت — ممنوع دمج user input مباشرةً.
2. ✅ كل tool له `risk` level.
3. ✅ Tools عالية المخاطر تستدعي `requireHumanApproval()`.
4. ✅ Output يمرّ بـ `xss()` لو سيُعرض كـ HTML.
5. ✅ System Card في `docs/agents/` (انظر `_TEMPLATE.md`).

## 6. حالات لازم تُبلِّغ المستخدم فوراً
- اكتشاف `if true` في `firestore.rules`.
- اكتشاف secret في الكود.
- اكتشاف query Firestore بدون `limit()`.
- اكتشاف tool وكيل بدون `risk` level.
- فشل `npm audit` بـ Critical/High.

في كل هذه الحالات: **توقّف، أبلِغ، اطلب توجيهاً** قبل المتابعة.
