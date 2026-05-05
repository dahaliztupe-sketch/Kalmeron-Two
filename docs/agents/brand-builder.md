# Agent System Card — Brand Builder

**Version:** 1.2 · **Last reviewed:** 2026-05-05 · **Owner:** فريق المنتج / كلميرون

## 1. Purpose

يساعد مؤسسي الشركات الناشئة المصرية والعربية في بناء هوية علامة تجارية متكاملة: الاسم، الشعار اللفظي (tagline)، الشخصية، صوت الكتابة، الألوان المقترحة، وركائز الرسالة. يصدر النتائج كـ brand book قابل للتحميل.

## 2. Capabilities

- اقتراح هوية بصرية لفظية: شعار، ألوان، نبرة
- بناء Brand Voice: شخصية، أسلوب تواصل، محظورات الكتابة
- توليد Brand Story و Messaging Pillars
- تصدير brand book منسّق (HTML/PDF)
- هيكل JSON مدقَّق بـ Zod (`BrandBookSchema`)

## 3. Out-of-scope

- تصميم شعارات مرئية (vector/رسومات)
- تسجيل علامات تجارية أو نصائح قانونية للتسجيل
- بناء مواقع أو تطبيقات للعلامة
- إدارة حملات التسويق المدفوعة

## 4. Risk class (EU AI Act)

**Minimal** — الوكيل يقدم اقتراحات إبداعية بلا تأثير على حقوق أو عقود. قرار المستخدم نهائي دائماً.

## 5. Data touched

| Data | Source | Stored? | Retention |
|---|---|---|---|
| اسم الشركة + الوصف (input) | المستخدم | Firestore: `brand_voice/{uid}` | حتى الحذف |
| Brand book JSON (output) | AI generated | Firestore: `brand_voice/{uid}` | حتى الحذف |
| PDF/HTML المُصدَّر | generated | لا يُخزَّن — يُنزَّل مباشرة | لا |

## 6. Tools available

- `brand.strategy` — توليد الهوية النصية
- `brand.identity` — توليد JSON مدقَّق بـ Zod

## 7. Known failure modes

- قد يقترح ألواناً لا تناسب الثقافة المحلية — المستخدم يراجع دائماً
- الـ JSON extraction قد يفشل إذا كانت استجابة AI غير منسَّقة → يعود لـ `text` فقط بدون `structured`
- ألوان مقترحة قد تفتقر لـ contrast accessibility — يُنصح بفحص WCAG

## 8. Evaluation

- Golden-set: `test/eval/golden-dataset.json` — مجموعة `brand-*`
- Acceptance threshold: 0.80
- تُقيَّم على: الاتساق الداخلي للهوية، الملاءمة الثقافية، اكتمال JSON

## 9. Human-in-the-loop

- لا يوجد تدخل بشري مطلوب — الوكيل مستشاري بحت
- المستخدم يراجع ويعتمد الهوية النهائية قبل النشر

## 10. Disclosures shown to user

- "هذه مقترحات مولّدة آلياً. راجعها مع متخصص تسويق قبل الاعتماد النهائي."
- "الألوان المقترحة تحتاج اختباراً للإمكانية على خلفيات مختلفة."

## 11. Change log

| Date | Change | Reviewer |
|---|---|---|
| 2026-05-05 | إضافة BrandBookSchema (Zod) + brand book PDF export | فريق AI |
| 2026-04-20 | إطلاق الوكيل (v1.0) | فريق المنتج |
