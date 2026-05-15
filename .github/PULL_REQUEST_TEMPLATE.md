<!--
  شكراً على مساهمتك في كلميرون 🙏
  Thanks for contributing to Kalmeron 🙏

  يرجى ملء هذا القالب بالكامل قبل طلب المراجعة.
  Please fill out this template completely before requesting a review.
-->

## ملخص التغيير / Summary

<!-- صِف ما تغيّر ولماذا / Describe what changed and why -->

Closes #<!-- issue number, if applicable -->

---

## نوع التغيير / Type of Change

<!-- ضع × داخل [ ] لكل ما ينطبق / Check all that apply -->

- [ ] 🐛 **bug fix** — إصلاح خطأ (لا يكسر شيئاً موجوداً)
- [ ] ✨ **feat** — ميزة جديدة (لا يكسر شيئاً موجوداً)
- [ ] 💥 **breaking change** — تغيير يكسر وظيفة موجودة
- [ ] 📝 **docs** — تحديث توثيق فقط
- [ ] ♻️ **refactor** — إعادة هيكلة بدون تغيير سلوك
- [ ] ⚡ **perf** — تحسين أداء
- [ ] 🧪 **test** — إضافة أو تحديث اختبارات
- [ ] 🔧 **chore** — تحديث اعتماديات / CI / scripts

---

## التغييرات المُنجزة / Changes Made

<!-- اذكر التغييرات الرئيسية بشكل مختصر / List the key changes -->

- 
- 
- 

---

## اختبار يدوي / Manual Testing

<!-- صِف كيف اختبرت هذه التغييرات / Describe how you tested these changes -->

**Test environment:**
- OS: 
- Browser: 
- Node: 

**Steps taken:**
1. 
2. 
3. 

---

## قائمة تحقق الجودة / Quality Checklist

### الكود / Code
- [ ] `npm run typecheck` — صفر أخطاء TypeScript / 0 TypeScript errors
- [ ] `npm run lint` — صفر أخطاء ESLint / 0 ESLint errors
- [ ] `npm run test` — جميع الاختبارات تمرّ / All tests pass
- [ ] الكود يتبع أسلوب الكود الموجود / Code follows existing style

### الأمان / Security
- [ ] لا توجد بيانات حساسة في الكود / No secrets or credentials in code
- [ ] المدخلات من المستخدم مُعقَّمة / User inputs are sanitized
- [ ] صلاحيات API محمية بـ `guardedRoute()` / API routes use `guardedRoute()`
- [ ] لا تعليقات `console.log` في الكود الإنتاجي / No `console.log` in production paths

### التوثيق / Documentation
- [ ] الكود المعقّد مُعلَّق / Complex code is commented
- [ ] أي تغيير في API محدَّث في `docs/api/openapi.yaml`
- [ ] أي قرار معماري مُوثَّق في `docs/decisions/`

### AI Agents (إن انطبق / if applicable)
- [ ] System card محدَّث في `docs/agents/`
- [ ] اختبارات التقييم تمرّ: `npm run eval`
- [ ] Prompt injection scenarios مختبرة

### Breaking Changes (إن وُجدت / if any)
- [ ] وُثِّق التغيير في BREAKING CHANGE footer
- [ ] وُثِّق مسار الترقية / Migration path documented

---

## لقطات شاشة / Screenshots

<!-- أضف لقطات شاشة للتغييرات البصرية / Add screenshots for visual changes -->

| قبل / Before | بعد / After |
|---|---|
| | |

---

## ملاحظات للمراجِع / Notes for Reviewer

<!-- أي شيء تريد لفت انتباه المراجِع إليه / Anything specific you want the reviewer to check -->

---

> **تذكير:** كل commit يجب أن يتبع [Conventional Commits](https://www.conventionalcommits.org/) — يُفرض هذا تلقائياً في CI.
> **Reminder:** Every commit must follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced in CI.
