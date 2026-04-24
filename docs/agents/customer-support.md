# Agent System Card — Customer Support Agent (مساعد دعم العملاء)

**Version:** 1.0 · **Last reviewed:** 2026-04-24 · **Owner:** Success Pod

## 1. Purpose
يُساعد المؤسس على تصميم تجربة دعم عملاء عربية ممتازة: قاعدة معرفة (KB)، تصنيف التذاكر، قياس CSAT، وأتمتة الردود الشائعة.

## 2. Capabilities
- توليد مقالات قاعدة معرفة من أسئلة شائعة.
- تصنيف تذاكر دعم وارد إلى أولويات (P0-P3) وموضوعات.
- توليد ردّ مبدئي مناسب ثقافياً ولغوياً للسوق العربي.
- تحليل بيانات CSAT واقتراح تحسينات.

## 3. Out-of-scope
- لا يرسل ردوداً مباشرة للعملاء بدون مراجعة بشرية في الفترة الأولى (90 يوم).
- لا يصل إلى بيانات دفع أو معلومات حساسة دون redaction.
- لا يُقدّم تعويضات مالية تلقائياً (يُحوَّل دائماً للموظف).

## 4. Risk class — Limited.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| تذاكر دعم (مع PII redaction) | API | في `support_tickets/{id}` | 12 شهر |
| تقييمات CSAT | إدخال العميل | في `csat_scores/{id}` | 24 شهر |

## 6. Tools available
`rag.search` (KB), `template.fill`, `ticket.classify` (intent: `customer_support`).

## 7. Known failure modes
- استخدام لهجة غير مناسبة (رسمية مفرطة لعميل خفيف، أو عكسه).
- وعد بحلول تتجاوز سياسة الشركة.
- خلط معلومات بين عملاء مختلفين (cross-tenant) — مغطّى بـ Firestore rules.

## 8. Evaluation
- 25 سيناريو يقيّم: ملاءمة اللهجة، صحّة المعلومات من KB، عدم وعود زائفة. عتبة pass-rate ≥ 0.85.
- حماية ضدّ Prompt Injection من محتوى التذكرة (LLM02 — IPI) عبر `context-quarantine.ts`.

## 9. Human-in-the-loop
- كل ردّ يُمرَّر لموظف دعم للمراجعة في أوّل 90 يوم.
- تذاكر تتضمّن شكاوى قانونية أو مالية تُحوَّل فوراً للإنسان.
- ردود تتضمّن تعويض > $50 تُحجَب وتُعرَض رسالة موافقة.

## 10. Disclosures
- "أنا مساعد ذكي. للموضوعات الحرجة، سيراجع زميل بشري ردّي قبل الإرسال."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-04-24 | First public card | Success Eng |
