import type { RoleKnowledge } from "./types";

/**
 * Seed. Every item below was opened on 2026-11-26. Egypt tax claims come from
 * the official Egyptian Tax Authority site but are undated or dated 2022, so
 * they must be re-read before use. This is not tax advice.
 */
export const FINANCE_KNOWLEDGE: RoleKnowledge = {
  roleId: "finance",
  maxAgeDays: 60,
  items: [
    {
      id: "break-even-definition",
      ruleAr: "نقطة التعادل هي حجم المبيعات الذي تتساوى عنده الإيرادات الكلية مع التكاليف الكلية الثابتة والمتغيرة. الحساب يفترض سعر بيع ثابتاً وتكاليف يمكن فصلها إلى ثابتة ومتغيرة لكل وحدة؛ اذكر هذه الافتراضات صراحة.",
      sourceUrl: "https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars",
      sourceTitle: "OpenStax: 3.2 Calculate a Break-Even Point in Units and Dollars",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "cash-forecast-direct-weekly",
      ruleAr: "توقع النقد يُبنى من المقبوضات والمدفوعات الفعلية المتوقعة (الطريقة المباشرة) لا من الربح، لأن الربح والنقد يتحركان بجدولين مختلفين. الأفق الشائع 13 أسبوعاً (91 يوماً) ويُحدَّث دورياً؛ هنا نستخدم 3 أشهر ونذكر افتراض توقيت التحصيل. (مدونة شركة قوالب، ثانوية)",
      sourceUrl: "https://pilta.com/13-week-cash-flow-forecast/",
      sourceTitle: "PILTA: 13-Week Cash Flow Forecast: Guide and Template",
      sourceDate: "2026-11-19",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "eg-vat-threshold",
      ruleAr: "تذكر مصلحة الضرائب المصرية أن حد التسجيل الإلزامي في ضريبة القيمة المضافة 500 ألف جنيه، وأن الإعفاء لا يكون إلا بنص القانون. الصفحة بلا تاريخ، فتحقق من سريان الحد حالياً. استشر محاسباً قانونياً قبل أي قرار ضريبي.",
      sourceUrl: "https://eta.gov.eg/ar/node/1379",
      sourceTitle: "مصلحة الضرائب المصرية: حد التسجيل الإلزامي لضريبة القيمة المضافة",
      sourceDate: null,
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "eg-law-152-simplified-tax",
      ruleAr: "بحسب بيان لرئيس مصلحة الضرائب بتاريخ 2022-06-21، يتيح القانون 152 لسنة 2020 نظاماً ضريبياً مبسطاً (ضريبة قطعية حسب حجم المبيعات) للمشروعات الصغيرة ومتناهية الصغر. البيان عمره سنوات؛ لا تذكر شرائح أو نسباً، وتحقق من النص الحالي. استشر محاسباً قانونياً.",
      sourceUrl: "https://eta.gov.eg/ar/news/qanwn-tnmyt-almshrwat-almtwstt-walsghyrt-walmtnahyt-alsghr-rqm-152-lsnt-2020-ytyh-hwafz-drybyt",
      sourceTitle: "مصلحة الضرائب المصرية: قانون تنمية المشروعات رقم 152 لسنة 2020 يتيح حوافز ضريبية",
      sourceDate: "2022-06-21",
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
    {
      id: "unit-economics-variable-costs",
      ruleAr: "حلل اقتصاديات الوحدة: اطرح من السعر كل تكلفة ترتفع مع كل بيعة إضافية (مثل ساعات التنفيذ ورسوم الدفع) لتحصل على مساهمة الوحدة. المقالة تنبه إلى أن أثر رفع السعر يعتمد على المبيعات التي تبقى، فلا تعد بنتيجة. (مدونة، ثانوية)",
      sourceUrl: "https://irongoo.com/guides/business/pricing-and-unit-economics-for-smbs",
      sourceTitle: "Irongoo: How to Calculate Unit Economics for a Service Business",
      sourceDate: "2026-03-21",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "pricing-cost-floor-value-ceiling",
      ruleAr: "السعر المبني على التكلفة (تكلفة الوحدة + هامش) يصلح كحد أدنى، والسعر المبني على قيمة العميل يصلح كحد أعلى، ويُختبر السعر مع السوق. لا تخترع أسعار منافسين؛ ما لم يذكره الملخص يُوسم needs_check. (صفحة شركة مدفوعات، ثانوية)",
      sourceUrl: "https://stripe.com/resources/more/cost-based-and-value-based-pricing",
      sourceTitle: "Stripe: Cost-based and value-based pricing",
      sourceDate: "2025-08-06",
      reviewedOn: "2026-11-26",
      status: "secondary",
    },
    {
      id: "eg-ipn-instapay-limits",
      ruleAr: "تذكر صفحة البنك المركزي المصري (آخر تحديث 2025-02-02) أن InstaPay يربط البنوك ويحوّل إلى حسابات وبطاقات ميزة ومحافظ، وأن حد المعاملة 70 ألف جنيه ويومياً 120 ألف وشهرياً 400 ألف لكل بنك. الحدود والرسوم تتغير؛ لم أقرأ جدول الرسوم الرسمي، فأدرج رسوم الدفع كبند needs_check دون نسب. استشر البنك أو محاسباً.",
      sourceUrl: "https://www.cbe.org.eg/en/payment-systems-and-services/instant-payment-network",
      sourceTitle: "Central Bank of Egypt: Instant Payment Network (IPN)",
      sourceDate: "2025-02-02",
      reviewedOn: "2026-11-26",
      status: "verified_primary",
    },
  ],
  workflowAr: [
    "اقرأ الملخص: الميزانية والمدة والفكرة. أي تكلفة أو سعر أو رصيد افتتاحي غير مذكور في الملخص يُوسم assumption أو needs_check، لا user_fact.",
    "ضع رسوم قنوات الدفع (إنستاباي، محافظ، بطاقات) كبند تكلفة needs_check بلا نسب مخترعة.",
    "افصل التكاليف إلى ثابتة شهرية ومتغيرة لكل وحدة، ثم حدد سعر الوحدة.",
    "ابنِ خطة نقد لـ 3 أشهر: وحدات، إيراد، تكاليف، صافي، رصيد ختامي. اذكر افتراض توقيت التحصيل.",
    "احسب نقطة التعادل = التكاليف الثابتة الشهرية ÷ (السعر − التكلفة المتغيرة للوحدة). إن كان هامش المساهمة صفراً أو سالباً فاجعلها null واشرح السبب.",
    "إن نزل الرصيد تحت الصفر أو تجاوزت التكاليف الميزانية فاذكره صراحة كخطر.",
    "الضرائب والمحاسبة القانونية: ملاحظات عامة فقط مع إحالة إلى محاسب مرخص ودور القانون.",
  ],
};
