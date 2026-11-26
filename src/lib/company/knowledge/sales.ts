import type { RoleKnowledge } from "./types";

/** Seed. Secondary sources only; a human should check each before the role is sold as expert. */
export const SALES_KNOWLEDGE: RoleKnowledge = {
  roleId: "sales",
  maxAgeDays: 90,
  items: [
    {
      id: "mom-test-past-behavior",
      ruleAr: "أسئلة المقابلات تدور حول ما فعله العميل فعلاً في الماضي لا حول رأيه في فكرتك؛ المجاملات لا تُعدّ دليلاً.",
      sourceUrl: "https://www.koji.so/docs/mom-test-user-interviews",
      sourceTitle: "Koji: How to write Mom Test questions (summarising Fitzpatrick, The Mom Test, 2013)",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "first-10-by-hand",
      ruleAr: "أول 10 عملاء غالباً يأتون من عمل يدوي مباشر: حدد أشخاصاً بعينهم، تواصل شخصياً، وأغلق كل صفقة بنفسك وسجّل أسباب القبول والرفض. (مدونة ثانوية، تذكر استطلاعاً لم أتحقق منه)",
      sourceUrl: "https://usegavel.com/playbooks/first-10-customers",
      sourceTitle: "Gavel: First 10 customers, 10 unscalable plays",
      sourceDate: "2026-05-23",
      reviewedOn: "2026-11-26",
      status: "unverified",
    },
    {
      id: "wa-opt-in",
      ruleAr: "المراسلة التسويقية على واتساب تتطلب موافقة مسبقة صريحة. نصيحة الرسائل الباردة في المصادر الأجنبية لا تُطبَّق في مصر دون مراجعة قانونية.",
      sourceUrl: "https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in/",
      sourceTitle: "Meta: Get opt-in for WhatsApp",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
  ],
  workflowAr: [
    "حدد 10 إلى 20 شخصاً أو نشاطاً بعينه يشبه العميل المستهدف، وسمِّ كيف ستصل لكل مجموعة (علاقة، إحالة، طلب منهم).",
    "اكتب أسئلة اكتشاف عن الماضي والسلوك الفعلي، بلا أسئلة افتراضية عن فكرتك.",
    "اكتب مسودات رسائل شخصية قصيرة تقدم قيمة قبل الطلب، لمن وافق أو تربطه بك علاقة.",
    "حدد مراحل الصفقة ومتى تتابع، وسجّل سبب كل قبول أو رفض.",
    "اذكر ما يحتاج تحققاً بشرياً قبل أي تواصل فعلي.",
  ],
};
