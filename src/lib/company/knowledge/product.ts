import type { RoleKnowledge } from "./types";

/** Sources below were opened and read on reviewedOn. Product practice only; no Egypt-specific legal claims. */
export const PRODUCT_KNOWLEDGE: RoleKnowledge = {
  roleId: "product",
  maxAgeDays: 90,
  items: [
    {
      id: "mvp-smallest-usable",
      ruleAr: "المنتج الأولي (MVP) هو أبسط نسخة قابلة للاستخدام تحل مشكلة العميل الأساسية وتجمع تغذية راجعة حقيقية؛ يجب أن يرتبط نطاقه بهدف تعلّم محدد. (مقال شركة، مصدر ثانوي)",
      sourceUrl: "https://www.atlassian.com/agile/product-management/minimum-viable-product",
      sourceTitle: "Atlassian: What is a minimum viable product?",
      sourceDate: "2025-04-16",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "fixed-time-variable-scope",
      ruleAr: "ثبّت الوقت المخصص للبناء (appetite) واجعل النطاق هو المتغير: إن ضاق الوقت يُقلَّص النطاق ولا يُمدَّد الموعد. دورة الستة أسابيع هي ممارسة Basecamp وليست قاعدة عامة.",
      sourceUrl: "https://basecamp.com/shapeup/1.2-chapter-03",
      sourceTitle: "Basecamp, Shape Up: Set Boundaries",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
  ],
  workflowAr: [
    "اقرأ الملخص: الفكرة والعميل والميزانية والمدة، وتعامل مع النقاط غير المتحقق منها كافتراضات.",
    "حدد المشكلة الأساسية الواحدة التي سيحلها المنتج الأولي وما سيُتعلَّم منه.",
    "صنّف الميزات إلى: يجب (must) ويُستحسن (should) ولن نبنيه الآن (won't) مع سبب كل بند.",
    "اقترح مكدس تقنيات بسيطاً مع سبب وmarker basis لكل طبقة، وبدائل أبسط إن وُجدت. لا تذكر أسعار أدوات دون وسم needs_check.",
    "اكتب قائمة بناء بالأسابيع تتسع للمدة والميزانية في الملخص، لكل أسبوع معيار إنجاز.",
    "أي كتابة كود أو نشر أو إنشاء حسابات لصالح عميل ليست من دورك: اذكرها كخطوة يقوم بها المؤسس أو فريقه، وحوّل التسعير والقانون إلى أدوارهما.",
  ],
};
