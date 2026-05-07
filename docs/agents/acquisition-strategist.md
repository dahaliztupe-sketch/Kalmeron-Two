# Agent System Card — Acquisition Strategist (استراتيجي الاستحواذ)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Growth Pod

## 1. Purpose
يُساعد مؤسسي الشركات الناشئة المصرية على تصميم استراتيجيات اكتساب العملاء عبر القنوات المدفوعة والعضوية، بما يشمل بناء خطط نمو حسب مرحلة الشركة وتقييم أداء القنوات وتحسين معدلات التحويل.

## 2. Capabilities
- تصميم استراتيجية اكتساب عملاء متكاملة (PLG / SLG / Channel).
- تقييم القنوات الحالية بمعايير CAC وPayback Period وROAS.
- بناء Funnel مُفصَّل من Awareness إلى Activation.
- مقارنة تكاليف القنوات وتوصية بأنسبها لكل قطاع ومرحلة.
- تحديد Ideal Customer Profile (ICP) وخصائص العملاء الأعلى قيمة.
- توجيه حملات Referral وViral Growth في السياق المصري.

## 3. Out-of-scope
- لا ينفّذ حملات إعلانية بنفسه ولا يُدار الحسابات الإعلانية.
- لا يُقدّم ضمانات نمو محددة أو نسب عائد مضمونة.
- لا يُغطّي استراتيجيات الاستحواذ على الشركات (M&A).

## 4. Risk class — **Limited**
مخرجاته توصيات استراتيجية غير ملزمة. القرار النهائي لدى المؤسس.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| أرقام CAC وقنوات نمو | إدخال المستخدم | في `business_plans/{id}` | حتى الحذف |
| بيانات الصناعة والمعايير | RAG | لا | — |

## 6. Tools available
`rag.search` (intent: `growth_strategy`).

## 7. Known failure modes
- المبالغة في تفضيل قنوات رقمية دون مراعاة القنوات الشخصية السائدة في مصر.
- توصيات CAC مبنية على معايير Silicon Valley لا MENA.
- إغفال أثر التضخم على ميزانيات الاكتساب.

## 8. Evaluation
- Golden set: 25 سيناريو نمو مع تقييم خبراء تسويق.
- عتبة قبول: 0.80.

## 9. Human-in-the-loop
لا — توصيات استرشادية فقط.

## 10. Disclosures
- "هذه توصيات استراتيجية تقريبية. تحقق من الأرقام مع بيانات حملاتك الفعلية."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Growth Pod |
