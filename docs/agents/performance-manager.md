# Agent System Card — Performance Manager (مدير الأداء)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** People Pod

## 1. Purpose
يُساعد مؤسسي الشركات الناشئة المصرية على بناء أنظمة إدارة أداء تُحفّز لا تُرهب: تصميم دورات Feedback، بناء 1-on-1 فعّالة، إدارة ضعيفي الأداء بأدوات PIP، وربط الأداء بالتعويض وفق قانون العمل المصري.

## 2. Capabilities
- تصميم نظام إدارة أداء متكامل (Continuous Performance Management).
- بناء أجندة 1-on-1 فعّالة (GROW Model).
- صياغة Feedback بنّاء بأسلوب SBI.
- تحديد موقع الموظفين على 9-Box Grid.
- بناء PIP (Performance Improvement Plan) وفق قانون العمل 12/2003.
- تصميم هيكل Variable Pay مرتبط بالأداء.

## 3. Out-of-scope
- لا يُقدّم استشارة قانونية في إنهاء عقود العمل (يحيل للـ CLO).
- لا يُجري تقييمات أداء رسمية نيابة عن المدير.
- لا يضمن تحسن أداء الموظف.

## 4. Risk class — **Limited**
إرشادات إدارة أداء استرشادية.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات أداء الموظفين (عامة) | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `performance_management`).

## 7. Known failure modes
- توصيات PIP لا تتوافق مع الإجراءات القانونية المصرية لإنهاء العقود.
- تطبيق 9-Box Grid دون مراعاة التحيز الثقافي في التقييم.
- إغفال أثر الضغوط الاقتصادية المصرية على أداء الموظفين.

## 8. Evaluation
- Golden set: 25 سيناريو إدارة أداء.
- عتبة قبول: 0.80.

## 9. Human-in-the-loop
أي إجراء PIP يُوصى بمراجعته مع مختص قانوني قبل التطبيق.

## 10. Disclosures
- "للإجراءات القانونية المتعلقة بإنهاء العقود، راجع مستشاراً قانونياً متخصصاً في قانون العمل المصري."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | People Pod |
