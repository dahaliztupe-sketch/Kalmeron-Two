import type { RoleKnowledge } from "./types";

/** Customer support practice. Vendor guides are secondary sources. */
export const SUPPORT_KNOWLEDGE: RoleKnowledge = {
  roleId: "support",
  maxAgeDays: 60,
  items: [
    {
      id: "knowledge-base-first",
      ruleAr: "ابدأ بالخدمة الذاتية: قاعدة معرفة منظمة وقابلة للبحث تقلل الأسئلة الواردة، ومحتواها الجيد يصلح لاحقاً مادة تدريب لأدوات الذكاء الاصطناعي. دليل من مزوّد أدوات دعم، فهو مصدر ثانوي ومصلحة تجارية.",
      sourceUrl: "https://www.helpscout.com/helpu/saas-customer-support/",
      sourceTitle: "Help Scout، The Ultimate Guide to SaaS Customer Support in 2026",
      sourceDate: "2025-06-26",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "support-feeds-product",
      ruleAr: "فريق الدعم أكثر من يحتك بالعملاء، فيجمع معلومات عن احتياجاتهم ومشكلاتهم وطلباتهم؛ أعد هذه المعلومات إلى المنتج بشكل منتظم.",
      sourceUrl: "https://www.helpscout.com/helpu/saas-customer-support/",
      sourceTitle: "Help Scout، The Ultimate Guide to SaaS Customer Support in 2026",
      sourceDate: "2025-06-26",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "metrics-basket",
      ruleAr: "المقاييس وحدها لا تروي القصة: استخدم سلة مقاييس (مثل معدل التواصل = الطلبات الجديدة ÷ المستخدمين النشطين × 100، ومقياس جهد العميل) وقارنها بملاحظات العملاء الفعلية، ولا تكتفِ برقم واحد.",
      sourceUrl: "https://www.helpscout.com/helpu/saas-customer-support/",
      sourceTitle: "Help Scout، The Ultimate Guide to SaaS Customer Support in 2026",
      sourceDate: "2025-06-26",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "pdpl-customer-data",
      ruleAr: "حسب ترجمة قانون حماية البيانات الشخصية رقم 151 لسنة 2020: لا يجوز جمع بيانات العملاء أو معالجتها أو الإفصاح عنها إلا بموافقة صريحة أو في الحالات التي يجيزها القانون، ولا تُحفظ مدة أطول من اللازم. ترجمة غير رسمية، فاستشر محامياً.",
      sourceUrl: "https://natlex.ilo.org/dyn/natlex2/natlex2/files/download/111246/EGY111246%20Eng.pdf",
      sourceTitle: "ILO NATLEX: Egypt Law No. 151 of 2020, Personal Data Protection Law (English translation)",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
  ],
  workflowAr: [
    "ابدأ بالأسئلة المتوقعة من خطة المنتج والتسعير؛ لا تخترع سياسات (استرداد، ضمان، مواعيد رد) لم يقرّها المؤسس: اكتبها needs_check.",
    "قاعدة معرفة صغيرة: المواضيع الأولى وصياغة مسودة لكل سؤال شائع.",
    "مسودات ردود لمواقف محددة، بلهجة محترمة وبلا وعود. لا ترسل شيئاً لأحد؛ هي مسودات يقرأها المؤسس.",
    "قواعد تصعيد: متى يتدخل المؤسس أو القانون أو الهندسة.",
    "لا تطلب من العميل بيانات بطاقة أو كلمة مرور في أي رد.",
    "اجمع ملاحظات العملاء لتعود إلى المنتج، وحدد مقاييس قليلة (معدل التواصل، زمن أول رد كمتابعة وليس وعداً).",
  ],
};
