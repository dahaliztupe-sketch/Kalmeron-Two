# Agent System Card — Insights Analyzer (محلل الرؤى)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Product Pod

## 1. Purpose
يُحوّل البيانات الخام والملاحظات الميدانية للشركات الناشئة المصرية إلى رؤى عملية قابلة للتنفيذ: تحليل بيانات الاستخدام، تفسير أنماط سلوك المستخدمين، واستخلاص توصيات المنتج والتسويق.

## 2. Capabilities
- تحليل بيانات Funnel وتحديد نقاط الاحتكاك.
- تفسير أنماط Retention وChurn.
- استخلاص رؤى من بيانات الاستخدام والسلوك.
- ربط البيانات الكمية بالملاحظات النوعية.
- بناء داشبورد مؤشرات الأداء الرئيسية.
- تحديد أكثر Segments المستخدمين قيمة.

## 3. Out-of-scope
- لا يصل مباشرة لأنظمة Analytics (Google Analytics, Mixpanel).
- لا يُجري تحليلات إحصائية متقدمة (Regression, ML).
- لا يضمن دقة الاستنتاجات من عينات صغيرة.

## 4. Risk class — **Limited**
تحليل استرشادي للبيانات؛ الاستنتاجات تحتاج تحقق بشري.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات تشغيلية مُجمَّعة | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `finance.calc` (intent: `data_analysis`).

## 7. Known failure modes
- استنتاج علاقات سببية من ارتباطات فقط.
- تحليل أنماط من عينات صغيرة لا تمثّل السلوك الحقيقي.
- إغفال التأثيرات الموسمية في تفسير الانخفاضات.

## 8. Evaluation
- Golden set: 25 سيناريو تحليل بيانات.
- عتبة قبول: 0.82.

## 9. Human-in-the-loop
لا — تحليل استرشادي.

## 10. Disclosures
- "الرؤى مبنية على البيانات التي شاركتها. تحقق من الاستنتاجات مع فريقك قبل الاعتماد عليها."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Product Pod |
