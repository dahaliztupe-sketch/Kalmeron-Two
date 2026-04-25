# AGENTS.md — دستور العمل لوكلاء الذكاء الاصطناعي على «كلميرون تو»

> **هذا ملف ملزم.** كل وكيل يعمل على هذا المستودع — Replit Agent، Cursor، Windsurf، Codex CLI، Claude Code، Cline، Aider — مُلزَم بقراءته **قبل** أيّ تعديل.
> دراسة Princeton (2026) أظهرت أن وجود `AGENTS.md` يُقلّص وقت التشغيل ‎28.6%‎ واستهلاك الرموز ‎16.6%‎ مقارنةً بالعمل بدون عقد توجيهي.

---

## 0. نظرة عامة على المشروع

- **الاسم:** Kalmeron AI (`ai-studio-applet`).
- **المنتج:** مقرّ عمليّات ذكي للشركات الناشئة العربية — 16 وكيلاً متخصّصاً (CFO، Legal، Marketing، Sales، HR، Operations، Product، Investor، Customer Voice، Idea Validator، Plan Builder، Mistake Shield، Success Museum، Opportunity Radar، Real Estate، General Chat).
- **الجمهور:** مؤسّسو شركات في مصر والسعودية والإمارات (واجهة عربية، RTL، Cairo/IBM Plex Arabic).
- **الحالة:** Production-ready (54/54 اختبار يمرّ، lint/typecheck نظيفان).

## 1. التقنيات المُعتمدة (لا تستبدلها بدون ADR)

| الطبقة | التقنية | لماذا |
|---|---|---|
| Framework | **Next.js 16** (App Router, Server Components) | RSC + RTL + i18n |
| Lang | **TypeScript 5.7** (`strict: true`, `noImplicitAny: true`) | إلزامي |
| Runtime | Node.js 20 (مسارات API) + Edge (مسارات public) | مختلط |
| DB | **Firebase / Firestore** + Admin SDK | راجع `docs/decisions/0001-use-firestore-over-mongodb.md` |
| Auth | Firebase Auth (Google + Email + Phone OTP) | `contexts/AuthContext.tsx` |
| Cache | TanStack Query 5 + persistQueryClient | `hooks/`, `app/(dashboard)/**` |
| Style | Tailwind 4 + shadcn/ui + Base UI | `app/globals.css` |
| State | React Context + TanStack Query (لا Redux) | — |
| AI | `@ai-sdk/google` (Gemini 2.5)، `@google/genai`، LangGraph، Mastra | `src/ai/` |
| Payments | Stripe + Fawry | `app/api/billing/`, `app/api/webhooks/stripe/` |
| Observability | Sentry + Langfuse + OpenTelemetry + pino | `instrumentation.ts`, `sentry.*.config.ts` |
| Sidecars | 4 خدمات Python FastAPI (PDF, Egypt-Calc, LLM-Judge, Embeddings) | `services/` |
| i18n | `next-intl@4` (ar افتراضي، en) | `i18n/`, `messages/` |
| Tests | Vitest 4 + Playwright + `@firebase/rules-unit-testing` | `test/`, `e2e/` |

> **ممنوع** إدخال: Redux، Yarn، Webpack مباشرةً، MongoDB، Prisma، tRPC، أيّ ORM، أيّ Babel plugin. لو احتجتها فعلاً، اكتب ADR في `docs/decisions/` أوّلاً.

## 2. أوامر البناء والاختبار (إلزامي تشغيلها قبل التسليم)

```bash
# المدير الافتراضي = npm (ليس pnpm رغم ما قد يقترحه أي وكيل)
npm install                # تثبيت الاعتماديّات
npm run dev                # Next.js على المنفذ 5000 (host 0.0.0.0)
npm run typecheck          # tsc --noEmit (مع stack-size=8192 لتفادي SO)
npm run lint               # ESLint 9 (Next config + react-hooks)
npm run build              # next build للإنتاج
npm run test               # Vitest unit + integration
npm run test:rules         # قواعد Firestore (rules-unit-testing)
npm run test:e2e           # Playwright (يحتاج المنفذ 5000)
npm run lint:lexicon       # فحص المعجم العربي (انظر scripts/lexicon-lint.ts)
```

**Sidecars (Python):**
```bash
npm run pdf-worker:dev          # 8000
npm run egypt-calc:dev          # 8008
npm run llm-judge:dev           # 8080
npm run embeddings-worker:dev   # 8099
```

**Definition of Done لأيّ PR:**
1. `npm run typecheck` → 0 errors.
2. `npm run lint` → 0 errors (warnings مقبولة موقّتاً).
3. `npm run test` → كل الاختبارات تمرّ.
4. لو غيّرت `firestore.rules` → `npm run test:rules` يمرّ.
5. لو لمست UI → سجّل لقطة شاشة ووصف التغيير في `replit.md`.

