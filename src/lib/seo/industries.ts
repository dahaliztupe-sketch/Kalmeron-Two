/**
 * Programmatic SEO — Industries.
 * Pages: /industries/[slug]
 */

export interface Industry {
  slug: string;
  nameAr: string;
  nameEn: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  heroIntroAr: string;
  marketSizeAr: string;
  growthRateAr: string;
  topAgents: string[];
  challenges: string[];
  opportunities: string[];
  caseStudies: { title: string; outcome: string }[];
  relatedUseCaseSlugs: string[];
  keywords: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'fintech',
    nameAr: 'الفنتك',
    nameEn: 'Fintech',
    metaDescriptionAr: 'كلميرون للفنتك: حلول AI متخصصة لشركات التكنولوجيا المالية في مصر والمنطقة العربية.',
    metaDescriptionEn: 'Kalmeron for Fintech: specialized AI solutions for financial technology companies in MENA.',
    heroIntroAr: 'الفنتك في المنطقة العربية يجذب 40% من تمويل الستارت أبس. كلميرون يفهم التراخيص، الامتثال، والتكامل مع البنية المالية المحلية.',
    marketSizeAr: '$3.5 مليار في مصر بحلول 2026',
    growthRateAr: '32% سنوياً',
    topAgents: ['legal_guide', 'compliance', 'cfo_agent', 'opportunity_radar'],
    challenges: ['التراخيص الصارمة من البنك المركزي', 'الامتثال (KYC/AML)', 'بناء الثقة', 'المنافسة من البنوك التقليدية'],
    opportunities: ['Underbanked population كبيرة', 'دعم حكومي', 'BNPL في نمو سريع', 'قطاع التحويلات الضخم'],
    caseStudies: [
      { title: 'منصة BNPL في مصر', outcome: 'وصلت 50K مستخدم في 6 شهور بدعم استراتيجية كلميرون' },
      { title: 'محفظة إلكترونية للقطاع غير المصرفي', outcome: 'حصلت على ترخيص في 4 شهور' },
    ],
    relatedUseCaseSlugs: ['launch-fintech-app', 'raise-seed-funding'],
    keywords: ['fintech', 'فنتك', 'تكنولوجيا مالية', 'محفظة إلكترونية', 'BNPL'],
  },
  {
    slug: 'ecommerce',
    nameAr: 'التجارة الإلكترونية',
    nameEn: 'E-commerce',
    metaDescriptionAr: 'كلميرون للتجارة الإلكترونية: من اختيار المنتج إلى التحجيم. كل ما تحتاجه لبناء متجر ناجح.',
    metaDescriptionEn: 'Kalmeron for E-commerce: from product selection to scaling. Build a successful online store.',
    heroIntroAr: 'سوق التجارة الإلكترونية في مصر $9 مليار وينمو 25% سنوياً. كلميرون يساعدك في كل خطوة من الفكرة للتحجيم.',
    marketSizeAr: '$9 مليار في مصر، $50 مليار في MENA',
    growthRateAr: '25% سنوياً',
    topAgents: ['marketing_orchestrator', 'cfo_agent', 'idea_validator', 'opportunity_radar'],
    challenges: ['ارتفاع تكلفة الاستحواذ', 'مشاكل التوصيل', 'الدفع عند الاستلام (COD)', 'العائدات العالية'],
    opportunities: ['نمو سريع', 'انتشار الـ smartphones', 'تطور البنية اللوجستية', 'فرص الـ niches'],
    caseStudies: [
      { title: 'متجر منتجات صحية', outcome: 'وصل لـ $500K مبيعات في السنة الأولى' },
      { title: 'D2C fashion brand', outcome: 'انخفض CAC بنسبة 40%' },
    ],
    relatedUseCaseSlugs: ['build-ecommerce-store', 'pricing-strategy', 'build-content-marketing'],
    keywords: ['تجارة إلكترونية', 'متجر إلكتروني', 'ecommerce', 'shopify', 'دروب شيبينغ'],
  },
  {
    slug: 'saas',
    nameAr: 'البرمجيات كخدمة',
    nameEn: 'SaaS',
    metaDescriptionAr: 'كلميرون لشركات SaaS: من تحقق الفكرة إلى MRR متنامي. كل شيء تحتاجه لبناء SaaS ناجح.',
    metaDescriptionEn: 'Kalmeron for SaaS: from idea validation to growing MRR. Build a successful SaaS company.',
    heroIntroAr: 'SaaS قطاع يضاعف نفسه كل 3 سنوات في المنطقة. كلميرون يبني معك من الفكرة إلى الإطلاق إلى التحجيم.',
    marketSizeAr: '$1.5 مليار في MENA',
    growthRateAr: '30% سنوياً',
    topAgents: ['idea_validator', 'plan_builder', 'marketing_orchestrator', 'cfo_agent'],
    challenges: ['Product-Market Fit', 'تخفيض الـ Churn', 'استراتيجية التسعير', 'البيع B2B'],
    opportunities: ['Scaling عالمياً', 'Recurring revenue', 'High margins', 'Defensibility'],
    caseStudies: [
      { title: 'CRM للسوق المصري', outcome: 'وصل لـ 1000 عميل مدفوع في 18 شهر' },
      { title: 'منصة HR للشركات الصغيرة', outcome: 'حقق $500K ARR في السنة الأولى' },
    ],
    relatedUseCaseSlugs: ['validate-saas-idea', 'build-mvp-30-days', 'pricing-strategy'],
    keywords: ['SaaS', 'برمجيات كخدمة', 'subscription', 'B2B software'],
  },
  {
    slug: 'food-beverage',
    nameAr: 'الطعام والمشروبات',
    nameEn: 'Food & Beverage',
    metaDescriptionAr: 'كلميرون لقطاع الطعام: مطاعم، مطابخ سحابية، علامات FMCG. خبرة محلية متعمقة.',
    metaDescriptionEn: 'Kalmeron for F&B: restaurants, cloud kitchens, FMCG brands. Deep local expertise.',
    heroIntroAr: 'قطاع الطعام في مصر $40 مليار. مطاعم وعلامات FMCG ومطابخ سحابية. كلميرون يفهم تحديات كل نموذج.',
    marketSizeAr: '$40 مليار في مصر',
    growthRateAr: '12% سنوياً',
    topAgents: ['idea_validator', 'cfo_agent', 'legal_guide', 'marketing_orchestrator'],
    challenges: ['الاعتماد على الموردين', 'هامش ربح ضيق', 'تقلبات الأسعار', 'صعوبة التوسع'],
    opportunities: ['نمو طلب التوصيل', 'منتجات صحية', 'مطابخ سحابية low-CapEx', 'علامات D2C'],
    caseStudies: [
      { title: 'مطعم سحابي للأكل الصحي', outcome: 'افتتح 5 فروع في سنة' },
      { title: 'علامة قهوة محلية', outcome: 'دخلت 3 سلاسل سوبر ماركت' },
    ],
    relatedUseCaseSlugs: ['launch-cloud-restaurant'],
    keywords: ['مطعم', 'مطبخ سحابي', 'F&B', 'طعام', 'cloud kitchen'],
  },
  {
    slug: 'edtech',
    nameAr: 'التكنولوجيا التعليمية',
    nameEn: 'EdTech',
    metaDescriptionAr: 'كلميرون لمنصات التعليم: من K-12 إلى up-skilling. ابني منصة تعليم ناجحة.',
    metaDescriptionEn: 'Kalmeron for EdTech: from K-12 to up-skilling. Build a successful learning platform.',
    heroIntroAr: 'EdTech في المنطقة العربية ينمو 16% سنوياً. كلميرون يساعد في تصميم مناهج، تسعير، وتسويق.',
    marketSizeAr: '$2 مليار في MENA',
    growthRateAr: '16% سنوياً',
    topAgents: ['idea_validator', 'marketing_orchestrator', 'cfo_agent'],
    challenges: ['التحويل من free إلى paid', 'الاحتفاظ بالطلاب', 'بناء المحتوى الجيد', 'مقاومة الأهالي للتقنية'],
    opportunities: ['طلب على up-skilling', 'فجوة في المحتوى العربي', 'دعم حكومي للتعليم'],
    caseStudies: [
      { title: 'منصة تعليم برمجة بالعربية', outcome: '20K طالب نشط' },
      { title: 'تطبيق تعليم اللغة الإنجليزية للأطفال', outcome: '$2M ARR' },
    ],
    relatedUseCaseSlugs: ['build-mvp-30-days', 'pricing-strategy'],
    keywords: ['تعليم إلكتروني', 'edtech', 'تطبيق تعليمي', 'منصة تعلم'],
  },
  {
    slug: 'healthtech',
    nameAr: 'تكنولوجيا الصحة',
    nameEn: 'HealthTech',
    metaDescriptionAr: 'كلميرون لشركات الصحة الرقمية: telemedicine، تطبيقات صحية، AI تشخيصي.',
    metaDescriptionEn: 'Kalmeron for HealthTech: telemedicine, health apps, diagnostic AI.',
    heroIntroAr: 'قطاع الصحة الرقمية في طفرة بعد كوفيد. كلميرون يفهم regulation، البيع للمستشفيات، والامتثال.',
    marketSizeAr: '$1.2 مليار في MENA',
    growthRateAr: '24% سنوياً',
    topAgents: ['legal_guide', 'compliance', 'idea_validator', 'cfo_agent'],
    challenges: ['Regulation معقد', 'الثقة في AI الطبي', 'البيع للمستشفيات بطيء', 'تكلفة المحتوى الطبي'],
    opportunities: ['نقص الكوادر الطبية', 'انتشار التأمين الصحي', 'دعم حكومي', 'فرص الـ telemedicine'],
    caseStudies: [
      { title: 'منصة استشارات طبية', outcome: '50K استشارة شهرياً' },
      { title: 'تطبيق متابعة الأمراض المزمنة', outcome: 'شراكة مع 3 مستشفيات كبرى' },
    ],
    relatedUseCaseSlugs: ['validate-saas-idea'],
    keywords: ['healthtech', 'صحة رقمية', 'telemedicine', 'تطبيق طبي'],
  },
  {
    slug: 'logistics',
    nameAr: 'اللوجستيات والشحن',
    nameEn: 'Logistics',
    metaDescriptionAr: 'كلميرون لشركات اللوجستيات: من last-mile إلى freight forwarding.',
    metaDescriptionEn: 'Kalmeron for Logistics: from last-mile to freight forwarding.',
    heroIntroAr: 'اللوجستيات في المنطقة قطاع $25 مليار. كلميرون يخطط لك التشغيل، التسعير، والشراكات.',
    marketSizeAr: '$25 مليار في MENA',
    growthRateAr: '14% سنوياً',
    topAgents: ['cfo_agent', 'idea_validator', 'marketing_orchestrator'],
    challenges: ['Capital-intensive', 'هامش ربح ضيق', 'إدارة الأسطول', 'العملاء الكبار يفرضون شروط صعبة'],
    opportunities: ['نمو ecommerce', 'الـ COD يخلق فرص', 'الـ B2B logistics underserved'],
    caseStudies: [
      { title: 'شركة last-mile delivery', outcome: 'وصلت لـ 200 طلبية يومياً' },
    ],
    relatedUseCaseSlugs: ['build-ecommerce-store'],
    keywords: ['logistics', 'لوجستيات', 'شحن', 'توصيل'],
  },
  {
    slug: 'agritech',
    nameAr: 'التكنولوجيا الزراعية',
    nameEn: 'AgriTech',
    metaDescriptionAr: 'كلميرون للتكنولوجيا الزراعية: حلول للمزارعين، السلاسل، والتمويل الزراعي.',
    metaDescriptionEn: 'Kalmeron for AgriTech: solutions for farmers, supply chains, and agricultural finance.',
    heroIntroAr: 'الزراعة 11% من اقتصاد مصر. AgriTech قطاع underserved مع فرص ضخمة. كلميرون يفهم تحديات المزارع المصري.',
    marketSizeAr: '$500M في مصر',
    growthRateAr: '20% سنوياً',
    topAgents: ['idea_validator', 'cfo_agent', 'opportunity_radar'],
    challenges: ['Adoption بطيء', 'البنية التحتية الريفية', 'مقاومة التغيير', 'تمويل المزارعين'],
    opportunities: ['دعم حكومي قوي', 'فجوة بين الإنتاج والاستهلاك', 'الـ export markets'],
    caseStudies: [
      { title: 'منصة ربط مزارعين بمشترين', outcome: '10K مزارع مسجل' },
    ],
    relatedUseCaseSlugs: [],
    keywords: ['agritech', 'تكنولوجيا زراعية', 'زراعة ذكية'],
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return INDUSTRIES.map((i) => i.slug);
}
