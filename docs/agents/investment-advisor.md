# Agent System Card — Investment Advisor (مستشار الاستثمار)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Finance Pod + Legal Eng

## 1. Purpose
يُرشد مؤسسي الشركات الناشئة المصرية على رحلة جمع التمويل: تحديد مصادر التمويل المناسبة، التحضير للمستثمرين، فهم بنود Term Sheets، وبناء استراتيجية تمويل لكل مرحلة نمو.

## 2. Capabilities
- تحديد مصادر التمويل المناسبة (Angels, VCs, Accelerators, Grants).
- شرح مراحل التمويل (Pre-Seed, Seed, Series A/B).
- تفسير بنود Term Sheet الأساسية (Valuation, Pro-rata, Anti-dilution, Liquidation preference).
- إعداد قائمة مستثمرين مستهدفين في MENA.
- التحضير لـ Due Diligence.
- شرح الفروق بين Debt وEquity Financing.

## 3. Out-of-scope
- **لا يُقدّم نصيحة استثمارية مرخّصة** بأوراق مالية محددة.
- لا يُفاوض نيابة عن المستخدم مع المستثمرين.
- لا يضمن حصول الشركة على تمويل.

## 4. Risk class — **High**
قرارات التمويل ذات تبعات قانونية ومالية بعيدة الأثر على هيكل الملكية والمسار الاستراتيجي. يلزم:
- إفصاح صريح قبل كل جلسة.
- audit log لكل توصية.
- DPIA منشور في `docs/dpia/investment-advisor-dpia.md`.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات الشركة والمرحلة التمويلية | إدخال | في `business_plans/{id}` | حتى الحذف |
| بنود Term Sheets مُدخَلة | إدخال | في `business_plans/{id}` مُشفَّر | حتى الحذف |

## 6. Tools available
`rag.search`, `finance.calc` (intent: `fundraising_strategy`).

## 7. Known failure modes
- توقعات تقييم مُبالَغ فيها مقارنة بمضاعفات السوق المصري الفعلية.
- تبسيط مُفرط في شرح بنود قانونية معقدة (Anti-dilution, Drag-along).
- إغفال خيارات التمويل غير الاستثمارية المتاحة في مصر (قروض Tamweel, ITIDA).

## 8. Evaluation
- Golden set: 30 سيناريو تمويل مع مراجعة خبراء.
- عتبة قبول: 0.85.

## 9. Human-in-the-loop
قبل التوقيع على أي Term Sheet، يُوصى بمراجعة محامٍ ومستشار مالي متخصص.

## 10. Disclosures
- "هذه إرشادات تمويل استرشادية. قبل التوقيع على أي اتفاقية استثمارية، راجع مع محامٍ ومستشار مالي مرخّص."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Finance Pod + Legal Eng |
