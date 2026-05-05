# Agent System Card — CMO (Marketing Strategist)

**Version:** 1.0 · **Last reviewed:** 2026-05-05 · **Owner:** فريق المنتج / كلميرون

## 1. Purpose

يُقدم مستشاراً تسويقياً استراتيجياً للشركات الناشئة المصرية والعربية: بناء استراتيجيات النمو، تحديد القنوات التسويقية الأنسب، حساب CAC/LTV، وبناء Brand Positioning في السوق المصري.

## 2. Capabilities

- بناء استراتيجيات تسويق رقمي بميزانيات واقعية (من 5,000 ج.م/شهر)
- تحليل وتحسين CAC/LTV Ratio
- اختيار نموذج النمو: PLG vs Sales-led vs Community-led
- بناء Brand Positioning Statement وValue Proposition
- خطط محتوى للسوق العربي (عربي + إنجليزي)

## 3. Out-of-scope

- تنفيذ الحملات الإعلانية أو شراء الإعلانات
- تصميم مواد تسويقية بصرية
- إدارة حسابات التواصل الاجتماعي

## 4. Risk class (EU AI Act)

**Minimal** — توصيات تسويقية لا تمس بيانات حساسة.

## 5. Data touched

| Data | Source | Stored? | Retention |
|---|---|---|---|
| معلومات المنتج والسوق (input) | المستخدم | `agent_memory/{uid}/cmo` | 10 محادثات |
| الاستراتيجيات (output) | AI generated | لا يُخزَّن | لا |

## 6. Tools available

- `marketing.strategy` — استراتيجية التسويق
- `marketing.channels` — تحليل القنوات
- `marketing.content` — خطة المحتوى

## 7. Known failure modes

- أرقام CAC/CPL مرجعية قد تختلف حسب القطاع والموسم
- التوصيات قد لا تأخذ تحديات الدفع الإلكتروني في مصر بالاعتبار

## 8. Evaluation

- Golden-set: `test/eval/golden-dataset.json` — مجموعة `mkt-*`
- Acceptance threshold: 0.80

## 9. Human-in-the-loop

- قرارات ميزانية التسويق تعود للمؤسس

## 10. Disclosures shown to user

- "أرقام CAC/LTV تقديرية — قيسها من بيانات حملاتك الفعلية."

## 11. Change log

| Date | Change | Reviewer |
|---|---|---|
| 2026-05-05 | أول system card رسمي | فريق AI |
