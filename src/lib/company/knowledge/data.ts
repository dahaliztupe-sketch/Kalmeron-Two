import type { RoleKnowledge } from "./types";

/** Analytics practice. Only what the opened pages say. */
export const DATA_KNOWLEDGE: RoleKnowledge = {
  roleId: "data",
  maxAgeDays: 90,
  items: [
    {
      id: "fixed-sample-size",
      ruleAr: "لا توقف تجربة A/B بمجرد ظهور نتيجة «معنوية» أثناء المراقبة المتكررة: حساب الدلالة الإحصائية يفترض حجم عينة محدداً مسبقاً، والتوقف المبكر يزيد الإيجابيات الكاذبة. حدد حجم العينة وقاعدة القرار قبل البدء.",
      sourceUrl: "https://www.evanmiller.org/how-not-to-run-an-ab-test.html",
      sourceTitle: "Evan Miller، How Not To Run an A/B Test",
      sourceDate: "2010-04-18",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "dora-as-trend",
      ruleAr: "مقاييس DORA لتسليم البرمجيات تُعرَّف كمؤشرات أمامية وخلفية معاً؛ استخدمها كاتجاه للمراقبة في الفريق وليس كهدف منفرد.",
      sourceUrl: "https://dora.dev/guides/dora-metrics/",
      sourceTitle: "DORA: software delivery performance metrics",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "pdpl-consent-analytics",
      ruleAr: "حسب ترجمة قانون حماية البيانات الشخصية رقم 151 لسنة 2020: لا يجوز جمع البيانات الشخصية أو معالجتها إلا بموافقة صريحة من صاحبها أو في الحالات التي يجيزها القانون، والغرض مشروع ومحدد ولا تُحفظ مدة أطول من اللازم. ينطبق على أحداث التتبع التي تربط سلوكاً بشخص معرَّف. ترجمة غير رسمية، فاستشر محامياً.",
      sourceUrl: "https://natlex.ilo.org/dyn/natlex2/natlex2/files/download/111246/EGY111246%20Eng.pdf",
      sourceTitle: "ILO NATLEX: Egypt Law No. 151 of 2020, Personal Data Protection Law (English translation)",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
  ],
  workflowAr: [
    "ابدأ بسؤال القرار: ما القرار الذي ستغيّره الأرقام؟ ثم اختر مقياس نجمة واحداً وعدداً قليلاً من المقاييس المدخلة.",
    "اكتب خطة أحداث: اسم بصيغة snake_case، ومتى يُطلق، وخصائصه، وهل يحمل بيانات شخصية.",
    "قلّل البيانات الشخصية: لا تربط حدثاً بشخص معرَّف إلا بحاجة وموافقة؛ ما يحتاج تحققاً قانونياً يذهب إلى handoff لدور legal.",
    "لوحة أولى صغيرة: كل لوحة تجيب أسئلة محددة.",
    "التجارب فقط عند وجود حركة كافية: حدد حجم العينة وقاعدة القرار مسبقاً، ولا تتوقف عند أول نتيجة.",
    "لا تخترع قيماً مستهدفة أو معايير سوق؛ اكتب الهدف كافتراض basis.",
  ],
};
