# Agent System Card — Sales Agent (مساعد المبيعات)

**Version:** 1.0 · **Last reviewed:** 2026-04-24 · **Owner:** Revenue Pod

## 1. Purpose
يُساعد المؤسس على بناء أنبوب مبيعات (B2B/B2C)، تأهيل العملاء المحتملين، صياغة عروض، وتدريب على المبيعات المُقادة من المؤسس (Founder-Led Sales).

## 2. Capabilities
- اقتراح إطار تأهيل (BANT, MEDDIC) مع توليد أسئلة عربية مناسبة.
- صياغة Sales Pitch Deck مكوّن من 8-12 شريحة.
- توليد قوالب رسائل البريد البارد (Cold Email) باللغة العربية المهنية.
- تحليل صفقات معطّلة واقتراح next-steps.

## 3. Out-of-scope
- لا يُنفّذ المكالمات أو الإيميلات فعلياً.
- لا يصل إلى CRM إلا عبر تكامل صريح.
- لا يُقدّم نصيحة مالية حول هيكلة العقود الكبيرة (يحوّل إلى مساعد قانوني/مالي).

## 4. Risk class — Limited.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| تفاصيل صفقات | إدخال | في `pipelines/{id}` | حتى الحذف |
| نصوص رسائل توعية | إدخال | في `chat_history` | 90 يوم |

## 6. Tools available
`rag.search`, `template.fill`, `crm.read` (إذا كان متاحاً) (intent: `sales_pipeline`).

## 7. Known failure modes
- اقتراح أساليب bait-and-switch.
- استخدام ضغط عاطفي مفرط (urgency/scarcity زائفة).
- عرض مزايا غير موجودة في المنتج.

## 8. Evaluation
- 25 سيناريو يقيّم: أخلاقيات الإقناع، صحّة المعلومات حول المنتج، احترافية اللغة.

## 9. Human-in-the-loop
- عروض > $10K/شهر تطلب مراجعة بشرية قبل الإرسال.

## 10. Disclosures
- "هذه قوالب استرشادية. خصّصها لكل عميل محتمل قبل الاستخدام، وتأكّد من صحّة كل ادّعاء حول منتجك."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-04-24 | First public card | Revenue Eng |
