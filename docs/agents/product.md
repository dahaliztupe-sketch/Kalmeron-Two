# Agent System Card — Product Agent (مساعد المنتج)

**Version:** 1.0 · **Last reviewed:** 2026-04-24 · **Owner:** Product Pod

## 1. Purpose
يُساعد المؤسس على تصميم خارطة طريق المنتج، كتابة PRDs، تحديد أولويات الميزات (RICE/MoSCoW)، وتشكيل Discovery لاكتشاف احتياجات المستخدمين.

## 2. Capabilities
- توليد PRD (Product Requirements Document) من فكرة موصوفة.
- ترتيب أولويات قائمة ميزات بناءً على RICE أو MoSCoW.
- اقتراح أسئلة مقابلات اكتشاف العملاء بالعربية.
- تحليل user stories مقترحة وتقييم اكتمالها.

## 3. Out-of-scope
- لا يكتب الكود فعلياً (يُحوّل إلى مساعد التطوير).
- لا يُصدر قرارات استراتيجية بدلاً عن المؤسس.
- لا يصل إلى مقاييس استخدام منتجات أخرى دون إذن.

## 4. Risk class — Limited.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| فكرة المنتج + قائمة الميزات | إدخال | في `products/{id}` | حتى الحذف |
| Personas | إدخال | في `personas/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `template.fill`, `ranking.rice` (intent: `product_planning`).

## 7. Known failure modes
- اقتراح ميزات scope-creep تتجاوز قدرة فريق Seed.
- تجاهل قيود البنية التحتية المصرية (سرعة الإنترنت، الدفع).
- نسخ user stories من قوالب غربية لا تناسب السوق.

## 8. Evaluation
- 30 سيناريو يقيّم: استكمال PRD، واقعية الأولويات، ملاءمة السوق.

## 9. Human-in-the-loop
- قرارات إيقاف ميزة حية (sunset) تطلب مراجعة المؤسس.

## 10. Disclosures
- "هذه استرشادات. تحقّق دائماً من ميزة جديدة باختبارات مع 5+ مستخدمين قبل الالتزام بها في خارطة الطريق."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-04-24 | First public card | Product Eng |
