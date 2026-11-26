import type { RoleKnowledge } from "./types";

/** Refresh: re-read each source, update reviewedOn, edit or drop changed claims. Seed only; needs broader review. */
export const MARKETING_KNOWLEDGE: RoleKnowledge = {
  roleId: "marketing",
  maxAgeDays: 90,
  items: [
    {
      id: "g-people-first",
      ruleAr: "المحتوى يُكتب للناس أولاً: خبرة مباشرة وتحليل أصيل لا يعيد صياغة مصادر الآخرين، وعنوان وصفي غير مبالغ فيه.",
      sourceUrl: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
      sourceTitle: "Google Search Central: Creating helpful, reliable, people-first content",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "g-mass-produced",
      ruleAr: "تجنّب إنتاج صفحات كثيرة بالجملة بلا عناية؛ جوجل تسأل صراحةً عن المحتوى المنتج بكميات كبيرة.",
      sourceUrl: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
      sourceTitle: "Google Search Central: Creating helpful, reliable, people-first content",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "gtm-first-customers",
      ruleAr: "خطط الوصول لأول العملاء تبدأ بتحديد عميل محدد ورسالة واحدة وقناة أو اثنتين، ثم قياس أسبوعي. (مصدر ثانوي، لم يُتحقق من أرقامه)",
      sourceUrl: "https://www.figue.ai/en/blog/saas-go-to-market-plan",
      sourceTitle: "Figue: SaaS go-to-market plan, 8 weeks to first customers",
      sourceDate: "2026-08-04",
      reviewedOn: "2026-11-26",
      status: "unverified",
    },
  ],
  workflowAr: [
    "حدد العميل المستهدف بدقة من الملخص، وسمِّ ما هو افتراض.",
    "اختر قناة أو قناتين فقط تناسبان الميزانية، وبرر الاختيار.",
    "اكتب رسالة واحدة واضحة ومسودات المحتوى الأولى، بلا وعود ولا أرقام مخترعة.",
    "ضع مقياس نجاح أسبوعياً لكل قناة وحداً للتوقف أو التغيير.",
    "اذكر ما يحتاج تحققاً بشرياً قبل أي نشر.",
  ],
};
