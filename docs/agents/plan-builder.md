# Agent System Card — Business Plan Builder (مُنشئ خطة العمل)

**Version:** 1.0 · **Last reviewed:** 2026-04-24 · **Owner:** Strategy Pod

## 1. Purpose
يبني خطة عمل تفصيلية جاهزة للمستثمر للمؤسس بالعربية المصرية، تشمل: المشكلة، الحل، السوق المستهدف، نموذج الأعمال، خطة التسويق، التوقعات المالية الأولية، خارطة الطريق، والفريق المطلوب.

## 2. Capabilities
- توليد قسم تنفيذي (Executive Summary) من فكرة في 3 جمل.
- تحليل سوق MENA من قاعدة المعرفة المحلية (RAG على 200+ تقرير).
- اقتراح نموذج أعمال (B2B / B2C / Marketplace / SaaS) مع مبررات.
- خطة تسويقية بقنوات مناسبة للسوق المصري (شعبية وقتها، الميزانية، KPIs).
- خارطة طريق 18 شهر بمعالم واضحة.

## 3. Out-of-scope
- لا يستبدل دراسة جدوى رسمية مُعتمدة من خبير مالي.
- لا يصدر شهادات أو مستندات قانونية معتمدة.
- لا يُقدم ضمانات على نتائج السوق الفعلية.

## 4. Risk class — Limited.
خطأ في التحليل يُكلّف المؤسّس وقتاً، لا حياة أو حقوق.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| فكرة المشروع، السوق المستهدف، الميزانية | إدخال المستخدم | `business_plans/{id}` | حتى الحذف |
| تقارير سوق MENA | RAG (`rag.search`) | لا (مرجعية) | – |

## 6. Tools available
`rag.search`, `web.search` (للبيانات الحديثة), `finance.calc` (intent: `plan_build`).

## 7. Known failure modes
- مبالغة في حجم السوق (TAM inflation) — يحتاج تحقّق يدوي.
- تقدير CAC منخفض جداً للقطاعات التنافسية مثل التوصيل.
- استخدام منصات تسويق غير مناسبة للسوق المصري (مثل Pinterest في B2B).
- نسخ Templates عامة بدلاً من تخصيص محلي.

## 8. Evaluation
- Golden-set: `test/eval/golden-dataset.json` (intent `PLAN_BUILDER`, 6+ حالة).
- عتبة قبول: 0.75 على rubric (intent_match + cultural_fit + actionability).
- يدوياً: 10 خطط مرجعية مُراجعة من خبراء سنوياً.

## 9. Human-in-the-loop
لا — استرشادي. يُنصح المؤسّس بمراجعة محاسب قبل تقديم الخطة لمستثمر.

## 10. Disclosures
- "هذه خطة تأسيسية مولّدة آلياً. راجعها مع خبير قبل الاعتماد عليها."
- مصادر RAG مرئية بالـ citations.

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-04-24 | First public card | Strategy Eng |
