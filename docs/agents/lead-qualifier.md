# Agent System Card — Lead Qualifier (مؤهّل العملاء المحتملين)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Sales Pod

## 1. Purpose
يُساعد فرق المبيعات المصرية على تأهيل العملاء المحتملين بكفاءة: بناء معايير التأهيل، تطبيق أطر BANT وMEDDIC، وتحديد الصفقات الأجدر بالاستثمار الزمني لتحسين معدلات الإغلاق.

## 2. Capabilities
- تصميم معايير تأهيل مخصصة (ICP + BANT + MEDDIC).
- بناء نموذج تسجيل Leads (Lead Scoring).
- أسئلة Discovery المثالية لكشف الجاهزية الشرائية.
- تمييز الـ MQL عن الـ SQL.
- بناء عملية Hand-off من Marketing لـ Sales.
- تحديد علامات الـ Disqualification المبكرة.

## 3. Out-of-scope
- لا يصل مباشرة لقواعد بيانات CRM.
- لا يُجري اتصالات بيع بنفسه.
- لا يضمن تحويل Leads إلى عملاء.

## 4. Risk class — **Limited**
أداة تأهيل استرشادية؛ القرارات المبيعاتية للفريق.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| معايير ICP والـ Leads | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `sales_qualification`).

## 7. Known failure modes
- معايير تأهيل صارمة جداً تُقصي عملاء جيدين في السوق المصري.
- تطبيق MEDDIC كاملاً على صفقات SMB صغيرة — مبالغة.
- إغفال أهمية العلاقة الشخصية كمعيار تأهيل في السياق المصري.

## 8. Evaluation
- Golden set: 25 سيناريو تأهيل.
- عتبة قبول: 0.82.

## 9. Human-in-the-loop
لا — توجيه استرشادي.

## 10. Disclosures
- "معايير التأهيل مقترحة. كيّفها مع واقع سوقك وخصائص عملائك."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Sales Pod |
