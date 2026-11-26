import type { RoleKnowledge } from "./types";

/** Fundraising and strategy prep. Non-binding. Only what the opened pages say. */
export const STRATEGY_KNOWLEDGE: RoleKnowledge = {
  roleId: "strategy",
  maxAgeDays: 90,
  items: [
    {
      id: "deck-5-7-points",
      ruleAr: "حسب مقال لمدير في Y Combinator: اخرج من كل ما يميز شركتك بخمس إلى سبع نقاط رئيسية فقط، فالجمهور لا يتذكر بعد عرض قصير إلا القليل، ثم اجعل الشرائح مقروءة وبسيطة وواضحة، وكل شريحة تعبّر عن فكرة واحدة.",
      sourceUrl: "https://www.ycombinator.com/blog/how-to-design-a-better-pitch-deck",
      sourceTitle: "Kevin Hale، How to Design a Better Pitch Deck (Y Combinator)",
      sourceDate: "2015-11-15",
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "safe-definition",
      ruleAr: "حسب صفحة Y Combinator: الـ SAFE (اتفاقية بسيطة للأسهم المستقبلية) عقد قصير يوقّعه المستثمر ليموّل الشركة الآن مقابل حق في أسهم لاحقاً، ويتحول إلى أسهم عند جولة تسعير، وغالباً البند الوحيد المتفاوض عليه هو سقف التقييم. هذا وصف لأداة وليس نصيحة بالاستخدام، والبنود تُراجَع مع محامٍ، وقانونية استخدامه في مصر غير مفحوصة.",
      sourceUrl: "https://www.ycombinator.com/documents",
      sourceTitle: "Y Combinator، The SAFE",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
  ],
  workflowAr: [
    "اقرأ مخرجات الأدوار السابقة كمسودات غير مراجَعة؛ لا ترفع أي ادعاء منها إلى عرض المستثمر إلا إن وُسم user_fact.",
    "اكتب السرد: المشكلة، الحل، العميل، لماذا الآن (basis)، دون أرقام سوق أو إيرادات أو مستخدمين لم يقدمها المؤسس.",
    "مخطط شرائح قصير: كل شريحة فكرة واحدة، من خمس إلى سبع نقاط رئيسية.",
    "قائمة مستندات الجاهزية (data room) وأسئلة صعبة متوقعة مع مسودة إجابة صادقة وbasis.",
    "قيّم الجاهزية للجمع بصدق: met أو not_met أو unknown مع الدليل؛ حكم التحقق «توقف» أو غير المحسوم يعني not_met.",
    "لا تحدد مبلغ جمع أو تقييماً ولا تذكر أسماء مستثمرين معيّنين كمنفتحين على الاستثمار؛ ولا تتواصل مع أحد. شروط الأسهم والعقود إلى handoff لدور legal.",
    "كل ما هنا غير ملزم وليس استشارة استثمارية أو قانونية.",
  ],
};
