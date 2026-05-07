# Agent System Card — Valuation Expert (خبير تقييم الشركات)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Finance Pod + Legal Eng

## 1. Purpose
يُساعد مؤسسي الشركات الناشئة المصرية على فهم وتحديد نطاق تقييم شركاتهم: منهجيات التقييم المناسبة لكل مرحلة، مضاعفات السوق العربي لعام 2024-25، وعوامل رفع وخفض التقييم — لدعم مفاوضات التمويل.

## 2. Capabilities
- اختيار منهجية التقييم المناسبة لكل مرحلة (Berkus, Scorecard, Revenue Multiples, VC Method, DCF).
- تطبيق مضاعفات السوق العربي الواقعية لكل قطاع.
- حساب Pre-Money وPost-Money Valuation.
- تحليل عوامل رفع وخفض التقييم.
- محاكاة تأثير Dilution في جولات تمويل متعددة.
- بناء Sensitivity Table للـ DCF بـ WACC مناسب للسوق المصري.

## 3. Out-of-scope
- **المخرجات نطاق تقديري لا تقييم رسمي** معتمد من خبير مرخّص.
- لا يُقدّم ضماناً بقبول التقييم من المستثمرين.
- لا يُنفّذ Due Diligence مالي.

## 4. Risk class — **High**
التقييم يُستخدم لدعم قرارات استثمارية وتفاوضية ذات تبعات مالية وقانونية كبيرة. يلزم:
- إفصاح واضح بأن المخرجات تقديرية.
- audit log لكل جلسة تقييم.
- DPIA منشور في `docs/dpia/valuation-expert-dpia.md`.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات مالية وتشغيلية للشركة | إدخال | في `business_plans/{id}` مُشفَّر | حتى الحذف |
| نماذج تقييم مُولَّدة | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `finance.calc` (intent: `valuation_model`).

## 7. Known failure modes
- مضاعفات إيراد مبنية على بيانات Silicon Valley لا MENA.
- DCF بـ WACC منخفض لا يعكس المخاطر الفعلية للسوق المصري (18-25٪).
- تجاهل عوامل Concentration Risk وFounder Dependency في التقييم.
- تبسيط مُفرط في معالجة هياكل رأس المال المعقدة.

## 8. Evaluation
- Golden set: 30 نموذج تقييم مع مراجعة خبراء مالية.
- عتبة قبول: 0.87.

## 9. Human-in-the-loop
التقييمات المُعدَّة لجولات استثمار رسمية تُوصى بمراجعة خبير مالي مستقل (Financial Advisor) قبل التفاوض.

## 10. Disclosures
- "هذا نطاق تقييم تقديري للاسترشاد. التقييم الرسمي يتطلب Due Diligence مستقلاً من خبير مالي مرخّص."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Finance Pod + Legal Eng |