## 3. قواعد TypeScript

- `strict: true` و `noImplicitAny: true` مُفعَّلان في `tsconfig.json`. **لا تُعطّلهما.**
- ممنوع إضافة `as any` جديدة في `src/`, `app/`, `lib/`, `components/`. ESLint يُحذّر تلقائياً.
- استثناءات الـ `any` المسموح بها (مُعرّفة في `eslint.config.mjs`):
  - `src/lib/firebase-admin.ts` — يحوي `@ts-nocheck` لتجاوز types المُولّدة.
  - ملفّات `*.test.ts(x)`, `test/**`, `e2e/**`.
- استخدم `zod` لكلّ مُدخل من المستخدم/الشبكة (موجود سلفاً، انظر `app/api/**`).
- استخدم `unknown` بدل `any` عند التعامل مع payloads خارجيّة.
- تجنّب type assertions بدون runtime check؛ استخدم type guards (`isFoo(x): x is Foo`).

## 4. قواعد Next.js 16

- App Router فقط — لا تُنشئ ملفّات في `pages/`.
- React Server Components افتراضي. أضف `"use client"` فقط حين تحتاج state/effects/browser APIs.
- لا تُحرّك مسار API من Node إلى Edge قبل التحقّق من أنّه لا يستخدم `firebase-admin` أو `pdf-parse` (راجع `serverExternalPackages` في `next.config.ts`).
- استخدم `next/dynamic` مع `ssr: false` للمكوّنات الثقيلة الـ client-only (انظر `app/page.tsx` → `HomeBelowFold`).
- استخدم `next/image` لكل صورة (يفرضه ESLint).
- استخدم `next/font` للخطوط فقط (Cairo/IBM Plex Arabic مُحمّلة في `app/layout.tsx`).
- التوثيق المُدمَج للـ Next.js متاح محلّياً في `node_modules/next/dist/docs/`. **ارجع إليه قبل سؤال الإنترنت** عند أيّ غموض في App Router/Server Actions/Caching.

## 5. قواعد الأمان (إلزاميّة)

1. **`firestore.rules` مُغلَق افتراضياً** بـ `allow read, write: if false;` كقاعدة fallback. أيّ collection جديدة تحتاج قاعدة صريحة. **ممنوع منعاً باتّاً** كتابة `if true` حتّى مؤقّتاً.
2. **عمليّات الإدارة عبر Admin SDK فقط** (members, billing, cost ledger, deletion queue). الكلاينت لا يقدر يعدّل أيّ منها.
3. **CSP صارم** في `next.config.ts` (script-src, connect-src, frame-src...). أيّ نطاق خارجي جديد يحتاج تعديل CSP **+ سبب موثَّق في PR**.
4. **HSTS + COOP + Permissions-Policy** نشطة. لا تُلغها.
5. **Webhooks موقَّعة:** Stripe + Fawry + SendGrid + Resend. لا تقبل webhook بدون التحقّق من التوقيع.
6. **Rate limiting:** كل API endpoint يحتاج rate limit — `src/lib/rate-limit.ts`.
7. **Prompt Injection:** كل سياق RAG يمرّ بـ `src/ai/safety/sanitize-context.ts` (وفق نمط ClawGuard). **لا تُغذِّ user input مباشرةً** للـ system prompt.
8. **PII:** لا تسجّل في `pino` أو Sentry: emails كاملة، أرقام هواتف، `idToken`، أو محتوى محادثات. استخدم `redact` (مُهيَّأ سلفاً).
9. **Secrets:** لا تكتب `process.env.X` في كود client-side؛ استخدم `NEXT_PUBLIC_*` للعامّ فقط، والباقي server-only.
10. **Dependencies:** `npm audit` يُشغَّل في CI. أيّ عيب High/Critical يحجب الـ merge.

## 6. قواعد البيانات (Firestore)

- **كل query تحتاج `.limit()`** صريح. أيّ query بدون limit = قنبلة موقوتة (تكلفة + cold read).
- استخدم `where('userId', '==', uid)` لكل document يخصّ مستخدماً (تفرضه القواعد).
- استخدم composite indexes — انظر `firestore.indexes.json`.
- لكل collection جديدة أضف TTL إذا كانت بيانات مؤقّتة (sessions, OTP, idempotency keys).
- استخدم `FieldValue.increment()` بدل read-modify-write لتفادي race conditions في العدّادات.

## 7. ملفّات/مجلّدات حسّاسة — لا تلمسها بدون إذن صريح من المستخدم

