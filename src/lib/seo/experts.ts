/**
 * Programmatic SEO — Experts (AI agents).
 * Pages: /experts and /experts/[slug]
 *
 * Each "expert" is one of Kalmeron's specialized agents, surfaced as a
 * dedicated landing page with its own SEO, capabilities, and use cases.
 */

export interface Expert {
  slug: string;
  nameAr: string;
  roleAr: string;
  emoji: string;
  metaDescriptionAr: string;
  taglineAr: string;
  whatItDoesAr: string;
  capabilities: string[];
  exampleQuestions: string[];
  bestForAr: string[];
  relatedExpertSlugs: string[];
  relatedUseCaseSlugs: string[];
  keywords: string[];
  category: 'finance' | 'legal' | 'marketing' | 'product' | 'hr' | 'strategy';
}

export const EXPERTS: Expert[] = [
  {
    slug: 'cfo-agent',
    nameAr: 'الـ CFO الافتراضي',
    roleAr: 'مدير مالي ذكي',
    emoji: '📊',
    metaDescriptionAr:
      'CFO افتراضي يبني نماذج مالية، يحلل التدفق النقدي، ويضع استراتيجية تسعير لشركتك بمعايير عالمية.',
    taglineAr: 'كل حسابات شركتك في وكيل واحد ذكي',
    whatItDoesAr:
      'وكيل CFO من كلميرون يبني نماذج مالية احترافية، يحلل البيانات، ويتنبأ بالتدفقات النقدية، ويوصي باستراتيجيات تسعير مدروسة. يستخدمه مؤسسون ومستثمرون للاطمئنان على أرقامهم.',
    capabilities: [
      'بناء نماذج مالية 36 شهراً (P&L, Cash Flow, Balance Sheet)',
      'تحليل Unit Economics وLTV:CAC',
      'استراتيجية تسعير value-based',
      'احتساب نقطة التعادل (Break-even)',
      'تحضير ملفات Due Diligence',
      'تتبع KPIs المالية أسبوعياً',
    ],
    exampleQuestions: [
      'احسبلي نقطة التعادل لو فتحت مطعم سحابي بـ 200 ألف جنيه',
      'ابني نموذج مالي SaaS بـ MRR متوقع $5K في 12 شهر',
      'كم لازم أحصّل لكل مستخدم عشان أكون profitable؟',
      'حلّل cash burn لشركتي وقولي متى محتاج جولة تمويل',
    ],
    bestForAr: ['الستارت أبس قبل أول جولة تمويل', 'مؤسسي SaaS', 'مطاعم وF&B', 'تجارة إلكترونية'],
    relatedExpertSlugs: ['idea-validator', 'opportunity-radar'],
    relatedUseCaseSlugs: ['raise-seed-funding', 'pricing-strategy'],
    keywords: ['CFO', 'مدير مالي', 'نموذج مالي', 'financial model'],
    category: 'finance',
  },
  {
    slug: 'legal-guide',
    nameAr: 'الحارس القانوني',
    roleAr: 'مستشار قانوني للأعمال',
    emoji: '⚖️',
    metaDescriptionAr:
      'مستشار قانوني ذكي مدرب على القانون المصري والخليجي. يجاوبك على أسئلة العقود، التراخيص، والامتثال.',
    taglineAr: 'استشارة قانونية فورية بمعايير محلية',
    whatItDoesAr:
      'الحارس القانوني يجيب على أسئلتك حول قانون الشركات المصري، قانون 151 لحماية البيانات، عقود العمل، التراخيص، وأي مسألة قانونية تخص ريادة الأعمال في مصر والخليج.',
    capabilities: [
      'مراجعة العقود وكشف البنود الخطرة',
      'صياغة عقود عمل وNDAs',
      'تحليل الامتثال للقانون 151 (حماية البيانات)',
      'إرشاد التراخيص (تجاري، صناعي، مهني)',
      'هيكلة الشركات (LLC, Joint Stock, Free Zone)',
      'استشارات الـ IP (علامة تجارية، براءة اختراع)',
    ],
    exampleQuestions: [
      'ما الفرق بين LLC وJoint Stock في مصر؟',
      'راجعلي عقد التوظيف ده وقولي إيه البنود الخطرة',
      'كيف أحمي علامتي التجارية في 5 دول عربية؟',
      'هل تطبيقي يحتاج رخصة من البنك المركزي؟',
    ],
    bestForAr: ['تأسيس شركة جديدة', 'فنتك يحتاج تراخيص', 'توسع للخليج', 'حماية الملكية الفكرية'],
    relatedExpertSlugs: ['compliance-officer', 'cfo-agent'],
    relatedUseCaseSlugs: ['launch-fintech-app', 'expand-to-saudi-uae'],
    keywords: ['قانوني', 'محامي', 'تراخيص', 'عقود', 'قانون 151'],
    category: 'legal',
  },
  {
    slug: 'idea-validator',
    nameAr: 'مدقق الأفكار',
    roleAr: 'محلل فكرة العمل',
    emoji: '💡',
    metaDescriptionAr:
      'حلّل فكرتك قبل أن تنفق جنيهاً واحداً. يقيّم السوق، المنافسين، الجدوى، ويعطيك go/no-go مع المبررات.',
    taglineAr: 'لا تبني منتج لا أحد يريده',
    whatItDoesAr:
      'مدقق الأفكار يأخذ فكرة عملك ويختبرها على 200 شخصية تركيبية، يحلل السوق المصري والخليجي، يدرس المنافسين، ويعطيك تقرير 30 صفحة بقرار go/pivot/no-go مدعوم بمبررات قابلة للدفاع.',
    capabilities: [
      'تحليل حجم السوق (TAM, SAM, SOM)',
      'تشريح 5+ منافسين بالتفصيل',
      'اختبار pitch على 200 شخصية تركيبية',
      'حساب احتمالية Product-Market Fit',
      'اقتراح 5 pivots محتملة',
      'تقييم المخاطر التنظيمية',
    ],
    exampleQuestions: [
      'فكرة عمل: تطبيق لتأجير الأدوات بين الجيران',
      'هل سوق دروب شيبينغ في مصر مشبع؟',
      'قيّم فكرة منصة learning للمصريين بالخليج',
      'منافسيّ من؟ ابحث في المنطقة العربية',
    ],
    bestForAr: ['قبل بناء MVP', 'قبل إنفاق ميزانية تسويق', 'قبل البحث عن مستثمر', 'لاتخاذ قرار pivot'],
    relatedExpertSlugs: ['mistake-shield', 'opportunity-radar', 'success-museum'],
    relatedUseCaseSlugs: ['validate-saas-idea', 'launch-cloud-restaurant'],
    keywords: ['تحقق فكرة', 'product market fit', 'دراسة جدوى', 'validation'],
    category: 'strategy',
  },
  {
    slug: 'marketing-orchestrator',
    nameAr: 'مدير التسويق',
    roleAr: 'استراتيجي تسويق',
    emoji: '📣',
    metaDescriptionAr:
      'بناء وتنفيذ استراتيجيات تسويق رقمية للسوق العربي. من Meta Ads إلى TikTok إلى SEO عربي.',
    taglineAr: 'فريق تسويق كامل في وكيل واحد',
    whatItDoesAr:
      'مدير التسويق يبني خطط 90 يوم متكاملة، يصمم حملات Meta/Google/TikTok، يكتب copy احترافي بالعربية، ويحلل ROI لكل قناة. مدرب على ميزانيات صغيرة وكبيرة.',
    capabilities: [
      'استراتيجية تسويق 90 يوم',
      'صياغة إعلانات Meta و TikTok و Google',
      'بحث الكلمات المفتاحية بالعربية',
      'حساب CAC و LTV لكل قناة',
      'بناء funnel تحويل',
      'استراتيجية المؤثرين والشراكات',
    ],
    exampleQuestions: [
      'ابني خطة تسويق لمتجر فاشن D2C بميزانية 50 ألف جنيه/شهر',
      'اكتبلي 5 إعلانات Meta لتطبيق توصيل طعام',
      'إيه أفضل قنوات التسويق لشركة B2B SaaS في مصر؟',
      'حللي حملتي وقولي ليه الـ CAC مرتفع',
    ],
    bestForAr: ['ستارت أبس B2C', 'تجارة إلكترونية', 'إطلاق منتج جديد', 'إعادة استهداف العملاء'],
    relatedExpertSlugs: ['cfo-agent', 'idea-validator'],
    relatedUseCaseSlugs: ['build-content-marketing', 'build-ecommerce-store'],
    keywords: ['تسويق', 'marketing', 'Meta ads', 'حملات إعلانية'],
    category: 'marketing',
  },
  {
    slug: 'opportunity-radar',
    nameAr: 'رادار الفرص',
    roleAr: 'محلل فرص ومستجدات',
    emoji: '🔭',
    metaDescriptionAr:
      'يكتشف فرص الأعمال الجديدة في السوق المصري والخليجي. يتابع جولات التمويل، الاتجاهات، والثغرات.',
    taglineAr: 'اعرف فرصتك القادمة قبل المنافسين',
    whatItDoesAr:
      'رادار الفرص يحلل بيانات MENA Tech، Magnitt، وأخبار التمويل لاكتشاف فرص لم يتم استغلالها بعد. يحدد القطاعات الناشئة، الفجوات في السوق، والمناطق الجغرافية الواعدة.',
    capabilities: [
      'تتبع جولات التمويل الإقليمية أسبوعياً',
      'تحديد القطاعات في طور النمو',
      'كشف الفجوات بين العرض والطلب',
      'مقارنة فرص MENA vs أوروبا',
      'تحليل الـ exits والـ acquisitions',
      'تقارير شهرية مخصصة',
    ],
    exampleQuestions: [
      'إيه أكبر 5 قطاعات حصلت على تمويل في 2026؟',
      'ابحثلي عن فرصة في AI للسوق السعودي',
      'إيه القطاعات اللي محدش لاحظها لسه؟',
      'حللي جولات seed في فبراير 2026',
    ],
    bestForAr: ['مؤسسون يبحثون عن فكرة', 'VCs ومستثمرون', 'استراتيجيون مؤسسات', 'كتّاب تقارير'],
    relatedExpertSlugs: ['idea-validator', 'success-museum'],
    relatedUseCaseSlugs: ['raise-seed-funding'],
    keywords: ['فرص أعمال', 'market opportunities', 'تمويل MENA', 'investments'],
    category: 'strategy',
  },
  {
    slug: 'mistake-shield',
    nameAr: 'درع الأخطاء',
    roleAr: 'حامي من القرارات الخاطئة',
    emoji: '🛡️',
    metaDescriptionAr:
      'يحذرك من 50+ خطأ شائع يرتكبها المؤسسون. مدرب على آلاف قصص الفشل لحمايتك من تكرارها.',
    taglineAr: 'تعلّم من أخطاء غيرك بدلاً من أخطائك',
    whatItDoesAr:
      'درع الأخطاء يفحص قراراتك ضد قاعدة بيانات ضخمة من قصص فشل الستارت أبس. كل قرار، كل عقد، كل خطوة — يقول لك: "في 7 شركات سابقة، ده اللي حصل عندما عملوا نفس الكلام".',
    capabilities: [
      'فحص القرارات الاستراتيجية ضد 1000+ قصة فشل',
      'تنبيه من تسعير، تمويل، توظيف، عقود خطرة',
      'تحليل red flags في pitch decks',
      'مراجعة شروط Term Sheets',
      'كشف overconfidence في التوقعات',
      'تقرير risk score مستمر',
    ],
    exampleQuestions: [
      'أنا حابب أرفع 3 مليون دولار seed، إيه الـ red flags؟',
      'حلّل القرار: التوظيف 5 موظفين قبل MRR',
      'وافقت على 30% equity للـ VC الأول، صح ولا غلط؟',
      'إيه الأخطاء اللي بيعملها founders السوبر markets؟',
    ],
    bestForAr: ['قبل أي قرار كبير', 'قبل توقيع عقود', 'مراجعة عروض المستثمرين', 'تقييم Strategy جديدة'],
    relatedExpertSlugs: ['idea-validator', 'cfo-agent', 'success-museum'],
    relatedUseCaseSlugs: ['raise-seed-funding', 'hire-first-team'],
    keywords: ['أخطاء ستارت أب', 'startup mistakes', 'failure', 'risk management'],
    category: 'strategy',
  },
  {
    slug: 'success-museum',
    nameAr: 'متحف النجاحات',
    roleAr: 'محلل قصص نجاح',
    emoji: '🏆',
    metaDescriptionAr:
      'تعلم من قصص النجاح في المنطقة. مدرب على Swvl, Vezeeta, Fawry, Halan, MaxAB وغيرهم.',
    taglineAr: 'استنسخ ما نجح للآخرين',
    whatItDoesAr:
      'متحف النجاحات يحلل قصص ستارت أبس عربية ناجحة بعمق: ماذا فعلوا في مرحلة seed، كيف نجحوا في PMF، كيف حصلوا على أول 10 آلاف عميل. يستخرج الـ patterns ويطبقها على فكرتك.',
    capabilities: [
      '50+ قصة نجاح مفصلة من MENA',
      'تحليل marketing playbooks لكل شركة',
      'كشف القرارات الـ critical في كل مرحلة',
      'مقارنة شركتك بأقرب نظير',
      'استخراج إستراتيجيات قابلة للتطبيق',
      'تتبع timeline النمو',
    ],
    exampleQuestions: [
      'كيف وصل Vezeeta لـ 1 مليون مستخدم؟',
      'إيه القرارات اللي خلت Swvl تنجح في الـ pivot؟',
      'حلّل marketing playbook لـ Halan',
      'إيه أوجه التشابه بين شركتي وMaxAB؟',
    ],
    bestForAr: ['دراسة المنافسين', 'تخطيط مراحل النمو', 'Pitch إلى مستثمرين', 'استلهام استراتيجيات'],
    relatedExpertSlugs: ['idea-validator', 'opportunity-radar', 'mistake-shield'],
    relatedUseCaseSlugs: ['raise-seed-funding', 'expand-to-saudi-uae'],
    keywords: ['قصص نجاح', 'success stories', 'MENA startups', 'case studies'],
    category: 'strategy',
  },
  {
    slug: 'plan-builder',
    nameAr: 'باني الخطط',
    roleAr: 'مهندس خطط عمل',
    emoji: '📋',
    metaDescriptionAr:
      'يبني خطط عمل احترافية بمعايير عالمية. خطة لـ 90 يوم، أو سنة، أو 5 سنوات.',
    taglineAr: 'خطة عمل قابلة للتنفيذ في ساعة',
    whatItDoesAr:
      'باني الخطط ينتج خطط عمل واضحة قابلة للتنفيذ: milestones، tasks، assignees، deadlines. يولّد خطة 30/60/90، أو سنوية، أو 5-year strategy. يربط كل task بـ KPI قابل للقياس.',
    capabilities: [
      'خطط عمل 30/60/90 يوم',
      'roadmaps سنوية و5 سنوات',
      'تقسيم Goals إلى OKRs و tasks',
      'تخصيص resources وdeadlines',
      'ربط tasks بـ KPIs',
      'تصدير لـ Notion / Asana / Linear',
    ],
    exampleQuestions: [
      'ابنيلي خطة 90 يوم لإطلاق MVP',
      'حوّل OKR ده إلى tasks أسبوعية',
      'roadmap لـ 12 شهر لتطبيق فنتك',
      'قسّم goal "وصول 10K مستخدم" إلى مهام',
    ],
    bestForAr: ['قبل بدء مشروع جديد', 'كل ربع سنة', 'بعد جولة تمويل', 'تحويل استراتيجية لتنفيذ'],
    relatedExpertSlugs: ['cfo-agent', 'idea-validator'],
    relatedUseCaseSlugs: ['build-mvp-30-days', 'launch-cloud-restaurant'],
    keywords: ['خطة عمل', 'business plan', 'OKR', 'roadmap'],
    category: 'product',
  },
  {
    slug: 'hr-orchestrator',
    nameAr: 'مدير الموارد البشرية',
    roleAr: 'مستشار توظيف وثقافة',
    emoji: '👥',
    metaDescriptionAr:
      'يبنيلك hiring plan، يكتب JDs، يحدد رواتب السوق، ويصمم onboarding لأول 30/60/90 يوم.',
    taglineAr: 'فريق HR كامل من اليوم الأول',
    whatItDoesAr:
      'مدير HR يساعدك في كل ما يخص الناس: متى توظف، من توظف، كم تدفع، كيف تستقبل، كيف تحافظ. مدرب على رواتب السوق المصري والخليجي وأفضل ممارسات الستارت أبس.',
    capabilities: [
      'بناء hiring plan لـ 12-24 شهر',
      'كتابة JDs احترافية',
      'Compensation benchmarking في MENA',
      'تصميم Equity vesting plans',
      'Onboarding 30/60/90 لكل دور',
      'إدارة الأداء وتقييمات سنوية',
    ],
    exampleQuestions: [
      'كم لازم أدفع لـ Senior Backend Engineer في القاهرة 2026؟',
      'ابنيلي hiring plan لشركتي اللي حصلت على seed',
      'اكتب JD لـ Head of Marketing',
      'صمم Equity plan لأول 5 موظفين',
    ],
    bestForAr: ['ستارت أبس بعد جولة seed', 'فرق توسع سريع', 'مؤسسون بدون خلفية HR', 'بناء ثقافة شركة'],
    relatedExpertSlugs: ['legal-guide', 'cfo-agent'],
    relatedUseCaseSlugs: ['hire-first-team'],
    keywords: ['HR', 'توظيف', 'hiring', 'موارد بشرية'],
    category: 'hr',
  },
  {
    slug: 'compliance-officer',
    nameAr: 'مسؤول الامتثال',
    roleAr: 'خبير KYC/AML/GDPR',
    emoji: '🔐',
    metaDescriptionAr:
      'يضمن امتثال شركتك للقوانين المحلية والدولية: قانون 151 المصري، PDPL السعودي، GDPR، KYC, AML.',
    taglineAr: 'امتثال مستمر بدون قلق',
    whatItDoesAr:
      'مسؤول الامتثال يفحص شركتك ضد متطلبات القوانين المحلية والدولية. يبني لك policies وإجراءات. يفيدك خصوصاً في فنتك، healthtech، edtech، وكل قطاع منظّم.',
    capabilities: [
      'فحص امتثال للقانون 151 المصري',
      'تطبيق GDPR للأسواق الأوروبية',
      'PDPL السعودي والـ DPL الإماراتي',
      'بناء سياسات KYC و AML',
      'تجهيز Privacy Policy وTerms',
      'إعداد ملفات الـ audit',
    ],
    exampleQuestions: [
      'هل تطبيقي ممتثل للقانون 151؟',
      'ابنيلي KYC flow لمنصة BNPL',
      'كيف أكون GDPR-compliant لو كنت بأخدم أوروبا؟',
      'راجعلي Privacy Policy ضد PDPL السعودي',
    ],
    bestForAr: ['شركات فنتك', 'منصات healthtech', 'منصات تخدم أوروبا', 'B2B SaaS لمؤسسات'],
    relatedExpertSlugs: ['legal-guide'],
    relatedUseCaseSlugs: ['launch-fintech-app'],
    keywords: ['compliance', 'GDPR', 'قانون 151', 'KYC', 'AML'],
    category: 'legal',
  },
  {
    slug: 'seo-manager',
    nameAr: 'مدير الـ SEO',
    roleAr: 'استراتيجي SEO عربي',
    emoji: '🔍',
    metaDescriptionAr:
      'بناء استراتيجية SEO عربية متكاملة. بحث كلمات، تحسين on-page، بناء روابط، وقياس النتائج.',
    taglineAr: 'احصل على 10K زائر شهري بدون إعلانات',
    whatItDoesAr:
      'مدير SEO يفهم خصوصية البحث بالعربية. يجد 50+ كلمة قابلة للترتيب، يخطط محتوى 90 يوم، يحسّن on-page SEO، ويبني استراتيجية روابط.',
    capabilities: [
      'بحث كلمات مفتاحية بالعربية',
      'Content calendar 90 يوم',
      'On-page optimization',
      'Technical SEO audit',
      'استراتيجية backlinks للسوق العربي',
      'تتبع GSC و GA4',
    ],
    exampleQuestions: [
      'إيه أفضل 50 keyword لمتجر إلكتروني للأكل الصحي؟',
      'حلل موقعي تقنياً وقولي عيوب SEO',
      'اقترح content cluster لمنصة edtech',
      'كيف أحصل على backlinks من مواقع عربية موثوقة؟',
    ],
    bestForAr: ['Content sites', 'مدونات شركات', 'تجارة إلكترونية', 'منصات SaaS B2B'],
    relatedExpertSlugs: ['marketing-orchestrator'],
    relatedUseCaseSlugs: ['build-content-marketing'],
    keywords: ['SEO عربي', 'تحسين محركات البحث', 'keyword research'],
    category: 'marketing',
  },
  {
    slug: 'content-creator',
    nameAr: 'صانع المحتوى',
    roleAr: 'كاتب محتوى احترافي',
    emoji: '✍️',
    metaDescriptionAr:
      'يكتب مقالات، منشورات سوشيال، ايميلات، وscripts فيديو بنبرة شركتك وبالعامية أو الفصحى.',
    taglineAr: 'فريق محتوى متكامل بالعربية',
    whatItDoesAr:
      'صانع المحتوى ينتج محتوى عالي الجودة بالعربية: مقالات SEO، منشورات LinkedIn، تويتات، email campaigns، scripts فيديو يوتيوب وtiktok. يلتزم بنبرة علامتك التجارية.',
    capabilities: [
      'مقالات SEO بـ 1500-3000 كلمة',
      'منشورات LinkedIn و Twitter بنبرة احترافية',
      'Email campaigns مدروسة',
      'Scripts فيديو لـ YouTube و TikTok',
      'تكييف لهجات: مصرية، خليجية، شامية',
      'A/B testing لـ headlines',
    ],
    exampleQuestions: [
      'اكتب مقال 2000 كلمة عن تأسيس مطعم سحابي',
      'ابني سلسلة 10 تويتات عن فكرة شركتي',
      'صياغة email سيكونس لـ onboarding مستخدم جديد',
      'اكتب script TikTok 30 ثانية يشرح منتجي',
    ],
    bestForAr: ['Content marketing', 'سوشيال ميديا', 'Email marketing', 'Video content'],
    relatedExpertSlugs: ['marketing-orchestrator', 'seo-manager'],
    relatedUseCaseSlugs: ['build-content-marketing'],
    keywords: ['كتابة محتوى', 'content creation', 'copywriting'],
    category: 'marketing',
  },
];

export function getExpertBySlug(slug: string): Expert | undefined {
  return EXPERTS.find((e) => e.slug === slug);
}

export function getAllExpertSlugs(): string[] {
  return EXPERTS.map((e) => e.slug);
}

export function getExpertsByCategory(category: Expert['category']): Expert[] {
  return EXPERTS.filter((e) => e.category === category);
}

export const EXPERT_CATEGORIES: { id: Expert['category']; nameAr: string }[] = [
  { id: 'finance', nameAr: 'المالية' },
  { id: 'legal', nameAr: 'القانون والامتثال' },
  { id: 'marketing', nameAr: 'التسويق' },
  { id: 'product', nameAr: 'المنتج والتخطيط' },
  { id: 'hr', nameAr: 'الموارد البشرية' },
  { id: 'strategy', nameAr: 'الاستراتيجية' },
];
