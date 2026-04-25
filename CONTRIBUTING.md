# Contributing to Kalmeron Two

> دليل المساهمة الموحَّد لكل من يكتب كوداً على هذا المستودع — بشراً ووكلاء.
> ابدأ من `AGENTS.md` (الدستور)، ثم اقرأ هذا الملف لفهم سياسة الـ commits، الـ tests، والـ specs.

---

## 1. Conventional Commits (إلزامي)

كل commit يجب أن يتبع [Conventional Commits 1.0](https://www.conventionalcommits.org/) — يُفرض هذا عبر `scripts/check-commit-message.mjs`.

### الصيغة

```
<type>(<scope>)?: <subject>

[optional body]

[optional footer(s)]
```

### الأنواع المسموح بها

| النوع | متى نستخدمه |
|---|---|
| `feat` | ميزة جديدة لمستخدم نهائي. |
| `fix` | إصلاح خطأ مرئي للمستخدم النهائي أو لوكيل. |
| `refactor` | إعادة هيكلة بدون تغيير سلوك خارجي. |
| `perf` | تحسين أداء قابل للقياس. |
| `docs` | تعديل توثيق فقط (`*.md`, JSDoc, ADR). |
| `test` | إضافة/تعديل اختبارات بدون تغيير سلوك. |
| `chore` | تحديث اعتماديات، تنظيف، scripts، CI. |
| `build` | تغيير في نظام البناء أو deps الإنتاج. |
| `ci` | تعديل في `.github/workflows/**`. |
| `style` | تنسيق فقط، بدون تغيير دلالي. |
| `revert` | عكس commit سابق (يجب أن يحوي `Refs: <hash>`). |

### Breaking changes

استخدم `!` بعد النوع/النطاق، أو سطر `BREAKING CHANGE:` في الـ footer.

### أمثلة صحيحة

```
feat(chat): add streaming for plan-builder
fix(billing): preserve idempotency-key on retry
docs(adr): record decision to keep TS strict
refactor!: drop legacy /v1 chat endpoint

BREAKING CHANGE: /v1/chat is removed; use /v2/chat.
```

### كيف نتحقق محلياً

```bash
echo "feat: add foo" | node scripts/check-commit-message.mjs --stdin
node scripts/check-commit-message.mjs path/to/COMMIT_EDITMSG
```

اربطها بـ git محلياً (اختياري؛ غير مُنشأ تلقائياً لأن git hooks لا تُلتزم في الـ repo):

```bash
echo 'node scripts/check-commit-message.mjs "$1" || exit 1' > .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```

---

## 2. Test-First

- لكل ميزة جديدة في `src/lib/**` أو `src/ai/**` أو `app/api/**` ابدأ بـ test في `test/` يفشل، ثم نفّذ حتى يمرّ.
- Vitest يغطّي unit + integration. لـ UI: `@testing-library/react`. لـ E2E: Playwright في `e2e/`.
- لـ AI: قواعد تقييم في `test/eval/` تمرّ عبر `npm run eval`. CI يُسقط أيّ PR ينخفض فيه `Overall pass rate` تحت `0.80` (انظر `.github/workflows/eval.yml`).

عتبات التغطية مُعرَّفة في `vitest.config.ts` للمكتبات الحساسة:
- `src/lib/security/**` ≥ 80% lines
- `src/lib/billing/**` ≥ 80% lines

شغّل التغطية محلياً (يحتاج `@vitest/coverage-v8` مثبَّتاً):
```bash
npx vitest run --coverage
```

---

## 3. Spec-First Development

- **ADR** لكل قرار معماري مهم في `docs/decisions/NNNN-<slug>.md`.
- **System Card** لكل وكيل جديد في `docs/agents/<agent>.md` متَّبِعاً `_TEMPLATE.md`.
- **OpenAPI** لكل تغيير في API العام في `docs/api/openapi.yaml`.
- **Zod schema** قبل كتابة handler يستهلك أو يُنتج payload (انظر `src/lib/schemas.ts`).
- **Prompt files**: مُفضَّل أن تعيش الـ prompts في `src/agents/<agent>/prompt.ts` كـ template strings، مع unit test يتحقق من ثباتها.

---

## 4. Definition of Done

قبل أي PR / مهمة:

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 errors (warnings مقبولة موقتاً)
npm run test        # كل الاختبارات تمرّ
npm run lint:lexicon
```

إذا لمست:
- `firestore.rules` → شغّل `npm run test:rules`.
- ميزة UI → سجّل لقطة شاشة + تحديث `replit.md`.
- AI agent → شغّل `npm run eval`.

---

## 5. Logging

- ممنوع `console.log` / `console.error` / `console.warn` في `src/`, `app/`, `components/` خارج ملفّات الاختبار والـ scripts.
- استخدم `logger` من `src/lib/logger.ts` (pino مع PII redact).
- استخدم `sanitizeLogValue` من `src/lib/security/sanitize-log.ts` لأي قيمة من المستخدم.

---

## 6. Error Handling

- في API routes: ارمِ `HTTPError` (أو فروعها من `src/lib/security/api-error.ts`) بدل JSON يدوي. `guardedRoute` يحوّلها إلى Problem+JSON تلقائياً.
- في React: لفّ المكوّنات الحساسة بـ `<ErrorBoundary>` من `components/ui/ErrorBoundary.tsx`.
- في Server Actions: استخدم try/catch ثم رجِّع `{ ok: false, code, message }` (بدل throw).

---

## 7. Feature Scaffolding

```bash
node scripts/scaffold-feature.mjs <name>
# يُنشئ: src/features/<name>/{types.ts, server.ts, client.tsx, README.md}
# + test/<name>.test.ts
```

---

## 8. مراجعة الكود

- PRs تتطلب على الأقل مراجعة تلقائية واحدة (`.github/workflows/ai-code-review.yml`) + اختبارات خضراء.
- إذا كنت وكيلاً (Replit / Cursor / Windsurf): تابِع تعليمات `AGENTS.md` ثم `.windsurfrules` ثم القواعد في `.cursor/rules/`.

---

**آخر مراجعة:** 2026-04-25
