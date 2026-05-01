/**
 * Kalmeron Workflows — seed library
 * ---------------------------------
 * Five hand-tuned starter workflows that exercise the runner end-to-end.
 * Authored as plain JSON specs so they can be edited in the UI, persisted
 * in Firestore, and audited.
 *
 * Token syntax in `prompt`:
 *   - `{{input.<name>}}`              — value from the trigger form
 *   - `{{steps.<stepId>.<output>}}`   — value from a previous step
 */

import type { Workflow } from "./runner";

export const WORKFLOW_LIBRARY: Workflow[] = [
  {
    id: "idea-to-mvp",
    title: "من الفكرة إلى النموذج الأوّلي",
    description: "تحلّل فكرتك، تستخرج المخاطر القاتلة، وتبني خطة تنفيذ في 6 خطوات.",
    inputs: [
      { name: "idea", label: "الفكرة", placeholder: "تطبيق توصيل من الصيدليات في القاهرة", required: true },
      { name: "city", label: "المدينة المستهدفة", placeholder: "القاهرة", required: true },
    ],
    steps: [
      {
        id: "analyze",
        agent: "idea-analyst",
        prompt: "حلّل الفكرة التالية للسوق المصري: «{{input.idea}}» في مدينة {{input.city}}. ركّز على حجم السوق، المنافسين، وعوامل النجاح.",
        outputs: ["text"],
      },
      {
        id: "risks",
        agent: "mistake-shield",
        prompt: "بناءً على هذا التحليل: {{steps.analyze.text}}\n\nاستخرج أكبر 5 مخاطر قاتلة قد تواجه المشروع، مع طريقة تجنّب كلّ منها.",
        outputs: ["text"],
      },
      {
        id: "plan",
        agent: "plan-builder",
        prompt: "اصنع خطة تنفيذية لـ 90 يوماً لإطلاق نموذج أوّلي قابل للاختبار، مع مراعاة:\n- التحليل: {{steps.analyze.text}}\n- المخاطر: {{steps.risks.text}}",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "fundraise-readiness",
    title: "جاهزية جمع التمويل التأسيسي",
    description: "تكتب ملخّص العرض، قائمة المستثمرين، ورسالة التواصل الأولى.",
    inputs: [
      { name: "company", label: "اسم الشركة", placeholder: "كلميرون", required: true },
      { name: "stage", label: "المرحلة", placeholder: "Pre-seed / Seed / Series A", required: true },
      { name: "ask", label: "حجم الجولة (USD)", placeholder: "500000", required: true },
    ],
    steps: [
      {
        id: "pitch",
        agent: "cfo",
        prompt: "اكتب ملخّصاً تنفيذياً (Executive Summary) من 200 كلمة لشركة {{input.company}} في مرحلة {{input.stage}} تجمع جولة {{input.ask}} دولار.",
        outputs: ["text"],
      },
      {
        id: "investors",
        agent: "opportunity-radar",
        prompt: "اقترح 5 صناديق استثمارية أو مستثمرين ملائكيين في مصر/الخليج يستثمرون في مرحلة {{input.stage}}، مع سبب الملاءمة.",
        outputs: ["text"],
      },
      {
        id: "outreach",
        agent: "general-chat",
        prompt: "اكتب رسالة بريد إلكتروني (4 فقرات) للمستثمر الأوّل من القائمة، باستخدام:\n- الملخّص: {{steps.pitch.text}}\n- قائمة المستثمرين: {{steps.investors.text}}",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "weekly-investor-update",
    title: "تحديث المستثمرين الأسبوعي",
    description: "يُجمّع المؤشّرات، يُبرز المكاسب والطلبات، ويصيغ تحديثاً جاهزاً للإرسال.",
    inputs: [
      { name: "metrics", label: "المؤشّرات الرئيسية للأسبوع", placeholder: "MRR=12000, NPS=64, Churn=2.1%", required: true },
      { name: "wins", label: "أهمّ مكسبين", placeholder: "أوّل عميل enterprise، تكامل مع …", required: true },
      { name: "asks", label: "طلبات/تحديات", placeholder: "نحتاج معارف في قطاع …", required: false },
    ],
    steps: [
      {
        id: "frame",
        agent: "general-chat",
        prompt: "صُغ تحديثاً أسبوعياً للمستثمرين بنبرة مهنية وموجزة. المؤشّرات: {{input.metrics}}. المكاسب: {{input.wins}}. الطلبات: {{input.asks}}",
        outputs: ["text"],
      },
      {
        id: "polish",
        agent: "general-chat",
        prompt: "أعد صياغة هذا التحديث ليكون أكثر إيجازاً وحدّة، بحدّ أقصى 180 كلمة:\n\n{{steps.frame.text}}",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "compliance-egypt",
    title: "خارطة الامتثال - السوق المصري",
    description: "تستخرج المتطلّبات القانونية والضريبية، وترتّب الخطوات حسب الأولوية.",
    inputs: [
      { name: "businessType", label: "نوع النشاط", placeholder: "SaaS B2B / متجر إلكتروني / استشارات", required: true },
      { name: "headcount", label: "عدد الموظّفين الحالي", placeholder: "5", required: true },
    ],
    steps: [
      {
        id: "legal",
        agent: "legal",
        prompt: "اذكر المتطلّبات القانونية لتأسيس وتشغيل {{input.businessType}} في مصر بعدد موظّفين {{input.headcount}}.",
        outputs: ["text"],
      },
      {
        id: "tax",
        agent: "cfo",
        prompt: "بناءً على {{steps.legal.text}}، اشرح المتطلّبات الضريبية (DT, VAT, مرتّبات) لهذا النشاط، وقدّم جدولاً زمنياً سنوياً.",
        outputs: ["text"],
      },
      {
        id: "priorities",
        agent: "plan-builder",
        prompt: "رتّب الخطوات حسب الأولوية في 30/60/90 يوماً:\n- قانونياً: {{steps.legal.text}}\n- ضريبياً: {{steps.tax.text}}",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "saas-pricing",
    title: "تسعير منتج اشتراكي",
    description: "بحث، تصميم 3 باقات، رسالة تجريب أسعار جاهزة.",
    inputs: [
      { name: "product", label: "وصف المنتج", placeholder: "أداة تحليل منافسين للوكالات", required: true },
      { name: "icp", label: "الجمهور المستهدف", placeholder: "وكالات تسويق صغيرة 5-20 شخصاً", required: true },
    ],
    steps: [
      {
        id: "research",
        agent: "opportunity-radar",
        prompt: "ابحث عن أسعار 5 منتجات مشابهة لـ {{input.product}} موجَّهة لـ {{input.icp}}، مع نطاقات الأسعار وما يقدّمه كل منها.",
        outputs: ["text"],
      },
      {
        id: "tiers",
        agent: "cfo",
        prompt: "بناءً على البحث: {{steps.research.text}}\nصمّم 3 باقات (Starter/Pro/Enterprise) بأسعار شهرية وسنوية، مع المزايا الرئيسية لكل باقة.",
        outputs: ["text"],
      },
      {
        id: "test",
        agent: "general-chat",
        prompt: "اكتب رسالة بريد إلكتروني (3 فقرات) لاختبار هذه الأسعار {{steps.tiers.text}} مع 10 عملاء محتملين.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "brand-voice-builder",
    title: "بناء صوت العلامة التجارية",
    description: "تحدد شخصية علامتك التجارية، تكتب دليل الأسلوب، وتنشئ نماذج محتوى جاهزة.",
    inputs: [
      { name: "brand", label: "اسم العلامة التجارية أو الشركة", placeholder: "كلميرون", required: true },
      { name: "audience", label: "الجمهور المستهدف", placeholder: "مؤسسو شركات ناشئة مصريون 25-40 سنة", required: true },
      { name: "values", label: "القيم الأساسية (3-5 قيم)", placeholder: "الثقة، الابتكار، البساطة", required: true },
    ],
    steps: [
      {
        id: "persona",
        agent: "cmo",
        prompt: "حدّد شخصية العلامة التجارية لـ {{input.brand}} الموجَّهة لـ {{input.audience}} بقيم {{input.values}}. اكتب: الصوت (3 صفات)، الأسلوب، وما يجب تجنبه.",
        outputs: ["text"],
      },
      {
        id: "guide",
        agent: "cmo",
        prompt: "بناءً على هذه الشخصية: {{steps.persona.text}}\nأنشئ دليل أسلوب مختصر (Style Guide) يشمل: لغة التواصل، نبرة المحتوى، أمثلة على جمل صحيحة وخاطئة.",
        outputs: ["text"],
      },
      {
        id: "samples",
        agent: "cmo",
        prompt: "اكتب 5 نماذج محتوى جاهزة لـ {{input.brand}} بناءً على الدليل:\n{{steps.guide.text}}\n\nالنماذج: منشور LinkedIn، رسالة ترحيب، توصيف منتج، رد على شكوى، call-to-action.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "hiring-plan",
    title: "خطة توظيف أول 5 موظفين",
    description: "يحدد الأدوار الحرجة، يكتب وصف وظيفي، ويصمم مسار المقابلة.",
    inputs: [
      { name: "stage", label: "مرحلة الشركة", placeholder: "Pre-Seed / Seed", required: true },
      { name: "product", label: "نوع المنتج أو الخدمة", placeholder: "تطبيق جوال للتوصيل", required: true },
      { name: "budget", label: "ميزانية الرواتب الشهرية (EGP)", placeholder: "50000", required: true },
    ],
    steps: [
      {
        id: "roles",
        agent: "chro",
        prompt: "حدد أول 5 أدوار حرجة يجب توظيفها لشركة {{input.product}} في مرحلة {{input.stage}} بميزانية {{input.budget}} جنيه شهرياً. رتّبها حسب الأولوية مع تبرير.",
        outputs: ["text"],
      },
      {
        id: "jd",
        agent: "chro",
        prompt: "اكتب وصفاً وظيفياً احترافياً للدور الأول من:\n{{steps.roles.text}}\n\nالوصف يشمل: المهام، المتطلبات، الراتب المقترح، ومميزات العمل.",
        outputs: ["text"],
      },
      {
        id: "interview",
        agent: "chro",
        prompt: "صمّم مسار مقابلة للدور المحدد ({{steps.jd.text}}) في 3 مراحل: فلترة أولية، مقابلة تقنية، ومقابلة ثقافية. ضمّن 5 أسئلة لكل مرحلة.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "customer-discovery",
    title: "بحث عملاء (Customer Discovery)",
    description: "يبني فرضيات العميل، يصمم أسئلة المقابلة، ويحلل النتائج.",
    inputs: [
      { name: "problem", label: "المشكلة المفترضة", placeholder: "المؤسسون يضيعون وقتاً في المحاسبة", required: true },
      { name: "segment", label: "شريحة العملاء المستهدفة", placeholder: "أصحاب المشاريع الصغيرة في مصر", required: true },
    ],
    steps: [
      {
        id: "hypotheses",
        agent: "idea-analyst",
        prompt: "صغ 5 فرضيات قابلة للاختبار لمشكلة «{{input.problem}}» بين «{{input.segment}}». لكل فرضية: الافتراض، ومعيار الصحة.",
        outputs: ["text"],
      },
      {
        id: "questions",
        agent: "idea-analyst",
        prompt: "بناءً على الفرضيات:\n{{steps.hypotheses.text}}\n\nاكتب 12 سؤال مقابلة عميق لاكتشاف المشكلة (ليس لبيع المنتج). صنّفها: خلفية، مشكلة، سلوك حالي، قياس الألم.",
        outputs: ["text"],
      },
      {
        id: "analysis",
        agent: "idea-analyst",
        prompt: "اكتب قالب جاهز لتحليل نتائج 10 مقابلات عملاء مبنياً على الفرضيات:\n{{steps.hypotheses.text}}\n\nالقالب يشمل: جدول تجميع، أنماط متكررة، قرار Go/No-Go.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "social-media-strategy",
    title: "استراتيجية تواصل اجتماعي 30 يوم",
    description: "يحدد القنوات، يبني تقويم محتوى، ويكتب أول 10 منشورات.",
    inputs: [
      { name: "brand", label: "اسم العلامة التجارية", placeholder: "متجر ملابس محلي", required: true },
      { name: "audience", label: "الجمهور المستهدف", placeholder: "نساء مصريات 20-35", required: true },
      { name: "goal", label: "الهدف الرئيسي", placeholder: "زيادة المبيعات / بناء متابعين / تعزيز الوعي", required: true },
    ],
    steps: [
      {
        id: "channels",
        agent: "cmo",
        prompt: "حدد أفضل 3 قنوات تواصل اجتماعي لـ {{input.brand}} للوصول لـ {{input.audience}} بهدف {{input.goal}}. لكل قنال: سبب الاختيار، نوع المحتوى المناسب، وتكرار النشر.",
        outputs: ["text"],
      },
      {
        id: "calendar",
        agent: "cmo",
        prompt: "بناءً على القنوات:\n{{steps.channels.text}}\n\nبناء تقويم محتوى لـ 4 أسابيع (7 منشورات/أسبوع) مع: اليوم، القناة، نوع المحتوى، الهاشتاقات المقترحة.",
        outputs: ["text"],
      },
      {
        id: "posts",
        agent: "cmo",
        prompt: "اكتب أول 10 منشورات جاهزة للنشر لـ {{input.brand}} بناءً على التقويم:\n{{steps.calendar.text}}\n\nكل منشور: النص الكامل + call-to-action + اقتراح للصورة.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "ops-sop-builder",
    title: "بناء إجراءات التشغيل القياسية (SOP)",
    description: "يحلل العملية، يوثّقها في SOP، ويبني قائمة مراجعة.",
    inputs: [
      { name: "process", label: "العملية المراد توثيقها", placeholder: "استقبال العميل الجديد / معالجة الشكاوى", required: true },
      { name: "team", label: "الفريق المسؤول", placeholder: "فريق المبيعات / خدمة العملاء", required: true },
    ],
    steps: [
      {
        id: "map",
        agent: "coo",
        prompt: "ارسم خريطة تفصيلية لعملية «{{input.process}}» لدى {{input.team}}. حدد: المدخلات، الخطوات المتسلسلة، القرارات، المخرجات، ونقاط الفشل الشائعة.",
        outputs: ["text"],
      },
      {
        id: "sop",
        agent: "coo",
        prompt: "بناءً على الخريطة:\n{{steps.map.text}}\n\nاكتب SOP كاملاً بصيغة احترافية يشمل: الغرض، النطاق، المسؤوليات، الخطوات المرقّمة، والاستثناءات.",
        outputs: ["text"],
      },
      {
        id: "checklist",
        agent: "coo",
        prompt: "استخرج من الـ SOP:\n{{steps.sop.text}}\n\nقائمة مراجعة يومية (Checklist) للفريق وقائمة KPIs لقياس جودة تنفيذ هذه العملية.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "financial-model-lean",
    title: "نموذج مالي مبسّط للمستثمر",
    description: "يحسب Unit Economics، يتوقع الإيرادات 12 شهراً، ويكتب ملخص CFO.",
    inputs: [
      { name: "price", label: "سعر البيع للعميل (EGP/شهر)", placeholder: "299", required: true },
      { name: "cac", label: "تكلفة اكتساب عميل CAC (EGP)", placeholder: "150", required: true },
      { name: "churn", label: "معدل الاضطراب الشهري (%)", placeholder: "5", required: true },
      { name: "growth", label: "معدل نمو العملاء الشهري (%)", placeholder: "15", required: true },
    ],
    steps: [
      {
        id: "unit",
        agent: "cfo",
        prompt: "احسب Unit Economics:\n- السعر: {{input.price}} EGP\n- CAC: {{input.cac}} EGP\n- Churn: {{input.churn}}%\n\nاحسب: LTV، LTV/CAC، Payback Period، Gross Margin المفترض 70%.",
        outputs: ["text"],
      },
      {
        id: "forecast",
        agent: "cfo",
        prompt: "بناءً على:\n- نتائج Unit Economics: {{steps.unit.text}}\n- نمو شهري: {{input.growth}}%\n- Churn: {{input.churn}}%\n\nابنِ توقع MRR لـ 12 شهراً ابتداءً من 10 عملاء. أظهر: العملاء، MRR، التراكمي.",
        outputs: ["text"],
      },
      {
        id: "memo",
        agent: "cfo",
        prompt: "اكتب ملخص CFO (CFO Memo) من 150 كلمة بناءً على:\n- Unit Economics: {{steps.unit.text}}\n- التوقع: {{steps.forecast.text}}\n\nالملخص للمستثمر: مدى الاستدامة، متى يصل Breakeven، والتوصية.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "product-launch-plan",
    title: "خطة إطلاق منتج جديد",
    description: "يبني الرسائل التسويقية، خطة ما قبل الإطلاق، ويوم الإطلاق.",
    inputs: [
      { name: "product", label: "المنتج أو الخدمة", placeholder: "تطبيق محاسبة للمطاعم", required: true },
      { name: "usp", label: "الميزة التنافسية الرئيسية", placeholder: "ربط POS مع المحاسبة تلقائياً", required: true },
      { name: "launch_date", label: "تاريخ الإطلاق المقرر", placeholder: "خلال 30 يوم", required: true },
    ],
    steps: [
      {
        id: "messaging",
        agent: "cmo",
        prompt: "اكتب الرسائل التسويقية الرئيسية لـ {{input.product}} بميزة {{input.usp}}: العنوان الرئيسي، جملة القيمة (value prop)، و3 فوائد رئيسية موجّهة لكل شريحة.",
        outputs: ["text"],
      },
      {
        id: "prelaunch",
        agent: "cmo",
        prompt: "بناءً على الرسائل:\n{{steps.messaging.text}}\n\nأنشئ خطة ما قبل الإطلاق لـ {{input.launch_date}} تشمل: قائمة الانتظار، teaser content، وأنشطة بناء الترقب.",
        outputs: ["text"],
      },
      {
        id: "launch_day",
        agent: "cmo",
        prompt: "اكتب خطة يوم الإطلاق الكاملة لـ {{input.product}} بناءً على:\n- الرسائل: {{steps.messaging.text}}\n- ما قبل الإطلاق: {{steps.prelaunch.text}}\n\nتشمل: جدول توقيت ساعة بساعة، القنوات، الردود الجاهزة للأسئلة الشائعة.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "risk-audit",
    title: "مراجعة المخاطر الاستراتيجية",
    description: "يحدد المخاطر الرئيسية، يقيّمها، ويبني خطة تخفيف.",
    inputs: [
      { name: "business", label: "وصف النشاط التجاري", placeholder: "منصة SaaS لإدارة الموارد البشرية", required: true },
      { name: "stage", label: "المرحلة الحالية", placeholder: "Series A / Seed", required: true },
    ],
    steps: [
      {
        id: "identify",
        agent: "mistake-shield",
        prompt: "حدد أكبر 10 مخاطر استراتيجية لـ {{input.business}} في مرحلة {{input.stage}} في السوق المصري. صنّفها: سوقية، تقنية، قانونية، مالية، تشغيلية.",
        outputs: ["text"],
      },
      {
        id: "matrix",
        agent: "mistake-shield",
        prompt: "بناءً على:\n{{steps.identify.text}}\n\nأنشئ مصفوفة المخاطر: احتمالية (1-5) × أثر (1-5) = درجة. رتّبها تنازلياً وحدد 3 مخاطر حرجة.",
        outputs: ["text"],
      },
      {
        id: "mitigation",
        agent: "mistake-shield",
        prompt: "للمخاطر الحرجة الثلاثة من:\n{{steps.matrix.text}}\n\nضع خطة تخفيف مفصّلة: الإجراء الوقائي، الخطة البديلة (Plan B)، والمسؤول، والجدول الزمني.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "partnership-deck",
    title: "ملف شراكة استراتيجية",
    description: "يحدد شركاء محتملين، يبني عرض القيمة، ويكتب خطاب التواصل.",
    inputs: [
      { name: "company", label: "اسم شركتك", placeholder: "تك برو", required: true },
      { name: "offering", label: "ما تقدمه للشريك", placeholder: "قاعدة عملاء 10,000 مستخدم في القاهرة", required: true },
      { name: "seeking", label: "ما تحتاجه من الشريك", placeholder: "شبكة توزيع في الإسكندرية", required: true },
    ],
    steps: [
      {
        id: "prospects",
        agent: "cso",
        prompt: "اقترح 5 شركاء استراتيجيين محتملين لشركة {{input.company}} التي تقدم {{input.offering}} وتحتاج {{input.seeking}}. لكل شريك: الاسم، المبرر، نوع الشراكة المقترحة.",
        outputs: ["text"],
      },
      {
        id: "value_prop",
        agent: "cso",
        prompt: "بناءً على الشريك الأول من:\n{{steps.prospects.text}}\n\nبناء عرض القيمة للشراكة: ماذا يكسب الطرفان، كيف تعمل الشراكة، ومؤشرات النجاح.",
        outputs: ["text"],
      },
      {
        id: "outreach",
        agent: "cso",
        prompt: "اكتب بريد إلكتروني احترافي (3 فقرات) للشريك المحتمل الأول بناءً على:\n- الشراكة المقترحة: {{steps.prospects.text}}\n- عرض القيمة: {{steps.value_prop.text}}\n\nالهدف: تحديد اجتماع استكشافي.",
        outputs: ["text"],
      },
    ],
  },
  {
    id: "okr-builder",
    title: "بناء OKRs الربع القادم",
    description: "يحول أهداف الشركة إلى OKRs قابلة للقياس لكل قسم.",
    inputs: [
      { name: "company_goal", label: "الهدف الرئيسي للربع", placeholder: "مضاعفة الإيرادات ورفع رضا العملاء", required: true },
      { name: "departments", label: "الأقسام (مفصولة بفاصلة)", placeholder: "المبيعات، التقنية، التسويق، خدمة العملاء", required: true },
    ],
    steps: [
      {
        id: "company_okr",
        agent: "ceo",
        prompt: "تحويل الهدف الربعي «{{input.company_goal}}» إلى 2-3 Objectives على مستوى الشركة، مع 3 Key Results قابلة للقياس لكل Objective.",
        outputs: ["text"],
      },
      {
        id: "dept_okrs",
        agent: "coo",
        prompt: "بناءً على OKRs الشركة:\n{{steps.company_okr.text}}\n\nبناء OKRs متوافقة لكل قسم من: {{input.departments}}\n\nلكل قسم: Objective واحد + 3 Key Results محددة وقابلة للقياس.",
        outputs: ["text"],
      },
      {
        id: "tracking",
        agent: "coo",
        prompt: "بناءً على OKRs الأقسام:\n{{steps.dept_okrs.text}}\n\nصمّم نظام متابعة أسبوعي: مؤشر الصحة لكل KR (Green/Yellow/Red)، تعريف كل مؤشر، وجلسة Review أسبوعية مقترحة.",
        outputs: ["text"],
      },
    ],
  },
];

export function findWorkflow(id: string) {
  return WORKFLOW_LIBRARY.find((w) => w.id === id);
}
