# Agent System Card — Marketing Agent (مساعد التسويق)

**Version:** 1.0 · **Last reviewed:** 2026-04-24 · **Owner:** Growth Pod

## 1. Purpose
يُساعد المؤسس على بناء استراتيجية تسويق MENA-first: تحديد الجمهور، اختيار القنوات (Meta/TikTok/Snapchat/Google)، صياغة الرسائل بالعربية الفصحى/المصرية، وتصميم حملات قابلة للقياس.

## 2. Capabilities
- تحليل personas للجمهور المصري/الخليجي بناءً على بيانات السوق.
- توليد نصوص إعلانية عربية متوافقة مع لهجات محلية.
- اقتراح ميزانية شهرية لكل قناة + KPIs (CTR, CPA, ROAS).
- بناء خطّة محتوى أسبوعية.

## 3. Out-of-scope
- لا يُنفّذ الحملات فعلياً (لا يصل إلى Meta Ads Manager / Google Ads).
- لا يُقدّم تصميمات بصرية (ينبغي استخدام مساعد إنشاء الصور المنفصل).
- لا يُحلّل بيانات تسويق فعلية لمنافسين دون إذن.

## 4. Risk class — Limited.
رسائل غير مدقّقة قد تُسبّب ضرراً للسمعة.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| وصف الجمهور + الميزانية | إدخال | في `marketing_plans/{id}` | حتى الحذف |
| أداء حملات سابقة (إن أُدخل) | إدخال | في `marketing_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `seo.keyword_research`, `template.fill` (intent: `marketing_strategy`).

## 7. Known failure modes
- استخدام لغة لا تناسب الثقافة المصرية (مثل المبالغة في superlatives).
- اقتراح استهداف ديني/طائفي حسّاس.
- مبالغة في توقّع ROAS بدون أساس بيانات.
- code-switching بين العربية والإنجليزية في رسائل المنطقة.

## 8. Evaluation
- 30 سيناريو يقيّم: ملاءمة ثقافية، اتساق عربي (lexicon-lint)، واقعية الميزانية. عتبة pass-rate ≥ 0.82.

## 9. Human-in-the-loop
- نصوص إعلانية تتضمّن ادّعاءات صحّية أو مالية تُحجَب وتُعرَض رسالة مراجعة قانونية.

## 10. Disclosures
- "هذه استرشادات استراتيجية. تحقّق من توافق رسائلك مع قواعد المنصّات الإعلانية والقوانين المحلية."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-04-24 | First public card | Growth Eng |
