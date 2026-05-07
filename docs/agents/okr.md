# Agent System Card — OKR Agent (وكيل OKR وإدارة الأهداف)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Strategy Pod

## 1. Purpose
يُساعد الشركات الناشئة المصرية على بناء وإدارة نظام OKR فعّال: صياغة Objectives وKey Results احترافية، تسلسل OKRs من مستوى الشركة للفرق للأفراد، وبناء ثقافة Check-in أسبوعي.

## 2. Capabilities
- صياغة Objectives ملهمة وKey Results قابلة للقياس.
- بناء نظام OKR متسلسل (Company → Team → Individual).
- تشخيص أخطاء OKRs الشائعة وتصحيحها.
- تصميم دورة OKR الفصلية الكاملة (Planning, Check-in, Grading, Retrospective).
- تكييف OKR مع الثقافة المؤسسية المصرية.
- ربط OKRs بخطة الحوافز والأداء.

## 3. Out-of-scope
- لا يُدير نظام تتبع OKR تقني (يُوصي بأدوات مثل Lattice, Notion).
- لا يضمن التزام الفريق بالأهداف.
- لا يُقيّم أداء الموظفين بشكل رسمي.

## 4. Risk class — **Limited**
أداة تخطيط وإدارة أهداف استرشادية.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| أهداف الشركة والفرق | إدخال | في `business_plans/{id}` | حتى الحذف |
| OKRs مُولَّدة | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `okr_strategy`).

## 7. Known failure modes
- OKRs طموحة جداً تُحبط الفريق بدل تحفيزه في السياق الثقافي المصري.
- Key Results تقيس Output لا Outcome.
- إغفال الحاجة للأمان النفسي عند مناقشة الأهداف غير المحققة.

## 8. Evaluation
- Golden set: 30 مجموعة OKR مع تقييم خبراء.
- عتبة قبول: 0.82.

## 9. Human-in-the-loop
لا — توجيه استرشادي.

## 10. Disclosures
- "OKRs المقترحة نقطة بداية. كيّفها مع استراتيجيتك وثقافة فريقك."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Strategy Pod |
