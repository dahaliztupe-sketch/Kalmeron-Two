# Agent System Card — CSAT Analyst (محلل رضا العملاء)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Product Pod

## 1. Purpose
يُساعد الشركات الناشئة المصرية على قياس وتحليل رضا عملائها: تصميم استبيانات CSAT وNPS، تفسير النتائج، تحديد أسباب عدم الرضا، وبناء خطط تحسين تجربة العميل.

## 2. Capabilities
- تصميم استبيانات CSAT وNPS وCES مخصصة.
- تفسير نتائج الاستبيانات وتحديد الاتجاهات.
- تصنيف العملاء (Promoters / Passives / Detractors).
- تحليل أسباب الـ Churn من بيانات CSAT.
- بناء Voice of Customer Dashboard.
- توصيات تحسين NPS مخصصة للسوق المصري.

## 3. Out-of-scope
- لا يُجري استطلاعات بنفسه ولا يصل لعملاء المستخدم.
- لا يُفسّر بيانات خاصة بعملاء دون موافقة المستخدم.
- لا يضمن تحسين مؤشرات CSAT.

## 4. Risk class — **Limited**
تحليل وتوصيات استرشادية قائمة على بيانات يُدخلها المستخدم.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| نتائج استبيانات (مجمَّعة، لا شخصية) | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `customer_analytics`).

## 7. Known failure modes
- تفسير NPS منخفض بمعايير غربية دون مراعاة توقعات المستهلك المصري.
- استنتاجات غير دقيقة من عينات صغيرة.
- إغفال التحيز في الاستجابة (Response Bias) في الاستطلاعات العربية.

## 8. Evaluation
- Golden set: 20 سيناريو تحليل CSAT.
- عتبة قبول: 0.80.

## 9. Human-in-the-loop
لا — تحليل استرشادي.

## 10. Disclosures
- "التحليل مبني على البيانات التي شاركتها. تأكد من تمثيلية العينة قبل اتخاذ قرارات."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Product Pod |
