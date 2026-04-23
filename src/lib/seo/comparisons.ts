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
    slug: 'gemini',
    competitorName: 'Gemini',
    competitorTagline: 'مساعد AI من Google',
    metaDescriptionAr: 'كلميرون vs Gemini: مقارنة تفصيلية لمستخدمي MENA. أيهما أفضل لشركتك العربية؟',
    metaDescriptionEn: 'Kalmeron vs Gemini: detailed comparison for MENA users. Which is best for your Arab business?',
    heroIntroAr: 'Gemini مساعد قوي من Google متكامل مع Workspace. كلميرون فريق متخصص بالأعمال العربية. أيهما أنسب لاحتياجك؟',
    bestForKalmeron: [
      'متخصص ريادة أعمال MENA',
      'وكلاء متخصصون لكل مجال',
      'دعم عربي عميق ومحلي',
      'خبرة بقوانين السوق المصري والخليجي',
    ],
    bestForCompetitor: [
      'مستخدمو Google Workspace',
      'بحث متعدد الوسائط (نص، صور، فيديو)',
      'تكامل مع Gmail/Drive/Docs',
      'البرمجة المتقدمة',
    ],
    featureMatrix: [
      { feature: 'دعم العربية كأولوية', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'وكلاء متخصصون', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'تكامل Workspace', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'تحليل صور وفيديو', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'بيانات السوق المحلي', kalmeron: 'yes', competitor: 'no' },
      { feature: 'Long context (1M+ tokens)', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'تخصص ريادة الأعمال', kalmeron: 'yes', competitor: 'no' },
    ],
    pricingComparison: [
      { plan: 'مجاني', kalmeron: '200 رسالة/يوم', competitor: 'محدود' },
      { plan: 'احترافي', kalmeron: '$19/شهر', competitor: '$20/شهر (Advanced)' },
      { plan: 'فريق', kalmeron: '$79/شهر', competitor: '$30/user (Workspace)' },
    ],
    verdictAr:
      'Gemini ممتاز لمستخدمي Google Workspace ومحتوى متعدد الوسائط. كلميرون أفضل لرواد الأعمال العرب الذين يحتاجون فريق متخصص. كثيرون يستخدمون الاثنين.',
    category: 'general-ai',
  },
  {
    slug: 'perplexity',
    competitorName: 'Perplexity',
    competitorTagline: 'محرك بحث مدعوم بـ AI',
    metaDescriptionAr: 'كلميرون vs Perplexity: أداتان مكمّلتان. Perplexity للبحث، كلميرون للتنفيذ.',
    metaDescriptionEn: 'Kalmeron vs Perplexity: complementary tools. Perplexity for search, Kalmeron for execution.',
    heroIntroAr: 'Perplexity محرك بحث ذكي مع مصادر. كلميرون يأخذ المعلومات ويحوّلها إلى خطط، عقود، نماذج مالية. مكمّلان وليسا منافسَين.',
    bestForKalmeron: [
      'تنفيذ القرارات لا فقط البحث عنها',
      'إنتاج خطط ووثائق احترافية',
      'وكلاء متخصصون لكل مهمة',
      'حفظ سياق المشروع طويل المدى',
    ],
    bestForCompetitor: [
      'بحث ويب لحظي مع مصادر',
      'تتبع آخر المستجدات',
      'البحث الأكاديمي',
      'استعلامات سريعة بمصادر موثوقة',
    ],
    featureMatrix: [
      { feature: 'بحث ويب لحظي', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'إنتاج وثائق وخطط', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'دعم العربية', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'وكلاء متخصصون', kalmeron: 'yes', competitor: 'no' },
      { feature: 'حفظ المشاريع', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'مصادر مع كل إجابة', kalmeron: 'partial', competitor: 'yes' },
    ],
    pricingComparison: [
      { plan: 'مجاني', kalmeron: '200 رسالة/يوم', competitor: '5 Pro searches' },
      { plan: 'احترافي', kalmeron: '$19/شهر', competitor: '$20/شهر (Pro)' },
      { plan: 'فريق', kalmeron: '$79/شهر', competitor: '$40/user (Enterprise)' },
    ],
    verdictAr:
      'استخدمهما معاً. Perplexity للبحث والمصادر، كلميرون للتنفيذ والإنتاج. كل منهما يحل مشكلة مختلفة.',
    category: 'general-ai',
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
  {
    slug: 'manus',
    competitorName: 'Manus AI',
    competitorTagline: 'وكيل عام للمهام المعقدة',
    metaDescriptionAr: 'كلميرون vs Manus AI: مقارنة بين منصتين multi-agent. أيهما أفضل لرواد الأعمال؟',
    metaDescriptionEn: 'Kalmeron vs Manus AI: comparing two multi-agent platforms. Which is better for entrepreneurs?',
    heroIntroAr: 'Manus وكيل عام عالمي. كلميرون متخصص في ريادة الأعمال العربية. أيهما يصلحك؟',
    bestForKalmeron: ['تأسيس شركة في MENA', 'الامتثال المحلي', 'العربية كأولوية', 'CFO/Legal/HR وكلاء جاهزين'],
    bestForCompetitor: ['مهام عامة معقدة', 'Research عميق', 'Cross-domain workflows'],
    featureMatrix: [
      { feature: 'Multi-agent', kalmeron: 'yes', competitor: 'yes' },
      { feature: 'Domain agents جاهزين', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'العربية الكاملة', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'Compliance MENA', kalmeron: 'yes', competitor: 'no' },
      { feature: 'Headless / API', kalmeron: 'yes', competitor: 'partial' },
      { feature: 'تخصص ريادة أعمال', kalmeron: 'yes', competitor: 'no' },
    ],
    pricingComparison: [
      { plan: 'مجاني', kalmeron: '200 رسالة/يوم', competitor: 'محدود' },
      { plan: 'Pro', kalmeron: '$19/شهر', competitor: '$39/شهر' },
    ],
    verdictAr: 'لرواد الأعمال العرب، كلميرون اختيار واضح بسبب التخصص والسعر. Manus لـ general research مفيد.',
    category: 'multi-agent',
  },
  {
    slug: 'lovable',
    competitorName: 'Lovable',
    competitorTagline: 'بناء تطبيقات بدون كود بـ AI',
    metaDescriptionAr: 'كلميرون vs Lovable: واحد لبناء التطبيق، الآخر لتشغيل الشركة. ليسا منافسين حقيقيين.',
    metaDescriptionEn: 'Kalmeron vs Lovable: one builds apps, other runs companies. Not real competitors.',
    heroIntroAr: 'Lovable يبنيلك app. كلميرون يبنيلك شركة. كثيرون يستخدمون الاثنين معاً.',
    bestForKalmeron: ['تشغيل العمليات', 'استراتيجية', 'مالية وقانون وتسويق'],
    bestForCompetitor: ['بناء MVP بسرعة', 'Prototype للأفكار', 'Frontend dev بدون مطور'],
    featureMatrix: [
      { feature: 'بناء أكواد', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'تشغيل شركة', kalmeron: 'yes', competitor: 'no' },
      { feature: 'CFO/Legal agents', kalmeron: 'yes', competitor: 'no' },
      { feature: 'العربية', kalmeron: 'yes', competitor: 'partial' },
    ],
    pricingComparison: [
      { plan: 'Free', kalmeron: '200 رسالة', competitor: '50 messages/day' },
      { plan: 'Pro', kalmeron: '$19', competitor: '$25' },
    ],
    verdictAr: 'استخدمهما معاً. Lovable لبناء MVP سريع، كلميرون لتشغيل الشركة بعدها.',
    category: 'no-code',
  },
  {
    slug: 'replit-agent',
    competitorName: 'Replit Agent',
    competitorTagline: 'وكيل بناء تطبيقات داخل Replit',
    metaDescriptionAr: 'كلميرون vs Replit Agent: مقارنة بين وكيل dev ومنصة business operations.',
    metaDescriptionEn: 'Kalmeron vs Replit Agent: dev agent vs business operations platform.',
    heroIntroAr: 'Replit Agent للمطورين. كلميرون للمؤسسين والـ business teams.',
    bestForKalmeron: ['Non-technical founders', 'Business operations', 'Strategy وعمليات'],
    bestForCompetitor: ['Developers', 'Building software', 'Coding agents'],
    featureMatrix: [
      { feature: 'بناء code', kalmeron: 'no', competitor: 'yes' },
      { feature: 'CFO/Legal/Marketing', kalmeron: 'yes', competitor: 'no' },
      { feature: 'العربية', kalmeron: 'yes', competitor: 'partial' },
    ],
    pricingComparison: [
      { plan: 'Pro', kalmeron: '$19', competitor: '$25' },
    ],
    verdictAr: 'منتجان مختلفان. Replit للمطورين، كلميرون للمؤسسين.',
    category: 'no-code',
  },
  {
    slug: 'crew-ai',
    competitorName: 'Crew AI',
    competitorTagline: 'إطار عمل مفتوح المصدر للوكلاء',
    metaDescriptionAr: 'كلميرون vs Crew AI: SaaS جاهز vs framework يحتاج تطوير. أيهما يناسبك؟',
    metaDescriptionEn: 'Kalmeron vs Crew AI: ready SaaS vs framework needing development.',
    heroIntroAr: 'Crew AI framework للمطورين. كلميرون منتج جاهز للاستخدام. اختيار حسب احتياجك.',
    bestForKalmeron: ['غير مطورين', 'Speed-to-value', 'Enterprise compliance', 'Support'],
    bestForCompetitor: ['Developers', 'Custom solutions', 'Cost flexibility'],
    featureMatrix: [
      { feature: 'Ready out-of-box', kalmeron: 'yes', competitor: 'no' },
      { feature: 'Open source', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'Compliance built-in', kalmeron: 'yes', competitor: 'no' },
      { feature: 'العربية', kalmeron: 'yes', competitor: 'no' },
    ],
    pricingComparison: [
      { plan: 'Use', kalmeron: '$19/شهر', competitor: 'free + infra' },
    ],
    verdictAr: 'إذا كنت dev team، Crew AI أرخص. غير ذلك، كلميرون يوفر شهور من العمل.',
    category: 'multi-agent',
  },
  {
    slug: 'glean',
    competitorName: 'Glean',
    competitorTagline: 'AI search للمؤسسات الكبرى',
    metaDescriptionAr: 'كلميرون vs Glean: search داخلي vs منصة شاملة لرواد الأعمال.',
    metaDescriptionEn: 'Kalmeron vs Glean: enterprise search vs entrepreneur platform.',
    heroIntroAr: 'Glean للمؤسسات بآلاف الموظفين. كلميرون للستارت أبس وSMEs.',
    bestForKalmeron: ['Startups', 'SMEs', 'Founders', '< 100 employees'],
    bestForCompetitor: ['1000+ employees', 'Heavy doc volumes', 'Enterprise IT'],
    featureMatrix: [
      { feature: 'Enterprise search', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'SMB friendly', kalmeron: 'yes', competitor: 'no' },
      { feature: 'العربية', kalmeron: 'yes', competitor: 'partial' },
    ],
    pricingComparison: [
      { plan: 'Per user', kalmeron: '$19/m', competitor: '$50+/m' },
    ],
    verdictAr: 'حسب حجم شركتك. < 100 employees → كلميرون. > 1000 → Glean.',
    category: 'business-ai',
  },
  {
    slug: 'harvey',
    competitorName: 'Harvey',
    competitorTagline: 'AI متخصص للمحامين',
    metaDescriptionAr: 'كلميرون vs Harvey: AI قانوني للمحامين الكبار vs Compliance Co-Pilot لرواد الأعمال.',
    metaDescriptionEn: 'Kalmeron vs Harvey: legal AI for top lawyers vs compliance for entrepreneurs.',
    heroIntroAr: 'Harvey للمحامين بـ $5K/شهر. كلميرون لرواد الأعمال بـ $19 ويعطيك compliance أساسي.',
    bestForKalmeron: ['رواد الأعمال', 'Compliance أساسي', 'تكلفة معقولة'],
    bestForCompetitor: ['شركات محاماة', 'M&A معقدة', 'Litigation'],
    featureMatrix: [
      { feature: 'قانون متخصص', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'Compliance MENA', kalmeron: 'yes', competitor: 'no' },
      { feature: 'سعر مناسب SME', kalmeron: 'yes', competitor: 'no' },
    ],
    pricingComparison: [
      { plan: 'Pro', kalmeron: '$19', competitor: '$5000+' },
    ],
    verdictAr: 'Harvey للمحامين الكبار. كلميرون لرواد الأعمال الذين يحتاجون legal sanity check.',
    category: 'business-ai',
  },
  {
    slug: 'notion-ai',
    competitorName: 'Notion AI',
    competitorTagline: 'AI داخل Notion للكتابة والتلخيص',
    metaDescriptionAr: 'كلميرون vs Notion AI: AI للكتابة vs منصة لتشغيل الشركة كاملة.',
    metaDescriptionEn: 'Kalmeron vs Notion AI: writing AI vs full company operations platform.',
    heroIntroAr: 'Notion AI add-on للكتابة. كلميرون منصة كاملة لتشغيل شركتك.',
    bestForKalmeron: ['تشغيل الشركة', 'Multi-agent workflows', 'Compliance والـ legal'],
    bestForCompetitor: ['Note-taking', 'Knowledge base', 'Writing assistance'],
    featureMatrix: [
      { feature: 'Note-taking', kalmeron: 'partial', competitor: 'yes' },
      { feature: 'Multi-agent ops', kalmeron: 'yes', competitor: 'no' },
      { feature: 'العربية', kalmeron: 'yes', competitor: 'partial' },
    ],
    pricingComparison: [
      { plan: 'Pro', kalmeron: '$19', competitor: '$10 add-on' },
    ],
    verdictAr: 'استخدمهما معاً. Notion للوثائق، كلميرون للعمليات والقرارات.',
    category: 'business-ai',
  },
  {
    slug: 'devin',
    competitorName: 'Devin',
    competitorTagline: 'مهندس برمجيات AI',
    metaDescriptionAr: 'كلميرون vs Devin: AI مطور vs AI مؤسس. أيهما تحتاج؟',
    metaDescriptionEn: 'Kalmeron vs Devin: AI developer vs AI founder. Which do you need?',
    heroIntroAr: 'Devin يكتب كود. كلميرون يدير شركة. منتجات لا تتنافس.',
    bestForKalmeron: ['Founders', 'Business operations', 'Non-technical'],
    bestForCompetitor: ['Software development', 'Code automation'],
    featureMatrix: [
      { feature: 'Coding', kalmeron: 'no', competitor: 'yes' },
      { feature: 'Business ops', kalmeron: 'yes', competitor: 'no' },
    ],
    pricingComparison: [{ plan: 'Pro', kalmeron: '$19', competitor: '$500/m' }],
    verdictAr: 'منتجان لـ jobs مختلفة. كلميرون للمؤسسين، Devin للمطورين.',
    category: 'no-code',
  },
];

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}
