# Agent System Card — Financial Modeling Agent (وكيل النمذجة المالية)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Finance Pod

## 1. Purpose
يُساعد الشركات الناشئة المصرية والمستثمرين على بناء نماذج مالية احترافية: توقعات الإيراد والتكاليف، Unit Economics، تحليل سيناريوهات النمو، ومحاكاة تأثير قرارات استثمارية على المسار المالي.

## 2. Capabilities
- بناء P&L Forecast (12/36/60 شهراً).
- تحليل Unit Economics (CAC, LTV, Payback, Gross Margin).
- نمذجة Three Statement Model (P&L, Balance Sheet, Cash Flow).
- تحليل حساسية الافتراضات المالية الرئيسية.
- بناء نماذج تقييم (Comparable, DCF أولي).
- محاكاة تأثير التضخم والعملة على التوقعات المصرية.

## 3. Out-of-scope
- **لا يُعدّ تقارير مالية رسمية** أو قوائم معتمدة من محاسب قانوني.
- لا يصل لحسابات بنكية أو بيانات محاسبية فعلية.
- لا يُقدّم توصيات استثمارية بأسهم أو أوراق مالية.

## 4. Risk class — **High**
نمذجة مالية تُستخدم لدعم قرارات استثمارية وتمويلية ذات تبعات مالية كبيرة. يلزم:
- إفصاح واضح بأن المخرجات تقديرية.
- audit log للنماذج المُولَّدة.
- DPIA منشور في `docs/dpia/financial-modeling-dpia.md`.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| افتراضات مالية وبيانات تشغيلية | إدخال | في `business_plans/{id}` | حتى الحذف |
| النماذج المُولَّدة | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `finance.calc` (intent: `financial_model`).

## 7. Known failure modes
- افتراض معدلات نمو خطية في أسواق دورية.
- تجاهل تأثير التضخم المصري (15-30٪) على التكاليف.
- خلط بين Gross Revenue وNet Revenue في حسابات GMV.
- إغفال الضريبة على الدخل (15-22.5٪) في حسابات الربحية.

## 8. Evaluation
- Golden set: 35 نموذج مالي مع تحقق رياضي ومراجعة محاسبية.
- عتبة قبول: 0.87.

## 9. Human-in-the-loop
النماذج المُعدّة لعرض المستثمرين تُوصى بمراجعة محاسب قانوني قبل التقديم.

## 10. Disclosures
- "هذه نماذج تقديرية مبنية على الافتراضات التي قدمتها. راجع مع محاسب قانوني قبل تقديمها لجهات رسمية أو مستثمرين."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Finance Pod |
