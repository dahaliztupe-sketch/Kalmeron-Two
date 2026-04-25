# 0002 — TypeScript صارم + منع `as any` عبر ESLint

**الحالة:** Accepted
**التاريخ:** 2026-04-25
**المقرِّرون:** Engineering team

## السياق

أبحاث 2026 تظهر أنّ ~45% من الكود المُولَّد بالـ AI يُدخل ثغرات. أحد أكبر مصادر الثغرات في TypeScript هو **`as any` casts** التي تُعطّل type system، وتُمرَّر من generation tools (Cursor, Copilot, Claude) بكثرة.

كلميرون مشروع كبير (~50k LoC في الـ TypeScript) فيه:

- AI orchestration معقّد (LangGraph + Mastra)
- Firestore Admin SDK مع types مُولَّدة
- 16 وكيلاً يستدعون tools مع schemas معقّدة

نحتاج توازن بين الصرامة والإنتاجيّة.

## القرار

1. `tsconfig.json` يفرض:
   - `strict: true`
   - `noImplicitAny: true`
   - `strictNullChecks: true`
   - `strictFunctionTypes: true`
   - `noImplicitReturns: true`
   - `noFallthroughCasesInSwitch: true`

2. ESLint يحوّل `@typescript-eslint/no-explicit-any` إلى **warning** في:
   - `src/**`, `app/**`, `lib/**`, `components/**`

3. استثناءات مسموحة (off):
   - `src/lib/firebase-admin.ts` (يحوي `@ts-nocheck` بسبب types Firebase Admin المُعقّدة).
   - `**/*.test.ts(x)`, `test/**`, `e2e/**`.

4. `noUncheckedIndexedAccess: false` — مرفوض حالياً لأنّه يكسر ~150 موضع. يُفتح ADR جديد لتفعيله بالتدريج.

5. `exactOptionalPropertyTypes: false` — مرفوض حالياً لنفس السبب.

## البدائل المُفحوصة

### رفع `no-explicit-any` إلى `error`
**رفضناه لأنّ:**
- يحجب الـ CI لأجل ~470 موضع موجود سلفاً (legacy debt).
- الـ migration يستلزم 2-3 أيام عمل متواصل.
- بدلاً من ذلك: warn الآن + tasks تدريجيّة في `replit.md`.

### تفعيل `noUncheckedIndexedAccess`
**رفضناه لأنّ:**
- 150+ كسر فوري في `obj[key]` patterns.
- يحتاج refactor واسع للـ Firestore data fetching.
- مُحوَّل إلى ADR مستقبلي.

### استخدام `unknown` بدلاً من `any` كسياسة
**قبلناه جزئيّاً:** الـ AGENTS.md يوصي بـ `unknown` للـ inputs الخارجيّة، لكن لا نُجبر عليه عبر lint.

## النتائج

### Positive
- ✅ كل كود جديد يكتبه AI agent يُحذَّر فيه عن `as any`.
- ✅ الـ lint نظيف (0 errors) — CI green.
- ✅ Type safety محفوظة في 95%+ من الكود.

### Negative
- ❌ ~470 warning موجود — لازم تنظيف تدريجي.
- ❌ Devs ممكن يتجاهلوا warnings — حلّناه بـ pre-commit hook (مستقبلاً).

### Neutral
- ⚪ تعليم الفريق الفرق بين `unknown` و `any`.

## المراجع
- `tsconfig.json`
- `eslint.config.mjs`
- `replit.md` — جلسة "Tooling Repair" 2026-04-25
