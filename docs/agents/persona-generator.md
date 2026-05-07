# Agent System Card — Persona Generator (مُولِّد شخصيات المستخدمين)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Product Pod

## 1. Purpose
يُساعد الشركات الناشئة المصرية على بناء شخصيات مستخدمين (User Personas) مبنية على بيانات حقيقية وتعكس الأنماط النفسية والديموغرافية للمستهلك المصري — لدعم قرارات المنتج والتسويق.

## 2. Capabilities
- بناء Personas كاملة (ديموغرافيا + سلوك + دوافع + نقاط ألم).
- تصميم نماذج المستخدم المصري النموذجي (رائد أعمال، مدير، مستقل رقمي).
- استخلاص Personas من بيانات مقابلات أو استطلاعات.
- بناء User Journey Map لكل Persona.
- تحديد Objections والاعتراضات لكل شريحة.
- تصميم Story Moments تُوضّح سياق المشكلة والحل.

## 3. Out-of-scope
- لا يُجري مقابلات عمق مع المستخدمين الفعليين.
- Personas المُولَّدة بدون بيانات ميدانية تبقى فرضيات تحتاج تحقق.
- لا يُقدّم تحليلات نفسية تشخيصية.

## 4. Risk class — **Limited**
أداة بحث وتخطيط استرشادية.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات شرائح المستخدمين | إدخال | في `business_plans/{id}` | حتى الحذف |
| Personas مُولَّدة | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `user_research`).

## 7. Known failure modes
- Personas نمطية لا تعكس تنوع المستخدم المصري الفعلي.
- الاعتماد على افتراضات بدل بيانات مقابلات عمق.
- إغفال الفروق بين مستخدمي القاهرة والمحافظات.

## 8. Evaluation
- Golden set: 20 Persona مع تقييم بحثي.
- عتبة قبول: 0.78.

## 9. Human-in-the-loop
لا — أداة بحثية.

## 10. Disclosures
- "هذه Personas فرضية تحتاج تحقق ميداني قبل اتخاذ قرارات منتج كبيرة."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Product Pod |
