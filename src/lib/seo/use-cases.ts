/**
 * Programmatic SEO — Use Cases data layer.
 * Each use case becomes a dedicated landing page targeting Arabic search intent.
 * Pages: /use-cases/[slug]
 */

export interface UseCase {
  slug: string;
  titleAr: string;
  titleEn: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  heroIntroAr: string;
  primaryAgents: string[];
  steps: { title: string; description: string }[];
  outcomes: string[];
  relatedKeywords: string[];
  industry?: string;
  estimatedTimeMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const USE_CASES: UseCase[] = [
  {
    slug: 'launch-cloud-restaurant',
    titleAr: 'تأسيس مطعم سحابي في مصر',
    titleEn: 'Launch a Cloud Restaurant in Egypt',
    metaDescriptionAr: 'دليل شامل لتأسيس مطعم سحابي في مصر باستخدام كلميرون: من تقييم الفكرة، التراخيص، التكاليف، إلى أول طلبية.',
    metaDescriptionEn: 'Complete guide to launching a cloud restaurant in Egypt with Kalmeron: from idea validation to first order.',
    heroIntroAr: 'المطاعم السحابية تنمو 32% سنوياً في مصر. كلميرون يجمع 7 وكلاء متخصصين لمساعدتك في كل مرحلة، من اختيار المطبخ المناسب إلى احتساب نقطة التعادل.',
    primaryAgents: ['idea_validator', 'cfo_agent', 'legal_guide', 'marketing_orchestrator', 'opportunity_radar'],
    steps: [
      { title: 'تحقق من الفكرة', description: 'حلّل سوق منطقتك، حدد الفجوة، وقيّم الطلب على نوع الطعام.' },
      { title: 'النموذج المالي', description: 'احسب تكلفة المطبخ، الموظفين، التغليف، التوصيل، وحدد نقطة التعادل.' },
      { title: 'التراخيص القانونية', description: 'سجل تجاري، رخصة تشغيل، ترخيص صحي، وعقود مع منصات التوصيل.' },
      { title: 'استراتيجية الإطلاق', description: 'حملة رقمية مستهدفة، شراكات مع طلبات/Glovo، وعروض إطلاق.' },
      { title: 'التشغيل والتطوير', description: 'مراقبة لحظية للأداء، تحسين القائمة، وتوسع المناطق المخدومة.' },
    ],
    outcomes: [
      'خطة عمل تفصيلية جاهزة للمستثمرين',
      'نموذج مالي 36 شهراً (Excel)',
      'قائمة كاملة بالتراخيص والوثائق المطلوبة',
      'استراتيجية تسويق رقمي مع ميزانية',
      'لوحة قياس KPIs أسبوعية',
    ],
    relatedKeywords: ['مطعم سحابي', 'cloud kitchen مصر', 'تأسيس مطعم', 'دراسة جدوى مطعم'],
    industry: 'food-beverage',
    estimatedTimeMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    slug: 'build-ecommerce-store',
    titleAr: 'بناء متجر إلكتروني ناجح من الصفر',
    titleEn: 'Build a Successful E-commerce Store from Zero',
    metaDescriptionAr: 'خطوات تأسيس متجر إلكتروني في السوق المصري، مع اختيار المنتج، المنصة، الشحن، والدفع.',
    metaDescriptionEn: 'Step-by-step guide to launching an e-commerce store in Egypt, from product to payment.',
    heroIntroAr: 'سوق التجارة الإلكترونية في مصر تجاوز $9 مليار في 2025. كلميرون يساعدك في اختيار المنتج، بناء المتجر، وجلب أول 1000 عميل.',
    primaryAgents: ['idea_validator', 'marketing_orchestrator', 'cfo_agent', 'opportunity_radar'],
    steps: [
      { title: 'اختيار المنتج', description: 'تحليل اتجاهات السوق، اختبار 5 منتجات على شخصيات افتراضية.' },
      { title: 'بناء المتجر', description: 'اختيار المنصة (Shopify/WooCommerce)، تصميم، صور احترافية.' },
      { title: 'حلول الدفع والشحن', description: 'Fawry, InstaPay, Paymob + شراكات Bosta/Aramex.' },
      { title: 'استراتيجية التسويق', description: 'Meta Ads، TikTok، Influencers، حملات Search.' },
      { title: 'تحسين التحويل', description: 'A/B testing، تحسين سلة الدفع، استرداد العربات المتروكة.' },
    ],
    outcomes: ['متجر جاهز للإطلاق', 'استراتيجية تسويق 90 يوم', 'ميزانية إعلانية محسّنة', 'قائمة موردين موثوقين'],
    relatedKeywords: ['متجر إلكتروني مصر', 'تجارة إلكترونية', 'shopify عربي', 'بيع أونلاين'],
    industry: 'ecommerce',
    estimatedTimeMinutes: 120,
    difficulty: 'beginner',
  },
  {
    slug: 'raise-seed-funding',
    titleAr: 'الحصول على تمويل Seed لشركتك الناشئة',
    titleEn: 'Raise Seed Funding for Your Startup',
    metaDescriptionAr: 'كيف تجهز شركتك للحصول على تمويل seed: العرض، النموذج المالي، Term Sheet، والتفاوض مع المستثمرين.',
    metaDescriptionEn: 'How to prepare your startup for seed funding: pitch, financial model, term sheet, investor negotiation.',
    heroIntroAr: 'متوسط جولة seed في مصر $300K-$1M. كلميرون يبني عرضك، نموذجك المالي، ويربطك بـ VCs المناسبين.',
    primaryAgents: ['cfo_agent', 'legal_guide', 'opportunity_radar', 'plan_builder'],
    steps: [
      { title: 'تجهيز Pitch Deck', description: '12 شريحة بمعايير Sequoia، مع تخصيص للسوق المصري.' },
      { title: 'النموذج المالي', description: 'توقعات 36 شهراً، Cohort Analysis، Unit Economics.' },
      { title: 'Investor List', description: 'قائمة مخصصة بـ 50 VC نشطين في قطاعك.' },
      { title: 'Outreach Strategy', description: 'رسائل مخصصة، تتبع، ومتابعة.' },
      { title: 'Term Sheet & Closing', description: 'مراجعة قانونية، تفاوض، إغلاق الصفقة.' },
    ],
    outcomes: ['Pitch deck بمعايير عالمية', 'نموذج مالي قابل للدفاع', '50 لقاء مستثمر', 'مساعدة قانونية في Term Sheet'],
    relatedKeywords: ['seed funding مصر', 'تمويل ناشئ', 'pitch deck', 'مستثمرين'],
    industry: 'fintech',
    estimatedTimeMinutes: 180,
    difficulty: 'advanced',
  },
  {
    slug: 'validate-saas-idea',
    titleAr: 'تحقق من فكرة SaaS قبل البناء',
    titleEn: 'Validate Your SaaS Idea Before Building',
    metaDescriptionAr: 'لا تبني منتج لا أحد يريده. كلميرون يختبر فكرتك على 200 شخصية تركيبية ويعطيك تقرير قابلية تسويق.',
    metaDescriptionEn: "Don't build what nobody wants. Kalmeron tests your idea against 200 synthetic personas.",
    heroIntroAr: 'دراسة CB Insights: 42% من الستارت أبس تفشل بسبب "no market need". كلميرون يحميك من هذا الخطر.',
    primaryAgents: ['idea_validator', 'mistake_shield', 'success_museum', 'opportunity_radar'],
    steps: [
      { title: 'وصف الفكرة', description: 'بالعامية أو الفصحى. كلميرون يستخرج المتغيرات المهمة.' },
      { title: 'تحليل السوق', description: 'حجم، نمو، منافسين، فجوات.' },
      { title: 'اختبار الشخصيات', description: 'اختبار pitch على 200 شخصية مصرية تركيبية.' },
      { title: 'تقرير المخاطر', description: 'Top 10 risks مع mitigation لكل منها.' },
      { title: 'الخطوة التالية', description: 'go / pivot / no-go مع مبررات قابلة للدفاع.' },
    ],
    outcomes: ['تقرير تحقق 30 صفحة', 'قياس Product-Market Fit Probability', 'قائمة بـ 5 pivots محتملة'],
    relatedKeywords: ['تحقق من فكرة', 'product market fit', 'SaaS validation', 'دراسة جدوى'],
    industry: 'saas',
    estimatedTimeMinutes: 60,
    difficulty: 'beginner',
  },
  {
    slug: 'launch-fintech-app',
    titleAr: 'إطلاق تطبيق فنتك في السوق المصري',
    titleEn: 'Launch a Fintech App in Egypt',
    metaDescriptionAr: 'دليل تأسيس تطبيق فنتك في مصر: تراخيص البنك المركزي، الامتثال، التكامل مع Fawry/InstaPay، والنمو.',
    metaDescriptionEn: 'Guide to launching a fintech in Egypt: CBE licensing, compliance, payment integration, and growth.',
    heroIntroAr: 'القطاع المالي في مصر يجذب 40% من تمويل الستارت أبس. كلميرون يرشدك في الـ regulation المعقد.',
    primaryAgents: ['legal_guide', 'cfo_agent', 'compliance', 'idea_validator'],
    steps: [
      { title: 'فهم Regulation', description: 'BNPL, e-wallet, payment aggregator — أي ترخيص تحتاج؟' },
      { title: 'تجهيز الوثائق للبنك المركزي', description: 'KYC, AML, Risk Management policies.' },
      { title: 'بنية التطبيق التقنية', description: 'PCI-DSS, encryption, fraud detection.' },
      { title: 'التكامل مع البنية التحتية', description: 'Fawry, InstaPay, Meeza, Banking APIs.' },
      { title: 'استراتيجية النمو', description: 'Acquisition channels, retention, viral loops.' },
    ],
    outcomes: ['Compliance roadmap كامل', 'وثائق جاهزة للبنك المركزي', 'بنية تقنية موصى بها'],
    relatedKeywords: ['fintech مصر', 'البنك المركزي', 'محفظة إلكترونية', 'تطبيق دفع'],
    industry: 'fintech',
    estimatedTimeMinutes: 240,
    difficulty: 'advanced',
  },
  {
    slug: 'build-mvp-30-days',
    titleAr: 'بناء MVP في 30 يوم بميزانية محدودة',
    titleEn: 'Build an MVP in 30 Days on a Tight Budget',
    metaDescriptionAr: 'منهجية مدروسة لبناء أول نسخة من منتجك في 30 يوم بأقل من $5000.',
    metaDescriptionEn: 'Methodology to build your first product version in 30 days under $5K.',
    heroIntroAr: 'لا تحتاج $50K لتبدأ. كلميرون يخطط لك Sprint مدته 30 يوم لإطلاق MVP حقيقي.',
    primaryAgents: ['plan_builder', 'idea_validator', 'mistake_shield'],
    steps: [
      { title: 'Scope Definition', description: 'فقط 3 features. لا غير.' },
      { title: 'Tech Stack الذكي', description: 'No-code / low-code أولاً، code فقط لو ضروري.' },
      { title: 'Week-by-Week Plan', description: 'كل أسبوع له milestone قابل للقياس.' },
      { title: 'Testing مع المستخدمين', description: 'الأسبوع 3-4 = جلسات user testing.' },
      { title: 'Iteration وLaunch', description: 'إصلاح أهم 5 issues + soft launch.' },
    ],
    outcomes: ['MVP يعمل في 30 يوم', 'أول 50 user تجريبي', 'Roadmap للـ V2'],
    relatedKeywords: ['MVP', 'بناء منتج', 'no-code', 'إطلاق ستارت أب'],
    industry: 'saas',
    estimatedTimeMinutes: 60,
    difficulty: 'intermediate',
  },
  {
    slug: 'pricing-strategy',
    titleAr: 'استراتيجية التسعير الذكي لمنتجك',
    titleEn: 'Smart Pricing Strategy for Your Product',
    metaDescriptionAr: 'لا تخمّن سعرك. كلميرون يبني نموذج Value-Based Pricing مدعوم بأبحاث المنافسين.',
    metaDescriptionEn: 'Stop guessing prices. Kalmeron builds a value-based pricing model backed by competitor research.',
    heroIntroAr: 'دراسة McKinsey: تحسين التسعير 1% يرفع الأرباح 8%. كلميرون يجد لك السعر المثالي.',
    primaryAgents: ['cfo_agent', 'idea_validator', 'success_museum'],
    steps: [
      { title: 'تحليل المنافسين', description: 'كل منافس، كل خطة، كل ميزة، بالتفصيل.' },
      { title: 'Willingness-to-Pay Survey', description: 'اختبار 5 نقاط سعرية على personas.' },
      { title: 'نموذج Tiered Pricing', description: 'Anchor + Target + Decoy strategy.' },
      { title: 'Annual vs Monthly', description: 'كم خصم؟ كم cash flow ستحصل؟' },
      { title: 'A/B Test على الموقع', description: 'مع تتبع conversion ومعدل الـ churn.' },
    ],
    outcomes: ['نموذج تسعير مدروس', '3-4 خطط محسّنة', 'حسابات LTV:CAC'],
    relatedKeywords: ['تسعير', 'pricing strategy', 'SaaS pricing', 'subscription'],
    estimatedTimeMinutes: 75,
    difficulty: 'intermediate',
  },
  {
    slug: 'hire-first-team',
    titleAr: 'بناء أول فريق لشركتك الناشئة',
    titleEn: "Build Your Startup's First Team",
    metaDescriptionAr: 'متى توظف؟ من توظف أولاً؟ كم تدفع؟ كلميرون يبني خطة hire-by-hire لأول 10 موظفين.',
    metaDescriptionEn: 'When to hire? Who first? How much? Kalmeron builds a hire-by-hire plan for your first 10 employees.',
    heroIntroAr: 'أكبر خطأ في الستارت أبس: التوظيف المتأخر أو المبكر. كلميرون يحدد التوقيت المثالي.',
    primaryAgents: ['hr_orchestrator', 'cfo_agent', 'legal_guide'],
    steps: [
      { title: 'تحديد الأدوار الأهم', description: 'بناءً على stage و stack.' },
      { title: 'Job Descriptions', description: 'JD احترافي يجذب أفضل المواهب.' },
      { title: 'Compensation Benchmarking', description: 'كم يدفع المنافسون في مصر؟' },
      { title: 'عقود وامتثال', description: 'عقد عمل، sec ration, equity vesting.' },
      { title: 'Onboarding Plan', description: 'أول 30/60/90 يوم لكل موظف.' },
    ],
    outcomes: ['Hiring plan لـ 12 شهر', '10 JDs جاهزة', 'عقود قانونية مصرية'],
    relatedKeywords: ['توظيف', 'hiring startup', 'موارد بشرية', 'عقد عمل'],
    estimatedTimeMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    slug: 'expand-to-saudi-uae',
    titleAr: 'التوسع للسوق السعودي والإماراتي',
    titleEn: 'Expand to Saudi Arabia and UAE Markets',
    metaDescriptionAr: 'دليل التوسع من مصر إلى الخليج: التراخيص، الشركاء، التسويق المحلي، والتسعير المختلف.',
    metaDescriptionEn: 'Guide to expanding from Egypt to the Gulf: licensing, partners, localization, and pricing.',
    heroIntroAr: 'السوق الخليجي 4× القوة الشرائية للمصري. كلميرون يخطط لك التوسع بدون أخطاء مكلفة.',
    primaryAgents: ['legal_guide', 'cfo_agent', 'marketing_orchestrator', 'opportunity_radar'],
    steps: [
      { title: 'اختر السوق المناسب', description: 'KSA vs UAE vs both — تحليل تفصيلي.' },
      { title: 'هيكل قانوني', description: 'فرع، LLC، توكيل، أم شراكة محلية.' },
      { title: 'تسعير ودفع محلي', description: 'SAR/AED، ضريبة VAT، وسائل دفع محلية.' },
      { title: 'تسويق محلي', description: 'لهجة، قيم ثقافية، قنوات الـ MENA.' },
      { title: 'Talent + Operations', description: 'فريق محلي vs ريموت من القاهرة.' },
    ],
    outcomes: ['خطة توسع مفصلة', 'تكلفة تأسيس متوقعة', 'قائمة شركاء محتملين'],
    relatedKeywords: ['التوسع للسعودية', 'دبي', 'سوق الخليج', 'GCC expansion'],
    estimatedTimeMinutes: 150,
    difficulty: 'advanced',
  },
  {
    slug: 'build-content-marketing',
    titleAr: 'بناء محرك تسويق محتوى للستارت أب',
    titleEn: 'Build a Content Marketing Engine for Your Startup',
    metaDescriptionAr: 'استراتيجية محتوى تجلب 10K زائر شهرياً في 6 أشهر، بدون ميزانية إعلانية كبيرة.',
    metaDescriptionEn: 'Content strategy bringing 10K monthly visitors in 6 months without big ad budget.',
    heroIntroAr: 'SEO يبني أصلاً. كل مقالة هي employee يعمل 24/7 بدون أجر. كلميرون يبني لك المحرك.',
    primaryAgents: ['marketing_orchestrator', 'seo_manager', 'content_creator'],
    steps: [
      { title: 'بحث الكلمات المفتاحية', description: '50 keyword عربي قابل للترتيب.' },
      { title: 'Content Calendar 90 يوم', description: '3 مقالات/أسبوع موزعة استراتيجياً.' },
      { title: 'بناء أول 30 مقالة', description: 'بمساعدة كلميرون، جودة عالية.' },
      { title: 'Distribution Strategy', description: 'Email, social, partnerships.' },
      { title: 'Measurement', description: 'GA4, Search Console, conversion tracking.' },
    ],
    outcomes: ['30 مقالة عالية الجودة', '50 keyword مرتب', '10K زائر شهري متوقع'],
    relatedKeywords: ['تسويق محتوى', 'SEO عربي', 'blog strategy', 'inbound marketing'],
    estimatedTimeMinutes: 120,
    difficulty: 'intermediate',
  },
];

export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return USE_CASES.find((uc) => uc.slug === slug);
}

export function getAllUseCaseSlugs(): string[] {
  return USE_CASES.map((uc) => uc.slug);
}

export function getUseCasesByIndustry(industry: string): UseCase[] {
  return USE_CASES.filter((uc) => uc.industry === industry);
}
