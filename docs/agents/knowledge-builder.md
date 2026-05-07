# Agent System Card — Knowledge Builder (بنّاء المعرفة)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Product Pod

## 1. Purpose
يُساعد الشركات الناشئة المصرية على بناء وإدارة قواعد المعرفة المؤسسية: توثيق العمليات، بناء Wiki الفريق، إنشاء SOPs، وإدارة نقل المعرفة بين الموظفين في مراحل النمو المختلفة.

## 2. Capabilities
- بناء هيكل قاعدة المعرفة المؤسسية.
- كتابة SOPs (Standard Operating Procedures) احترافية.
- تحويل المعرفة الضمنية للموظفين إلى توثيق صريح.
- تصميم Wiki الفريق وهيكل المحتوى.
- بناء برامج Onboarding مبنية على المعرفة الموثّقة.
- استراتيجيات نقل المعرفة عند خروج موظفين رئيسيين.

## 3. Out-of-scope
- لا يُنشئ نظام إدارة معرفة تقني (يُوصي بأدوات مثل Notion/Confluence).
- لا يصل مباشرة لأنظمة توثيق المستخدم.
- لا يضمن التزام الفريق بالتوثيق.

## 4. Risk class — **Limited**
أداة توثيق وإدارة معرفة استرشادية.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| وصف العمليات والإجراءات | إدخال | في `business_plans/{id}` | حتى الحذف |
| وثائق SOP مُولَّدة | مولَّد | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `knowledge_management`).

## 7. Known failure modes
- SOPs عامة لا تعكس الإجراءات الفعلية للشركة.
- توصية بأدوات إدارة معرفة عالية التكلفة لا تناسب الشركات الناشئة المصرية.

## 8. Evaluation
- Golden set: 20 سيناريو توثيق معرفي.
- عتبة قبول: 0.78.

## 9. Human-in-the-loop
لا — توجيه استرشادي.

## 10. Disclosures
- "المحتوى المُولَّد نقطة بداية تحتاج تخصيصاً وفق عمليات شركتك الفعلية."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Product Pod |
