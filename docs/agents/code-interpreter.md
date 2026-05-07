# Agent System Card — Code Interpreter (مفسّر الكود)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Product Pod

## 1. Purpose
يُساعد رواد الأعمال التقنيين على فهم وتحليل الكود البرمجي، شرح مفاهيم تقنية، مراجعة مقتطفات كود، وتقديم توصيات للبنية التقنية للشركات الناشئة المصرية.

## 2. Capabilities
- شرح مقتطفات كود بلغات شائعة (Python, JavaScript/TypeScript, SQL).
- تحليل مشاكل تقنية وتوليد حلول مقترحة.
- مراجعة بنية الكود وتوصيات Clean Code.
- تفسير رسائل الخطأ وتوجيه حلها.
- تحليل استعلامات SQL وتحسينها.
- شرح مفاهيم API وتصميم Microservices.

## 3. Out-of-scope
- لا ينفّذ كوداً في بيئة إنتاج حقيقية.
- لا يصل لقواعد بيانات أو بنية تحتية للمستخدم.
- لا يُقدّم ضمانات أمانية للكود (أمان تطبيقات يحتاج audit متخصص).

## 4. Risk class — **Minimal**
مساعد تقني استرشادي؛ لا مخرجات ذات تأثير مباشر على قرارات حساسة.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| مقتطفات كود | إدخال | session فقط | تُحذف نهاية الجلسة |

## 6. Tools available
`rag.search` (intent: `tech_support`).

## 7. Known failure modes
- توليد كود يعمل نظرياً لكن يفشل في بيئة الإنتاج.
- إغفال ثغرات أمنية شائعة (SQL Injection, XSS) في الكود المقترح.
- توصيات مكتبات قديمة أو deprecated.

## 8. Evaluation
- Golden set: 30 سيناريو تقني مع حلول مرجعية.
- عتبة قبول: 0.82.

## 9. Human-in-the-loop
لا — مساعدة تقنية استرشادية.

## 10. Disclosures
- "راجع الكود المُولَّد مع مطور متخصص قبل النشر في الإنتاج."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Product Pod |
