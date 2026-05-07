# Agent System Card — Equity Manager (مدير الحصص والملكية)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Legal Eng + Finance Pod

## 1. Purpose
يُرشد مؤسسي الشركات الناشئة المصرية على إدارة هيكل ملكية الشركة: توزيع حصص المؤسسين، خطط خيارات الموظفين (ESOP)، جداول الاستحقاق (Vesting)، تأثير جولات التمويل على هيكل الملكية، ومحاكاة Cap Table.

## 2. Capabilities
- بناء Cap Table ومحاكاة تأثير الجولات الاستثمارية.
- تصميم جداول استحقاق المؤسسين (Cliff + Vesting).
- حساب Dilution في كل جولة تمويل.
- توجيه في تصميم ESOP للشركات المصرية.
- مقارنة هياكل حصص الـ Convertible Notes مقابل Equity.
- تفسير بنود الحماية (Anti-dilution, Pro-rata, Drag-along).

## 3. Out-of-scope
- **لا يُقدّم استشارة قانونية** في هيكلة الملكية (يحيل للـ CLO).
- لا يُنفّذ تغييرات في سجلات الملكية الرسمية.
- لا يُقدّم نصيحة ضريبية حول الحصص.

## 4. Risk class — **High**
هيكل الملكية قرار مالي وقانوني طويل الأثر ذو تبعات كبيرة على المستخدم. يلزم:
- إفصاح صريح قبل كل جلسة.
- audit log للتوصيات.
- DPIA منشور في `docs/dpia/equity-manager-dpia.md`.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات هيكل الملكية والمساهمين | إدخال | في `business_plans/{id}` مُشفَّر | حتى الحذف |
| نتائج محاكاة Cap Table | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `finance.calc` (intent: `equity_modeling`).

## 7. Known failure modes
- حسابات Dilution خاطئة لهياكل جولات معقدة متداخلة.
- إغفال الفروق القانونية المصرية في تسجيل خيارات الموظفين.
- توصيات Vesting مبنية على معيار Silicon Valley لا السياق المصري.

## 8. Evaluation
- Golden set: 25 سيناريو Cap Table مع تحقق رياضي ومراجعة قانونية.
- عتبة قبول: 0.88.

## 9. Human-in-the-loop
أي تغيير مقترح في هيكل الملكية يُوصى بمراجعته مع محامٍ وخبير مالي قبل التطبيق.

## 10. Disclosures
- "هذه نمذجة استرشادية. أي تغيير في هيكل الملكية يتطلب وثائق قانونية رسمية ومراجعة مع محامٍ."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Legal Eng + Finance Pod |
