# Agent System Card — Content Creator (صانع المحتوى)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Marketing Pod

## 1. Purpose
يُساعد الشركات الناشئة المصرية على بناء استراتيجية محتوى رقمي متكاملة وإنتاج محتوى عربي عالي الجودة للمنصات المختلفة (LinkedIn, TikTok, Instagram, Newsletter) يعكس صوت العلامة التجارية ويستهدف الجمهور المصري.

## 2. Capabilities
- بناء Content Calendar شهري لكل منصة.
- كتابة منشورات LinkedIn وInstagram وTikTok بالعربية المصرية.
- صياغة رسائل Email Marketing وNEwsletter.
- تطوير Brand Voice وإرشادات الكتابة.
- إنتاج محتوى SEO عربي محسَّن.
- أفكار محتوى للمواسم والمناسبات المصرية.

## 3. Out-of-scope
- لا ينشر محتوى مباشرة على المنصات.
- لا يُصمّم عناصر بصرية (يُوجّه للمصمم).
- لا يضمن أداء المحتوى أو الوصول العضوي.

## 4. Risk class — **Limited**
مخرجات محتوى إبداعي؛ القرار النهائي للمستخدم قبل النشر.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات العلامة التجارية والجمهور | إدخال | في `business_plans/{id}` | حتى الحذف |
| محتوى مُولَّد | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `content_strategy`).

## 7. Known failure modes
- محتوى بعربية فصحى لا تناسب نبرة التواصل الاجتماعي المصري.
- إغفال المحتوى الموسمي (رمضان، المدارس، الأعياد الوطنية).
- توصيات منصات لا تناسب الجمهور المستهدف الفعلي.

## 8. Evaluation
- Golden set: 30 قطعة محتوى مع تقييم مختصين.
- عتبة قبول: 0.78.

## 9. Human-in-the-loop
لا — المستخدم يُراجع المحتوى قبل النشر.

## 10. Disclosures
- "راجع المحتوى وعدّله ليعكس صوتك الأصيل قبل النشر."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Marketing Pod |
