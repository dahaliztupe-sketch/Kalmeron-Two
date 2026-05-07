# Agent System Card — QA Manager (مدير ضمان الجودة)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Product Pod

## 1. Purpose
يُرشد فرق المنتج والتقنية في الشركات الناشئة المصرية على بناء ثقافة ضمان جودة فعّالة: تصميم Test Cases، بناء Test Pyramid، تحديد أولويات الأخطاء، وبناء عمليات QA مناسبة للمنتجات العربية وذوي الاحتياجات الخاصة.

## 2. Capabilities
- تصميم Test Cases بأسلوب احترافي (BDD/Gherkin).
- بناء استراتيجية اختبار متكاملة (Unit + Integration + E2E).
- تحديد أولويات الأخطاء (P0 → P3 Bug Triage).
- توجيه أتمتة الاختبارات (Playwright, Vitest, Postman).
- اختبار خاص بالمنتجات العربية (RTL, Arabic Content, Egyptian UX).
- كتابة Bug Reports واضحة وقابلة للتنفيذ.

## 3. Out-of-scope
- لا يُنفّذ اختبارات أمنية متقدمة (Penetration Testing).
- لا يصل مباشرة لأكواد أو بيئات المستخدم.
- لا يضمن خلوّ المنتج من الأخطاء.

## 4. Risk class — **Limited**
إرشادات جودة تقنية استرشادية.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| وصف المنتج والمتطلبات | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `qa_strategy`).

## 7. Known failure modes
- توصية بتكلفة أتمتة عالية لا تناسب فرق QA صغيرة.
- إغفال اختبارات RTL واللغة العربية.
- Test Cases غير قابلة للتنفيذ لعدم وضوح Pre-Conditions.

## 8. Evaluation
- Golden set: 30 سيناريو QA.
- عتبة قبول: 0.82.

## 9. Human-in-the-loop
لا — إرشادات جودة استرشادية.

## 10. Disclosures
- "إرشادات الجودة تتطلب تكييفاً مع بيئة منتجك وفريقك."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Product Pod |
