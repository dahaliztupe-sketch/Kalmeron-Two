/**
 * Programmatic SEO — Competitor Comparisons.
 * Pages: /compare/kalmeron-vs-[slug]
 */

export interface Comparison {
  slug: string;
  competitorName: string;
  competitorTagline: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  heroIntroAr: string;
  bestForKalmeron: string[];
  bestForCompetitor: string[];
  featureMatrix: {
    feature: string;
    kalmeron: 'yes' | 'no' | 'partial' | string;
    competitor: 'yes' | 'no' | 'partial' | string;
  }[];
  pricingComparison: {
    plan: string;
    kalmeron: string;
    competitor: string;
  }[];
  verdictAr: string;
  category: 'general-ai' | 'multi-agent' | 'business-ai' | 'no-code';
}

export const COMPARISONS: Comparison[] = [
  {
    slug: 'chatgpt',
    competitorName: 'ChatGPT',
    competitorTagline: 'مساعد AI عام من OpenAI',
    metaDescriptionAr: 'كلميرون vs ChatGPT: أيهما أفضل لرواد الأعمال في مصر والمنطقة العربية؟ مقارنة تفصيلية في 12 محور.',
    metaDescriptionEn: 'Kalmeron vs ChatGPT: which is better for Arab entrepreneurs? Detailed 12-dimension comparison.',
    heroIntroAr: 'ChatGPT مساعد ممتاز للأسئلة العامة. كلميرون فريق متكامل من 50+ وكيل متخصص في الأعمال والسوق المصري. أيهما أنسب لك؟',
    bestForKalmeron: [
      'رواد أعمال في مصر/المنطقة العربية',
      'تأسيس شركة من الصفر',
      'الامتثال للقانون المصري (151) والخليجي',
      'العمل بالعامية والفصحى',
      'فريق وكلاء متخصصين (مالي، قانوني، تسويق)',
    ],
    bestForCompetitor: [
      'كتابة عامة وإبداع',
      'البرمجة',
      'البحث متعدد المجالات',
      'الاستخدام الشخصي اليومي',
    ],
    featureMatrix: [
      { feature: 'دعم اللغة العربية كأولوية', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'وكلاء متخصصون في ريادة الأعمال', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'الامتثال للقوانين المصرية', kalmeron: 'yes', competitor: 'no' },
      { feature: 'مختبر العملاء التركيبي', kalmeron: 'yes', competitor: 'no' },
      { feature: 'CFO افتراضي', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'بحث ويب لحظي', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'Image generation', kalmeron: 'no', competitor: 'yes' },
      { feature: 'Voice Mode', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'Mobile App', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'Custom GPTs / Experts', kalmeron: 'yes', competitor: 'yes' },
      { feature: 'Memory و Personalization', kalmeron: 'yes', competitor: 'yes' },
      { feature: 'API للمطورين', kalmeron: 'yes', competitor: 'yes' },
    ],
    pricingComparison: [
      { plan: 'مجاني', kalmeron: '200 رسالة/يوم', competitor: 'محدود' },
      { plan: 'فردي', kalmeron: '$19/شهر (Builder)', competitor: '$20/شهر (Plus)' },
      { plan: 'فريق', kalmeron: '$79/شهر (Operator)', competitor: '$25/user/شهر' },
      { plan: 'مؤسسات', kalmeron: 'بدءاً من $2.5K/شهر', competitor: 'اتصل بنا' },
    ],
    verdictAr: 'لرواد الأعمال في مصر والخليج، كلميرون يقدم قيمة أعلى بسبب التخصص والامتثال والوكلاء المتعددة. ChatGPT يبقى ممتاز للاستخدام العام والإبداعي. الكثيرون يستخدمون الاثنين معاً.',
    category: 'general-ai',
  },
  {
    slug: 'claude',
    competitorName: 'Claude',
    competitorTagline: 'مساعد AI من Anthropic بتركيز على السلامة',
    metaDescriptionAr: 'كلميرون vs Claude: أيهما أفضل لتأسيس شركة وإدارتها؟ مقارنة شاملة.',
    metaDescriptionEn: 'Kalmeron vs Claude: which is better for building and running a startup?',
    heroIntroAr: 'Claude ممتاز في التحليل والكتابة المتقدمة. كلميرون فريق متخصص بالسوق العربي مع 50+ وكيل. أيهما يناسب احتياجاتك؟',
    bestForKalmeron: [
      'العمل بالسوق العربي',
      'وكلاء متعددون متخصصون',
      'الفوترة بالجنيه/الريال',
      'دعم محلي 24/7 بالعربية',
    ],
    bestForCompetitor: [
      'كتابة طويلة معقدة',
      'تحليل وثائق ضخمة',
      'البرمجة المتقدمة',
      'القرارات الأخلاقية الحساسة',
    ],
    featureMatrix: [
      { feature: 'دعم العربية الأصيل', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'وكلاء متعددون', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'Context window كبير', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'Projects', kalmeron: 'yes', competitor: 'yes' },
      { feature: 'MCP Support', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'تخصص ريادة أعمال', kalmeron: 'yes', competitor: 'no' },
      { feature: 'Image analysis', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'Computer Use', kalmeron: 'no', competitor: 'yes' },
    ],
    pricingComparison: [
      { plan: 'مجاني', kalmeron: '200 رسالة/يوم', competitor: 'محدود يومياً' },
      { plan: 'احترافي', kalmeron: '$19/شهر', competitor: '$20/شهر (Pro)' },
      { plan: 'فريق', kalmeron: '$79/شهر', competitor: '$30/user/شهر (Team)' },
    ],
    verdictAr: 'Claude يتفوق في التفكير المعقد والـ context الطويل. كلميرون أفضل لرواد الأعمال العرب الذين يحتاجون فريق متخصص جاهز. الكثير من فرق الأعمال يستخدمون كلميرون للعمليات اليومية و Claude للبحث المعمق.',
    category: 'general-ai',
  },
  {
    slug: 'manus-ai',
    competitorName: 'Manus AI',
    competitorTagline: 'وكيل AI ذاتي للمهام المعقدة',
    metaDescriptionAr: 'كلميرون vs Manus AI: مقارنة بين منصتين للوكلاء الذكية. أيهما أفضل لشركتك؟',
    metaDescriptionEn: 'Kalmeron vs Manus AI: comparison between two AI agent platforms. Which fits your startup?',
    heroIntroAr: 'Manus AI ركّز على الوكلاء الذاتية. كلميرون يجمع 50+ وكيل في إطار "نظام تشغيل" متكامل لرواد الأعمال.',
    bestForKalmeron: [
      'تخصص ريادة الأعمال',
      'الواجهة العربية الكاملة',
      'تكامل عميق بين الوكلاء',
      'قسم القانون والامتثال للسوق المصري',
    ],
    bestForCompetitor: [
      'مهام بحث وتحليل عامة',
      'الأتمتة المتقدمة لمهام طويلة',
    ],
    featureMatrix: [
      { feature: 'وكلاء متخصصون بالأعمال', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'دعم اللغة العربية', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'وكلاء ذاتية لساعات', kalmeron: 'yes', competitor: 'yes' },
      { feature: 'Multi-agent collaboration', kalmeron: 'yes', competitor: 'yes' },
      { feature: 'Memory persistence', kalmeron: 'yes', competitor: 'yes' },
      { feature: 'بيانات السوق المصري', kalmeron: 'yes', competitor: 'no' },
    ],
    pricingComparison: [
      { plan: 'مجاني', kalmeron: 'متوفر', competitor: 'تجريبي' },
      { plan: 'احترافي', kalmeron: '$19/شهر', competitor: '$39/شهر' },
      { plan: 'فريق', kalmeron: '$79/شهر', competitor: '$199/شهر' },
    ],
    verdictAr: 'كلميرون أفضل بكثير للأسواق العربية وريادة الأعمال المتخصصة. Manus AI خيار جيد للمستخدمين العالميين الذين يبحثون عن أتمتة عامة.',
    category: 'multi-agent',
  },
  {
    slug: 'lovable',
    competitorName: 'Lovable',
    competitorTagline: 'منصة AI لبناء التطبيقات بدون كود',
    metaDescriptionAr: 'كلميرون vs Lovable: أداتان مختلفتان جذرياً. كلميرون لإدارة شركتك، Lovable لبناء التطبيق.',
    metaDescriptionEn: 'Kalmeron vs Lovable: two fundamentally different tools. Kalmeron runs your business, Lovable builds the app.',
    heroIntroAr: 'الاختيار ليس تنافسياً — بل مكمّلاً. Lovable يبني تطبيقك، كلميرون يبني شركتك حوله.',
    bestForKalmeron: [
      'إدارة شركتك ككل',
      'استراتيجية، تسويق، مالية، قانون',
      'تخطيط طويل المدى',
    ],
    bestForCompetitor: [
      'بناء MVP سريع',
      'Prototyping تطبيقات Web',
    ],
    featureMatrix: [
      { feature: 'بناء كود تطبيق', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'إدارة الأعمال', kalmeron: 'yes', competitor: 'no' },
      { feature: 'محتوى تسويقي', kalmeron: 'yes', competitor: 'no' },
      { feature: 'نماذج مالية', kalmeron: 'yes', competitor: 'no' },
      { feature: 'استشارة قانونية', kalmeron: 'yes', competitor: 'no' },
    ],
    pricingComparison: [
      { plan: 'مجاني', kalmeron: '200 رسالة/يوم', competitor: 'محدود' },
      { plan: 'احترافي', kalmeron: '$19/شهر', competitor: '$20/شهر' },
    ],
    verdictAr: 'استخدمهما معاً. Lovable لبناء MVP في أيام، كلميرون لإدارة كل شيء حول المنتج (التسويق، المالية، القانون، فريق العمل).',
    category: 'no-code',
  },
  {
    slug: 'microsoft-copilot',
    competitorName: 'Microsoft Copilot',
    competitorTagline: 'مساعد AI من Microsoft للمؤسسات',
    metaDescriptionAr: 'كلميرون vs Microsoft Copilot: أيهما أنسب لشركتك في المنطقة العربية؟',
    metaDescriptionEn: 'Kalmeron vs Microsoft Copilot: which suits your business better in MENA?',
    heroIntroAr: 'Microsoft Copilot رائع للمؤسسات الكبرى المرتبطة بـ Office. كلميرون مصمم للشركات الناشئة العربية بـ 1/10 السعر.',
    bestForKalmeron: [
      'الستارت أبس والشركات الصغيرة',
      'العمل خارج بيئة Microsoft',
      'التخصص في ريادة الأعمال العربية',
      'تكلفة معقولة',
    ],
    bestForCompetitor: [
      'المؤسسات الكبرى',
      'فرق على Microsoft 365 بالكامل',
      'التكامل العميق مع Outlook/Teams/SharePoint',
    ],
    featureMatrix: [
      { feature: 'تكامل Office', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'تخصص ريادة الأعمال', kalmeron: 'yes', competitor: 'no' },
      { feature: 'دعم العربية الكامل', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'قوانين السوق المحلي', kalmeron: 'yes', competitor: 'no' },
      { feature: 'وكلاء متعددون', kalmeron: 'yes', competitor: 'yes' },
      { feature: 'مناسب للستارت أبس', kalmeron: 'yes', competitor: 'no' },
    ],
    pricingComparison: [
      { plan: 'مجاني', kalmeron: '200 رسالة/يوم', competitor: 'لا يوجد' },
      { plan: 'احترافي', kalmeron: '$19/شهر', competitor: '$30/user' },
      { plan: 'فريق', kalmeron: '$79/شهر', competitor: '$200/user (Studio)' },
    ],
    verdictAr: 'إذا كنت ستارت أب أو SME عربية، كلميرون أفضل بـ 90%. إذا كنت مؤسسة كبرى على Microsoft 365، Copilot منطقي.',
    category: 'business-ai',
  },
];

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}
