# Agent System Card — Sales Pipeline Analyst (محلل خط المبيعات)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Sales Pod

## 1. Purpose
يُساعد فرق المبيعات المصرية على تشخيص وتحسين Pipeline المبيعات: تحليل صحة الـ Pipeline، حساب التوقعات المرجّحة، تحليل Win/Loss، وتحديد الصفقات الراكدة لاتخاذ إجراءات تصحيحية فورية.

## 2. Capabilities
- تشخيص صحة Pipeline (Coverage, Stage Distribution, Velocity, Age).
- بناء Weighted Pipeline Forecast.
- تحليل Win Rate بحسب المرحلة والمصدر والمنافس.
- تحديد الصفقات الراكدة والمخاطر المخفية.
- توجيه CRM Hygiene للشركات الناشئة المصرية.
- بناء أجندة Pipeline Review الأسبوعية.

## 3. Out-of-scope
- لا يصل مباشرة لأنظمة CRM.
- لا يضمن دقة Forecast (يعتمد على جودة البيانات المُدخَلة).
- لا يُغلق الصفقات بنفسه.

## 4. Risk class — **Limited**
تحليل مبيعاتي استرشادي.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات Pipeline والصفقات | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `finance.calc` (intent: `pipeline_analysis`).

## 7. Known failure modes
- Forecast غير دقيق بسبب بيانات CRM غير مُحدَّثة (Garbage In, Garbage Out).
- تطبيق Stage Weights الغربي على دورة بيع مصرية أطول.
- إغفال تأثير العوامل الشخصية والعلاقاتية في الـ Pipeline المصري.

## 8. Evaluation
- Golden set: 25 سيناريو تحليل Pipeline.
- عتبة قبول: 0.83.

## 9. Human-in-the-loop
لا — تحليل استرشادي.

## 10. Disclosures
- "التحليل مبني على البيانات التي أدخلتها. دقة الـ Forecast تعتمد على جودة بيانات الـ Pipeline."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Sales Pod |
