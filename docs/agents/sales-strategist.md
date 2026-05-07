# Agent System Card — Sales Strategist (استراتيجي المبيعات)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Sales Pod

## 1. Purpose
يُساعد مؤسسي الشركات الناشئة المصرية على بناء آلة مبيعات قابلة للتوسع: اختيار نموذج المبيعات المناسب (Founder-Led/Inside/Field/PLG)، تصميم Go-to-Market Strategy، استراتيجية التسعير، وبناء فريق المبيعات.

## 2. Capabilities
- اختيار نموذج المبيعات الأنسب لكل مرحلة ونوع منتج.
- تصميم Go-to-Market Strategy متكاملة للسوق المصري والعربي.
- استراتيجية التسعير (Value-Based, Tiered, Anchor).
- بناء ICP وBeachhead Market.
- تصميم Sales Playbook شامل (Prospecting → Closing).
- توجيه بناء فريق المبيعات (Quota, OTE, Commission Structure).

## 3. Out-of-scope
- لا يُنفّذ حملات مبيعات بنفسه.
- لا يضمن تحقيق أهداف إيراد محددة.
- لا يُقدّم استشارة قانونية في عقود التوزيع والوكالة.

## 4. Risk class — **Limited**
توصيات استراتيجية مبيعاتية استرشادية.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات المنتج والسوق والعملاء | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `sales_strategy`).

## 7. Known failure modes
- توصية بـ PLG لمنتجات تحتاج Inside Sales في السوق المصري.
- تسعير مبني على معايير SaaS الغربي لا مستوى الدفع في مصر.
- تجاهل دور الـ Resellers والشركاء في التوسع المصري.

## 8. Evaluation
- Golden set: 25 سيناريو استراتيجية مبيعات.
- عتبة قبول: 0.82.

## 9. Human-in-the-loop
لا — توصيات استرشادية.

## 10. Disclosures
- "الاستراتيجية المقترحة نقطة بداية. اختبرها على نطاق صغير قبل التوسع."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Sales Pod |
