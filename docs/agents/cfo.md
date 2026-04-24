# Agent System Card — CFO Agent (المدير المالي الافتراضي)

**Version:** 1.0 · **Last reviewed:** 2026-04-24 · **Owner:** Finance Pod

## 1. Purpose
يُساعد المؤسس في بناء توقّعات مالية بسيطة (P&L 12 شهر)، حساب نقطة التعادل، اقتصاديات الوحدة (CAC, LTV, Margin)، واقتراح تسعير.

## 2. Capabilities
- استقبال إيرادات مُتوقّعة وتكاليف ثابتة/متغيّرة وإنتاج جدول شهري.
- حساب CAC, LTV, Payback Period.
- اقتراح 3 مستويات تسعير مع مبررات.

## 3. Out-of-scope
- ليس بديلاً لمحاسب قانوني للضرائب.
- لا يُقدّم نصيحة استثمارية بأسهم محدّدة.
- لا يصل إلى حسابات بنكية فعلية.

## 4. Risk class — Limited.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| أرقام مالية | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `finance.calc` (intent: `cfo_analysis`).

## 7. Known failure modes
- تجاهل الضرائب المصرية (15 % – 22.5 %) في التوقّعات.
- افتراضات غير واقعية لمعدّل التحويل في الـ Funnel.
- خلط بين العملات (EGP, USD).

## 8. Evaluation
- 40 سيناريو مع نتائج رياضية مرجعية، عتبة 0.85 + التحقّق من صحّة المعادلات.

## 9. Human-in-the-loop
لا — حسابات استرشادية فقط.

## 10. Disclosures
- "هذه نمذجة مالية تقريبية. راجع محاسباً قبل تقديم التقارير الرسمية."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-04-24 | First public card | Finance Eng |
