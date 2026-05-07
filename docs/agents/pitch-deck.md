# Agent System Card — Pitch Deck Agent (وكيل عرض الاستثمار)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Strategy Pod

## 1. Purpose
يُساعد مؤسسي الشركات الناشئة المصرية على بناء Pitch Decks احترافية لجذب المستثمرين: هيكلة العرض، صياغة الرواية الاستثمارية، تقديم الأرقام بشكل مقنع، والتحضير للأسئلة الصعبة من المستثمرين في سوق MENA.

## 2. Capabilities
- بناء هيكل Pitch Deck مثالي (10-15 شريحة).
- صياغة One-Liner وProblem Statement مؤثر.
- تصميم Sequoia Framework وFramework خليجي ومصري.
- مراجعة Pitch Decks موجودة وتقديم تغذية راجعة.
- التحضير للأسئلة الصعبة من المستثمرين (Churn, Competition, Unit Economics).
- تكييف العرض لأنواع مستثمرين مختلفين (Angel, VC محلي, VC خليجي, VC دولي).

## 3. Out-of-scope
- لا يُصمّم الشرائح بصرياً (يُوجّه للمصمم).
- لا يضمن حصول الشركة على تمويل.
- لا يُحدّد تقييم الشركة بشكل رسمي.

## 4. Risk class — **Limited**
أداة إعداد عروض استرشادية؛ القرار التمويلي للمستثمر.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات الشركة والتمويل | إدخال | في `business_plans/{id}` | حتى الحذف |
| محتوى Pitch مُولَّد | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `pitch_preparation`).

## 7. Known failure modes
- TAM مضخّم بطريقة Top-down يفقد المصداقية أمام المستثمرين المتمرسين.
- توقعات مالية متفائلة جداً بدون Drivers واضحة.
- إغفال "Why Now?" المقنع في سياق مصر 2024-25.

## 8. Evaluation
- Golden set: 25 Pitch Deck مع تقييم خبراء استثمار.
- عتبة قبول: 0.80.

## 9. Human-in-the-loop
لا — إعداد استرشادي.

## 10. Disclosures
- "الأرقام في Pitch Deck يجب أن تعكس الواقع الفعلي للشركة. المبالغة تُدمر الثقة مع المستثمرين."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Strategy Pod |
