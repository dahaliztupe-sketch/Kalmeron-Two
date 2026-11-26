import type { RoleKnowledge } from "./types";

/**
 * Egypt company registration. Read on reviewedOn. The GAFI guide is an official English
 * translation whose own disclaimer says the Arabic text prevails and it is not legal text:
 * claims taken from it are "verified_primary" only in the sense that they appear on the official page.
 * Fees and rules change; every output item stays needs_check. Not legal advice.
 */
export const LEGAL_KNOWLEDGE: RoleKnowledge = {
  roleId: "legal",
  maxAgeDays: 60,
  items: [
    {
      id: "gafi-guide-translation-disclaimer",
      ruleAr: "دليل الهيئة العامة للاستثمار (GAFI) بالإنجليزية ترجمة للمعلومات فقط، وليست نصاً قانونياً، وعند التعارض يسود النص العربي؛ وهو قابل للتحديث. لذلك تُراجع أي خطوة أو رسم مع النص العربي الحالي ومع محامٍ أو محاسب مرخّص.",
      sourceUrl: "https://gafiadmin.gafi.gov.eg/media/n22f13kw/isc-guide-2026_eng_19102026_final.pdf",
      sourceTitle: "GAFI: Investor Service Center Procedural Guidebook (English translation)",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "gafi-entity-minimums",
      ruleAr: "حسب الدليل: شركة الشخص الواحد يجب ألا يقل رأس مالها المودع عن 1000 جنيه؛ الشركة ذات المسؤولية المحدودة من 2 إلى 50 شريكاً؛ شركة المساهمة 3 مؤسسين على الأقل ورأس مال مصدر لا يقل عن 250,000 جنيه مع إيداع 10% على الأقل من رأس المال المصدر. قد تفرض قوانين النشاط حداً أدنى أعلى. راجع محامياً قبل الاعتماد.",
      sourceUrl: "https://gafiadmin.gafi.gov.eg/media/n22f13kw/isc-guide-2026_eng_19102026_final.pdf",
      sourceTitle: "GAFI: Investor Service Center Procedural Guidebook (English translation)",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "gafi-incorporation-steps-docs",
      ruleAr: "حسب الدليل: الخطوات تشمل شهادة عدم تشابه الاسم من السجل التجاري، وخطاب بنك بإيداع رأس المال، وتصديق عقد التأسيس بمحامٍ، وشهادة قيد مراقب الحسابات، وصور بطاقات الهوية، وموافقات جهات النشاط إن لزمت. التقديم عبر بوابة GAFI الإلكترونية أو مركز خدمة المستثمرين؛ وشركة الشخص الواحد وشركة المساهمة تؤسَّسان عبر مركز خدمة المستثمرين فقط، والمنشأة الفردية عبر البوابة أو المركز. الرسوم تُحسب كنسب من رأس المال وتتغير: لا تُستخدم أرقام دون مراجعة المصدر الحالي.",
      sourceUrl: "https://gafiadmin.gafi.gov.eg/media/n22f13kw/isc-guide-2026_eng_19102026_final.pdf",
      sourceTitle: "GAFI: Investor Service Center Procedural Guidebook (English translation)",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
  ],
  workflowAr: [
    "ابدأ بتنبيه أن المخرجات ليست استشارة قانونية وأن الإنفاذ والتقديم يقومان به المؤسس أو محامٍ.",
    "من الملخص حدد الخيارات المحتملة للشكل القانوني (منشأة فردية، شركة شخص واحد، ذات مسؤولية محدودة، مساهمة) مع سبب الملاءمة وbasis.",
    "اكتب قائمة خطوات التسجيل بالترتيب، لكل خطوة الجهة والمستندات ومصدرها، وأي رسم أو شرط أو حد أدنى يحمل needs_check.",
    "لا تقدّم نسباً أو رسوماً أو مواعيد كحقائق. ما لم تقرأه من نص رسمي أو دليل رسمي حالي فهو ثانوي أو يحتاج تحققاً.",
    "اذكر الأنشطة التي قد تحتاج ترخيصاً خاصاً أو موافقة جهة ولا تخمّنها.",
    "أنهِ بسطر واضح: استشر محامياً أو محاسباً مرخصاً قبل أي تقديم. العقود والضرائب وبيانات الأفراد تُحوَّل إلى handoff.",
  ],
};
