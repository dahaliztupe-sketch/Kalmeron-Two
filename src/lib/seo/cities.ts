/**
 * Programmatic SEO — City-specific landing pages.
 * Pages: /cities/[city]
 */

export interface CityPage {
  slug: string;
  cityAr: string;
  cityEn: string;
  countryAr: string;
  countryEn: string;
  metaDescriptionAr: string;
  heroIntroAr: string;
  ecosystemFactsAr: string[];
  topVCs: string[];
  popularUseCasesAr: { title: string; description: string }[];
  localResources: { name: string; description: string }[];
  successStories: { name: string; achievement: string }[];
  keywords: string[];
}

export const CITIES: CityPage[] = [
  {
    slug: 'cairo',
    cityAr: 'القاهرة',
    cityEn: 'Cairo',
    countryAr: 'مصر',
    countryEn: 'Egypt',
    metaDescriptionAr: 'كل ما تحتاجه لإطلاق ستارت أب من القاهرة: التراخيص، التمويل، الـ ecosystem، والـ resources.',
    heroIntroAr: 'القاهرة عاصمة الستارت أبس في شمال أفريقيا. أكثر من 1500 startup نشط، $300M في التمويل سنوياً.',
    ecosystemFactsAr: [
      '1500+ startup نشط في القاهرة',
      '$300M تمويل سنوي',
      '40+ VC وaccelerator',
      'نسبة الـ technical talent: 35K مهندس برمجيات',
      'Cost of living: 1/4 من دبي',
    ],
    topVCs: ['Algebra Ventures', 'Sawari Ventures', '500 Startups MENA', 'A15', 'Disruptech'],
    popularUseCasesAr: [
      { title: 'فنتك للسوق المصري', description: 'فوري، InstaPay، crypto adoption عالي.' },
      { title: 'E-commerce', description: 'سوق $4B ينمو 30%.' },
      { title: 'Edtech', description: '25M طالب، طلب على التعليم الإلكتروني.' },
      { title: 'Healthtech', description: 'نقص أطباء + insurance رقمي.' },
    ],
    localResources: [
      { name: 'Flat6Labs Cairo', description: 'أكبر accelerator في المنطقة.' },
      { name: 'AUC Venture Lab', description: 'حاضنة الجامعة الأمريكية.' },
      { name: 'GrEEK Campus', description: 'أكبر hub للستارت أبس.' },
      { name: 'IDA', description: 'مكتب التنمية الصناعية.' },
    ],
    successStories: [
      { name: 'Swvl', achievement: 'IPO على NASDAQ' },
      { name: 'Fawry', achievement: 'IPO على EGX، $1B+ market cap' },
      { name: 'Halan', achievement: 'Unicorn $1B+ valuation' },
    ],
    keywords: ['ستارت أب القاهرة', 'cairo startup', 'cairo VC'],
  },
  {
    slug: 'riyadh',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    metaDescriptionAr: 'الرياض عاصمة الستارت أبس الجديدة في الخليج. Vision 2030 وضخ مليارات.',
    heroIntroAr: 'الرياض في انفجار. Vision 2030 يضخ $620B في القطاعات الجديدة. الفرص للستارت أبس ضخمة.',
    ecosystemFactsAr: [
      '900+ startup نشط',
      '$1.5B تمويل في 2025',
      'PIF أكبر صندوق سيادي في المنطقة',
      'Mega projects: NEOM، Qiddiya، Diriyah',
      'حوافز ضريبية للستارت أبس',
    ],
    topVCs: ['STV', 'PIF', 'Wa\'ed Ventures', 'Vision Ventures', 'Raed Ventures'],
    popularUseCasesAr: [
      { title: 'Fintech', description: 'SAMA رخص 30+ fintech في 2024.' },
      { title: 'Govtech', description: 'Vision 2030 يحتاج tech للحكومة.' },
      { title: 'Religious tech', description: 'Hajj، Umrah، Quran apps.' },
      { title: 'Entertainment', description: 'GEA يضخ مليارات.' },
    ],
    localResources: [
      { name: 'Monsha\'at', description: 'هيئة المنشآت السعودية.' },
      { name: 'Misk Innovation', description: 'مبادرة الأمير محمد بن سلمان.' },
      { name: 'KAUST', description: 'جامعة الملك عبدالله للتقنية.' },
      { name: 'NEOM Tech', description: 'مدينة المستقبل.' },
    ],
    successStories: [
      { name: 'Tabby', achievement: 'Unicorn، $7B valuation' },
      { name: 'Foodics', achievement: '$170M Series C' },
      { name: 'Jahez', achievement: 'IPO على Tadawul' },
    ],
    keywords: ['ستارت أب الرياض', 'riyadh startup', 'saudi VC', 'Vision 2030'],
  },
  {
    slug: 'dubai',
    cityAr: 'دبي',
    cityEn: 'Dubai',
    countryAr: 'الإمارات',
    countryEn: 'UAE',
    metaDescriptionAr: 'دبي hub التكنولوجيا في المنطقة. Free zones، rapid setup، talent عالمي.',
    heroIntroAr: 'دبي تستقبل 1500 startup سنوياً. Free zones، setup في أسبوع، 100% ownership، 0% income tax.',
    ecosystemFactsAr: [
      '5000+ startup في دبي',
      '$3B تمويل في 2025',
      'Setup في 5 أيام في DIFC',
      'Golden visa للمستثمرين والـ founders',
      'Talent من 200+ جنسية',
    ],
    topVCs: ['BECO Capital', 'Wamda', 'Middle East Venture Partners', 'Shorooq', 'Cotu Ventures'],
    popularUseCasesAr: [
      { title: 'Web3 وCrypto', description: 'VARA يرخص. Dubai pro-crypto.' },
      { title: 'Logistics', description: 'Hub الشرق الأوسط للـ shipping.' },
      { title: 'Proptech', description: 'سوق عقاري $30B.' },
      { title: 'Tourism tech', description: '20M زائر سنوياً.' },
    ],
    localResources: [
      { name: 'DIFC Innovation Hub', description: 'حاضنة DIFC.' },
      { name: 'Dubai Future Foundation', description: 'مبادرات حكومية.' },
      { name: 'Hub71', description: 'في أبوظبي - مكمل.' },
      { name: 'in5', description: 'حاضنة TECOM.' },
    ],
    successStories: [
      { name: 'Careem', achievement: 'بيع لـ Uber بـ $3.1B' },
      { name: 'Souq', achievement: 'بيع لـ Amazon بـ $580M' },
      { name: 'Property Finder', achievement: '$430M valuation' },
    ],
    keywords: ['ستارت أب دبي', 'dubai startup', 'DIFC', 'free zone'],
  },
  {
    slug: 'abu-dhabi',
    cityAr: 'أبوظبي',
    cityEn: 'Abu Dhabi',
    countryAr: 'الإمارات',
    countryEn: 'UAE',
    metaDescriptionAr: 'أبوظبي تنافس دبي بـ Hub71 وحوافز ضخمة. AI و deep tech.',
    heroIntroAr: 'أبوظبي تركز على deep tech: AI، biotech، climate. Hub71 يقدم $250K incentives لكل startup.',
    ecosystemFactsAr: [
      '500+ startup في Hub71',
      '$300K incentive per startup',
      'AI71 صندوق $1B للذكاء الاصطناعي',
      'G42 شراكات مع OpenAI',
      'Tax incentives سخية',
    ],
    topVCs: ['Mubadala', 'ADQ', 'Hub71 fund', 'G42 Ventures'],
    popularUseCasesAr: [
      { title: 'AI Foundation Models', description: 'G42، MGX investments.' },
      { title: 'Climate tech', description: 'Masdar City focus.' },
      { title: 'Biotech', description: 'Mubadala Health.' },
      { title: 'Defense tech', description: 'EDGE Group ecosystem.' },
    ],
    localResources: [
      { name: 'Hub71', description: 'حاضنة حكومية.' },
      { name: 'Masdar Institute', description: 'جامعة الطاقة المتجددة.' },
      { name: 'NYU Abu Dhabi', description: 'بحث وأكاديميا.' },
    ],
    successStories: [
      { name: 'G42', achievement: 'AI champion، $50B+ valuation' },
      { name: 'Yahsat', achievement: 'IPO على ADX' },
    ],
    keywords: ['ستارت أب أبوظبي', 'abu dhabi startup', 'Hub71', 'AI'],
  },
  {
    slug: 'amman',
    cityAr: 'عمان',
    cityEn: 'Amman',
    countryAr: 'الأردن',
    countryEn: 'Jordan',
    metaDescriptionAr: 'عمان hub للموهبة التقنية في المنطقة. Talent ممتاز بتكلفة معقولة.',
    heroIntroAr: 'الأردن صدر أكبر مجموعة من الستارت أبس الإقليمية: Maktoob، Kareem (founders). الـ talent العميق.',
    ecosystemFactsAr: [
      '300+ startup في عمان',
      'Top tech talent بـ 1/3 سعر دبي',
      'iPark أكبر hub',
      'Oasis500 أقدم accelerator',
      'دعم القطاع التقني من الحكومة',
    ],
    topVCs: ['Oasis500', 'IRIS', 'iV Ventures'],
    popularUseCasesAr: [
      { title: 'B2B SaaS', description: 'export للأسواق الخليجية.' },
      { title: 'Mena tech', description: 'تركز على الإقليم.' },
    ],
    localResources: [
      { name: 'iPark', description: 'حاضنة الأردن.' },
      { name: 'Oasis500', description: 'أقدم accelerator.' },
    ],
    successStories: [
      { name: 'Maktoob', achievement: 'بيع لـ Yahoo بـ $164M' },
      { name: 'Mawdoo3', achievement: '$30M+ raised' },
    ],
    keywords: ['ستارت أب الأردن', 'amman startup', 'jordan tech'],
  },
  {
    slug: 'casablanca',
    cityAr: 'الدار البيضاء',
    cityEn: 'Casablanca',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    metaDescriptionAr: 'الدار البيضاء عاصمة الأعمال في شمال أفريقيا. Gateway لأفريقيا.',
    heroIntroAr: 'الدار البيضاء بوابة لأفريقيا. Casablanca Finance City تنافس DIFC. الـ francophone advantage.',
    ecosystemFactsAr: [
      '400+ startup',
      'CFC مشابه لـ DIFC',
      'Talent francophone للـ EU markets',
      'بوابة لـ 54 دولة أفريقية',
    ],
    topVCs: ['Maroc Numeric Fund', 'Outlierz Ventures', '212 Founders'],
    popularUseCasesAr: [
      { title: 'Africa expansion', description: 'بوابة للقارة.' },
      { title: 'Fintech', description: 'سوق underbanked.' },
    ],
    localResources: [
      { name: 'CFC', description: 'Casablanca Finance City.' },
      { name: 'StartupYourLife', description: 'حاضنة.' },
    ],
    successStories: [
      { name: 'Avito', achievement: 'بيع لـ OLX' },
      { name: 'Hmizate', achievement: 'بيع لـ Jumia' },
    ],
    keywords: ['ستارت أب المغرب', 'casablanca', 'morocco startup'],
  },
  {
    slug: 'doha',
    cityAr: 'الدوحة',
    cityEn: 'Doha',
    countryAr: 'قطر',
    countryEn: 'Qatar',
    metaDescriptionAr: 'الدوحة فرص ضخمة في sports tech، gov tech، وLNG industry.',
    heroIntroAr: 'قطر تستثمر في tech بعد الـ World Cup. QSTP يدعم startups بـ $1M grants.',
    ecosystemFactsAr: [
      '200+ startup',
      'QSTP grants $1M',
      'QIA صندوق سيادي $450B',
      'Vision 2030 Qatar',
    ],
    topVCs: ['QIC Capital', 'Qatar Development Bank'],
    popularUseCasesAr: [
      { title: 'Sports tech', description: 'فنادق الـ World Cup فرص.' },
      { title: 'Govtech', description: 'تحول رقمي حكومي.' },
    ],
    localResources: [
      { name: 'QSTP', description: 'Qatar Science & Technology Park.' },
      { name: 'QFC', description: 'Qatar Financial Centre.' },
    ],
    successStories: [{ name: 'Snoonu', achievement: 'Top food delivery' }],
    keywords: ['ستارت أب قطر', 'doha startup', 'qatar tech'],
  },
  {
    slug: 'kuwait-city',
    cityAr: 'مدينة الكويت',
    cityEn: 'Kuwait City',
    countryAr: 'الكويت',
    countryEn: 'Kuwait',
    metaDescriptionAr: 'الكويت سوق صغير لكن غني. Per capita revenue من الأعلى عالمياً.',
    heroIntroAr: 'الكويت 4.5M ساكن لكن GDP per capita $35K. عملاء يدفعون premium.',
    ecosystemFactsAr: [
      '150+ startup',
      'CITRA يدعم digital',
      'NTEC accelerator',
      'KFAS funding',
    ],
    topVCs: ['NTEC', 'Faith Capital'],
    popularUseCasesAr: [
      { title: 'F&B tech', description: 'سوق طعام نشط جداً.' },
      { title: 'Premium services', description: 'العملاء يدفعون.' },
    ],
    localResources: [{ name: 'NTEC', description: 'National Tech Enterprises Co.' }],
    successStories: [{ name: 'Talabat', achievement: 'بدأت في الكويت، Now $2B+' }],
    keywords: ['ستارت أب الكويت', 'kuwait startup'],
  },
  {
    slug: 'manama',
    cityAr: 'المنامة',
    cityEn: 'Manama',
    countryAr: 'البحرين',
    countryEn: 'Bahrain',
    metaDescriptionAr: 'البحرين رخصت أول crypto exchange في المنطقة. Fintech-friendly.',
    heroIntroAr: 'البحرين رائدة في fintech: أول crypto licenses، أول regulatory sandbox.',
    ecosystemFactsAr: [
      '180+ startup',
      'CBB sandbox أول في المنطقة',
      'Tamkeen funding',
      'Bahrain FinTech Bay',
    ],
    topVCs: ['Tenmou', 'C5 Capital'],
    popularUseCasesAr: [
      { title: 'Fintech', description: 'CBB ودود مع innovation.' },
      { title: 'Crypto', description: 'أول regulatory framework.' },
    ],
    localResources: [{ name: 'Bahrain FinTech Bay', description: 'Hub رئيسي.' }],
    successStories: [{ name: 'Rain', achievement: 'أول crypto exchange مرخص' }],
    keywords: ['ستارت أب البحرين', 'manama startup', 'fintech bahrain'],
  },
  {
    slug: 'beirut',
    cityAr: 'بيروت',
    cityEn: 'Beirut',
    countryAr: 'لبنان',
    countryEn: 'Lebanon',
    metaDescriptionAr: 'بيروت تنتج top tech talent للمنطقة بتكلفة منخفضة.',
    heroIntroAr: 'لبنان رغم التحديات يصدر مواهب عالمية. Many regional unicorns founded by Lebanese.',
    ecosystemFactsAr: [
      'Top engineering talent',
      'Bilingual workforce',
      'Diaspora قوي عالمياً',
    ],
    topVCs: ['Berytech', 'IM Capital', 'B&Y Ventures'],
    popularUseCasesAr: [
      { title: 'Tech outsourcing', description: 'Talent ممتاز.' },
      { title: 'Diaspora products', description: 'لـ 14M لبناني خارج البلد.' },
    ],
    localResources: [{ name: 'Berytech', description: 'حاضنة رائدة.' }],
    successStories: [{ name: 'Anghami', achievement: 'IPO على NASDAQ' }],
    keywords: ['ستارت أب لبنان', 'beirut startup', 'lebanon tech'],
  },
  {
    slug: 'tunis',
    cityAr: 'تونس',
    cityEn: 'Tunis',
    countryAr: 'تونس',
    countryEn: 'Tunisia',
    metaDescriptionAr: 'تونس بقانون Startup Act الأول في المنطقة. Tech talent ممتاز.',
    heroIntroAr: 'تونس صدرت Startup Act 2018 - أول قانون من نوعه. Eligible startups تحصل على benefits ضخمة.',
    ecosystemFactsAr: [
      '200+ startup مُعتمد',
      'Startup Act benefits',
      'Talent francophone',
      'Cost منخفضة جداً',
    ],
    topVCs: ['216 Capital', 'Anava Seed Fund'],
    popularUseCasesAr: [
      { title: 'Africa tech', description: 'بوابة شمال أفريقيا.' },
      { title: 'B2B SaaS', description: 'لـ EU وMENA.' },
    ],
    localResources: [{ name: 'Smart Tunisia', description: 'مبادرة حكومية.' }],
    successStories: [{ name: 'InstaDeep', achievement: 'بيع لـ BioNTech بـ $682M' }],
    keywords: ['ستارت أب تونس', 'tunis startup', 'tunisia tech'],
  },
  {
    slug: 'muscat',
    cityAr: 'مسقط',
    cityEn: 'Muscat',
    countryAr: 'عُمان',
    countryEn: 'Oman',
    metaDescriptionAr: 'عُمان تركز على tourism وlogistics tech. Vision 2040 يفتح فرص.',
    heroIntroAr: 'عُمان غير المستكشفة. Oman Vision 2040 يضخ في tech. السوق صغير لكن أقل تنافسية.',
    ecosystemFactsAr: [
      '100+ startup',
      'Oman Investment Authority',
      'Riyada SME programs',
      'Vision 2040',
    ],
    topVCs: ['Oman Technology Fund', 'Phaze Ventures'],
    popularUseCasesAr: [
      { title: 'Tourism tech', description: 'سياحة جديدة.' },
      { title: 'Logistics', description: 'بوابة المحيط الهندي.' },
    ],
    localResources: [{ name: 'Riyada', description: 'هيئة تنمية المنشآت.' }],
    successStories: [{ name: 'Akhdar', achievement: 'منصة كتب رقمية' }],
    keywords: ['ستارت أب عُمان', 'muscat startup'],
  },
  {
    slug: 'algiers',
    cityAr: 'الجزائر',
    cityEn: 'Algiers',
    countryAr: 'الجزائر',
    countryEn: 'Algeria',
    metaDescriptionAr: 'الجزائر سوق ضخم 45M ساكن. Underserved للستارت أبس.',
    heroIntroAr: 'الجزائر سوق بكر. 45M ساكن، penetration رقمي ينمو. الفرص للـ first movers.',
    ecosystemFactsAr: [
      '150+ startup',
      'سوق 45M',
      'Mobile penetration نمو',
      'Government digitization',
    ],
    topVCs: ['Algeria Venture'],
    popularUseCasesAr: [
      { title: 'E-commerce', description: 'سوق بكر.' },
      { title: 'Fintech', description: 'Underbanked.' },
    ],
    localResources: [{ name: 'AlgeriaVenture', description: 'صندوق حكومي.' }],
    successStories: [{ name: 'Yassir', achievement: '$150M Series B' }],
    keywords: ['ستارت أب الجزائر', 'algeria startup'],
  },
  {
    slug: 'baghdad',
    cityAr: 'بغداد',
    cityEn: 'Baghdad',
    countryAr: 'العراق',
    countryEn: 'Iraq',
    metaDescriptionAr: 'العراق سوق underserved، 40M ساكن، digital adoption سريع.',
    heroIntroAr: 'العراق يستيقظ. 40M ساكن، majority young، mobile-first. Tech opportunities ضخمة.',
    ecosystemFactsAr: [
      '50+ startup',
      'Mobile penetration > 90%',
      'Young population',
      'Untapped opportunities',
    ],
    topVCs: ['Iraq Tech Ventures'],
    popularUseCasesAr: [
      { title: 'Fintech', description: '85% unbanked.' },
      { title: 'Mobility', description: 'Ride-hailing growing.' },
    ],
    localResources: [{ name: 'The Station', description: 'أول coworking للستارت أبس.' }],
    successStories: [{ name: 'Baly', achievement: 'Top food delivery' }],
    keywords: ['ستارت أب العراق', 'baghdad startup', 'iraq tech'],
  },
  {
    slug: 'khartoum',
    cityAr: 'الخرطوم',
    cityEn: 'Khartoum',
    countryAr: 'السودان',
    countryEn: 'Sudan',
    metaDescriptionAr: 'السودان سوق ناشئ. Tech talent ممتاز رغم التحديات.',
    heroIntroAr: 'السودان رغم الـ challenges، ينتج talent تقني ممتاز. الـ diaspora فرصة.',
    ecosystemFactsAr: ['Engineering talent ممتاز', 'Diaspora 8M+', 'Mobile-first generation'],
    topVCs: [],
    popularUseCasesAr: [{ title: 'Diaspora products', description: 'لـ Sudanese خارج البلد.' }],
    localResources: [{ name: 'Impact Hub Khartoum', description: 'Coworking رئيسي.' }],
    successStories: [{ name: 'Bloom', achievement: 'Pre-seed $4.5M' }],
    keywords: ['ستارت أب السودان', 'khartoum startup'],
  },
];

export function getCityBySlug(slug: string): CityPage | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getAllCitySlugs(): string[] {
  return CITIES.map((c) => c.slug);
}