| المسار | السبب |
|---|---|
| `firestore.rules` | تغيير خاطئ = اختراق فوري |
| `firestore.indexes.json` | يُدار عبر CI/CD |
| `src/lib/firebase-admin.ts` | bootstrap حسّاس |
| `app/api/webhooks/**` | توقيعات + state machines ماليّة |
| `app/api/billing/**` | تدفّقات نقد |
| `vercel.json`, `.replit`, `next.config.ts` | يحتاج مراجعة بشريّة |
| `services/cloudbuild.yaml`, `services/railway.json` | بنية تحتيّة |
| `.github/workflows/**` | CI/CD secrets |
| `sentry.*.config.ts`, `instrumentation.ts` | observability |
| `replit.md` | ذاكرة المشروع — **حدّثها لكن لا تحذف منها** |

## 8. حوكمة الوكلاء (Agent Governance)

ارجع إلى `docs/AGENT_GOVERNANCE.md` لتفاصيل تطبيق Microsoft Agent Governance Toolkit (أبريل 2026) ومخاطر OWASP العشر للوكلاء على وكلائنا الـ 16. أهم القواعد:

- كل وكيل لازم يكون له **System Card** في `docs/agents/<agent>.md` (مُتَّبِع `_TEMPLATE.md`).
- أدوات الوكيل (`tools`) تمرّ عبر **plan-guard** (`src/ai/safety/plan-guard.ts`) قبل التنفيذ.
- أيّ أداة عالية المخاطر (`risk: 'critical' | 'high'`) تحتاج موافقة بشريّة عبر `agent-governance.ts`.
- كل output يُسجَّل في Langfuse مع trace كامل (إجباري).

## 9. توجيهيّات إضافيّة لكل وكيل AI

- **اقرأ `replit.md` قبل أيّ تعديل.** يحوي تاريخ القرارات + ما تمّ تجربته وفشل.
- **اقرأ `docs/decisions/` قبل تغيير قرار معماري.**
- **اقرأ `docs/THREAT_MODEL.md` قبل أيّ تغيير في الأمن/الصلاحيّات.**
- **ادعم العربية + RTL في كل UI.** لو أضفت نص hard-coded إنجليزي في component يستخدمه عميل عربي = bug.
- **لا تُولّد نصّاً بـ `Math.random()` في JSX/render.** انظر القاعدة في `replit.md`.
- **لا تُنشئ ملفّات `.md` تلقائيّاً** (README, OVERVIEW, إلخ) ما لم يطلب المستخدم. حدّث `replit.md` بدلاً من ذلك.
- **لا تستخدم emojis في الكود/الكوميتس** ما لم يطلب المستخدم.
- **عند وجود شكّ:** اقرأ، اسأل، ثمّ نفّذ. لا تخمّن.

## 10. كيف تضيف وكيلاً جديداً

راجع `SKILL.md` (في الجذر) — يحوي خطوات تفصيليّة من الفكرة إلى الإنتاج.

## 11. خريطة Harness Engineering (مرجع سريع)

كل آليّة سلامة لها مكان واحد في الكود — راجع `docs/HARNESS.md` للجدول الكامل. أهم النقاط:

- **حلقات تحقّق**: `test/eval/`, `services/llm-judge/`, `.github/workflows/eval.yml` (بوّابة ≥ 0.80 pass-rate)، `vitest.config.ts` (عتبات تغطية).
- **Tracing**: `src/lib/logger.ts` (pino + redact) + `X-Request-ID` يمرّ من `route-guard` إلى Sentry/Langfuse/audit.
- **Task Path Collapse**: استخدم `createStepBudget({ max, label })` من `src/lib/security/max-step-guard.ts` في أي LangGraph/Mastra loop.
- **Cost Runaway**: استدعِ `enforceBudget(workspaceId)` من `src/lib/billing/budget-guard.ts` قبل أي stream طويل.
- **API Errors**: ارمِ `HTTPError` (أو فروعها) من `src/lib/security/api-error.ts` بدل JSON يدوي. `guardedRoute` يحوّلها لـ Problem+JSON تلقائياً.
- **UI Errors**: لفّ widgets الحسّاسة بـ `<ErrorBoundary>` من `components/ui/ErrorBoundary.tsx`.
- **Memory Crisis**: مرّر سجلّ الحوار عبر `compactHistory` من `src/lib/memory/compress-context.ts` قبل تمريره للنموذج.
- **Conventional Commits**: راجع `CONTRIBUTING.md` + `scripts/check-commit-message.mjs`.
- **Feature Scaffolding**: `node scripts/scaffold-feature.mjs <name>`.

---

**آخر مراجعة:** 2026-04-25 · **المسؤول:** Principal Platform Architect · **الإصدار:** 1.1
