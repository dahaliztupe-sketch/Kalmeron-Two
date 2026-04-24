# Agent System Card — Investor Relations Agent (مساعد علاقات المستثمرين)

**Version:** 1.0 · **Last reviewed:** 2026-04-24 · **Owner:** Finance Pod

## 1. Purpose
يُساعد المؤسس في إعداد عرض المستثمرين (Pitch Deck)، حسابات التقييم، صياغة Term Sheets، وإدارة قائمة المستثمرين المحتملين في MENA.

## 2. Capabilities
- توليد Pitch Deck بـ 10-12 شريحة (Problem, Solution, Market, Traction, Business Model, Team, Ask).
- حساب التقييم بطرق متعدّدة (Comparable, DCF, Berkus، Scorecard).
- شرح بنود Term Sheet شائعة (Pre-money, Liquidation Preference, Anti-dilution).
- اقتراح قائمة مستثمرين مناسبين (VC, Angel, Family Office) في MENA.

## 3. Out-of-scope
- ليس بديلاً لمستشار قانوني للـ Term Sheet النهائية.
- لا يُمثّل المؤسس في مفاوضات.
- لا يُشارك بيانات سرية مع مستثمرين دون إذن صريح.

## 4. Risk class — High (مالي).
قرارات استثمارية لها أثر مادي كبير وغير قابلة للعكس.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| توقّعات مالية | إدخال | في `pitches/{id}` | حتى الحذف |
| قائمة مستثمرين سابقين | إدخال | في `pitches/{id}` (مشفّر) | حتى الحذف |
| بنود Term Sheet مقترحة | إدخال | في `pitches/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `valuation.calc`, `template.fill` (intent: `investor_relations`).

## 7. Known failure modes
- توقّعات مبالغ فيها لقياس Hockey Stick غير واقعي.
- تجاهل خصوصيات السوق المصري في قيم Comparable (سيولة منخفضة).
- تفسير خاطئ لـ Liquidation Preference 1× participating vs non-participating.
- إغفال شروط Anti-dilution في Term Sheets.

## 8. Evaluation
- 35 سيناريو يقيّم: دقّة الحسابات، ملاءمة الـ Term Sheet للمرحلة، صحّة شرح البنود القانونية. عتبة pass-rate ≥ 0.85.

## 9. Human-in-the-loop
- أيّ Term Sheet أو valuation يُحوَّل تلقائياً لمراجعة محامي شركات قبل الإرسال للمستثمر.
- تحديثات قائمة المستثمرين السرية تطلب تأكيد المؤسس.

## 10. Disclosures
- "هذه استرشادات استراتيجية ومالية وليست استشارة قانونية أو مالية رسمية. اعمل دائماً مع محامي شركات ومحاسب قانوني قبل توقيع أيّ Term Sheet."
- بانر دائم: "Pitch Deck المُولّد مسوّدة فقط — راجعه مستشار خارجي قبل الإرسال."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-04-24 | First public card | Finance Eng |
