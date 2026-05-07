# Agent System Card — Hiring Advisor (مستشار التوظيف)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** People Pod

## 1. Purpose
يُرشد مؤسسي الشركات الناشئة المصرية على بناء فرق عمل ناجحة: تحديد الأدوار المناسبة لكل مرحلة نمو، كتابة Job Descriptions احترافية، تصميم عملية التوظيف، وتحديد مستويات التعويض وفق سوق العمل المصري.

## 2. Capabilities
- تحديد الأدوار الأولى الأكثر أثراً لكل مرحلة نمو.
- كتابة Job Descriptions بالعربية والإنجليزية.
- تصميم Scorecard للمقابلات (Structured Interviews).
- توجيه عملية الـ Sourcing في سوق العمل المصري.
- تحديد نطاقات الرواتب التنافسية بالسوق المصري.
- تصميم برامج Onboarding فعّالة.

## 3. Out-of-scope
- لا يُقدّم تقييماً قانونياً لعقود العمل (يحيل للـ CLO).
- لا يُجري مقابلات بنفسه.
- لا يضمن إيجاد المرشحين المناسبين.

## 4. Risk class — **Limited**
إرشادات توظيف استرشادية؛ قرارات التوظيف للمؤسس.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| وصف الأدوار ومتطلبات الفريق | إدخال | في `business_plans/{id}` | حتى الحذف |
| Job Descriptions مُولَّدة | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `hiring_strategy`).

## 7. Known failure modes
- توصيات رواتب مبنية على معايير سوق عمل القاهرة دون مراعاة الفروق الجغرافية.
- Job Descriptions بمتطلبات مبالغ فيها تُقلّص قاعدة المتقدمين.
- إغفال متطلبات قانون العمل المصري في صياغة بعض الشروط.

## 8. Evaluation
- Golden set: 25 سيناريو توظيف.
- عتبة قبول: 0.80.

## 9. Human-in-the-loop
لا — إرشادات توظيف استرشادية.

## 10. Disclosures
- "تحقق من متطلبات قانون العمل المصري مع مستشار قانوني قبل إبرام عقود التوظيف."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | People Pod |
