/**
 * Blog content seed — initial posts for SEO + thought leadership.
 * Pages: /blog and /blog/[slug]
 */

export interface BlogPost {
  slug: string;
  titleAr: string;
  excerptAr: string;
  metaDescriptionAr: string;
  authorName: string;
  publishedAt: string; // ISO
  readingTimeMinutes: number;
  category: string;
  keywords: string[];
  contentAr: string; // Markdown-style content
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'why-arab-founders-need-specialized-ai',
    titleAr: 'لماذا يحتاج رواد الأعمال العرب إلى AI متخصص؟',
    excerptAr:
      'ChatGPT أداة رائعة، لكنه لا يعرف فروقات السوق المصري ولا قانون 151 ولا تكاليف Talabat. هنا تأتي قيمة AI متخصص.',
    metaDescriptionAr:
      'تحليل عميق لماذا يحتاج رواد الأعمال العرب أدوات AI متخصصة في أسواقهم بدلاً من المساعدات العامة.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-04-15T09:00:00Z',
    readingTimeMinutes: 7,
    category: 'استراتيجية',
    keywords: ['AI عربي', 'رواد أعمال', 'سوق مصري', 'ChatGPT'],
    contentAr: `
## السياق المفقود

عندما تسأل ChatGPT عن "كيف أؤسس شركة في مصر؟"، يعطيك إجابة أكاديمية: سجل تجاري، رأس مال، شريك، إلخ. لكنه لا يعرف:

- أن **مكتب التنمية الصناعية (IDA)** أسرع من السجل التجاري للشركات الصناعية الصغيرة
- أن **هيئة الاستثمار** لها fast-track لشركات التكنولوجيا
- أن **مكتب محاماة في القاهرة الجديدة** يكلف 50% أقل من نفس الجودة في وسط البلد
- أن **مصاريف Talabat** 25% بدلاً من 30% المعلنة لو تفاوضت

هذه التفاصيل التي تصنع الفرق بين 6 أشهر تعطيلاً و3 أسابيع إطلاقاً.

## ثلاث طبقات يفتقدها AI العام

### 1. السياق التنظيمي
كل دولة لها قوانينها. القانون 151 المصري للحماية البيانات يختلف عن GDPR في 12 نقطة جوهرية. AI عام يخلطهم.

### 2. السياق الاقتصادي
متوسط راتب developer في مصر، تكلفة Server في القاهرة، شركات الشحن وتعرفتها — هذه بيانات تتغير شهرياً ولا تتوفر في تدريب نموذج عالمي.

### 3. السياق الثقافي
كيف تكتب pitch لمستثمر سعودي يختلف عن بريطاني. AI متخصص يعرف هذه الفروقات الدقيقة.

## ماذا يقدم كلميرون

٥٧ مساعداً ذكياً عبر ٧ أقسام، مدرَّبون على بيانات السوق المصري والخليجي. كل مساعد يعرف خصوصية مجاله: الـ CFO يعرف معايير ضريبة القيمة المضافة المصرية، الحارس القانوني يفحص ضد قانون الشركات المصري، رادار الفرص يتابع جولات تمويل MENA.

## النتيجة

بدلاً من قضاء أسابيع في البحث، تحصل على إجابات مدققة في دقائق. هذا الفرق بين ستارت أب يتعطل وستارت أب يطلق.

ابدأ مجاناً اليوم.
    `,
  },
  {
    slug: 'how-to-validate-business-idea-30-days',
    titleAr: 'كيف تتحقق من فكرة عملك في 30 يوم؟',
    excerptAr: 'منهجية مدروسة من 5 خطوات لتحقق علمي قبل أن تنفق جنيهاً واحداً على بناء المنتج.',
    metaDescriptionAr: 'دليل تفصيلي للتحقق من فكرة عملك في 30 يوم. خطوات عملية بدون مال أو فريق.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-04-10T09:00:00Z',
    readingTimeMinutes: 10,
    category: 'تحقق',
    keywords: ['validate business idea', 'تحقق من فكرة', 'product market fit'],
    contentAr: `
دراسة CB Insights المشهورة: 42% من الستارت أبس تفشل لـ "no market need". أكبر سبب وحيد للفشل.

## الخطوات الخمس

### الأسبوع 1: تحديد الـ Hypothesis
اكتب فكرتك في جملة واحدة: "أريد بناء [X] لـ [Y] لكي يحلوا [Z]". هذه الـ hypothesis اللي ستختبرها.

### الأسبوع 2: مقابلات العملاء
20 مقابلة مع جمهورك المستهدف. ليس "هل تشتري؟" بل "اشرح لي مشكلتك".

### الأسبوع 3: Smoke Test
صفحة هبوط بسيطة + إعلان Meta بـ $50. كم نسبة الـ click-through؟ كم تركوا email؟

### الأسبوع 4: Pre-sales أو No-Code MVP
حاول بيع المنتج قبل بنائه. لو دفعوا، الفكرة validated. لو لا، رتب الـ pivot.

## الأخطاء القاتلة

- ❌ سؤال الأهل والأصدقاء (سيقولون نعم بدافع المجاملة)
- ❌ تصديق "fake nodding" في المقابلات
- ❌ بناء قبل أن يدفع أحد

## كيف يساعدك كلميرون

وكيل **Idea Validator** يبني لك أسئلة المقابلة، **Synthetic Customer Lab** يختبر pitch قبل التحدث مع البشر، و**Mistake Shield** يحذرك من 50 خطأ شائع.

ابدأ التحقق من فكرتك اليوم.
    `,
  },
  {
    slug: 'pricing-mistakes-arab-startups-make',
    titleAr: '7 أخطاء قاتلة في التسعير ترتكبها الستارت أبس العربية',
    excerptAr: 'التسعير علم وفن. هذه أكثر الأخطاء التي تخسر بها المال بدون أن تشعر.',
    metaDescriptionAr: '7 أخطاء شائعة في تسعير المنتجات والخدمات للستارت أبس العربية، وكيفية تجنبها.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-04-05T09:00:00Z',
    readingTimeMinutes: 8,
    category: 'تسعير',
    keywords: ['pricing strategy', 'تسعير', 'SaaS pricing', 'startup pricing'],
    contentAr: `
دراسة McKinsey: تحسين التسعير 1% يرفع الأرباح 8%. أكبر leverage في شركتك.

## الأخطاء الـ 7

### 1. التسعير بناءً على التكلفة
الخطأ الأشهر: cost + markup. الصحيح: value-based pricing.

### 2. خطة واحدة فقط
الـ tiered pricing يرفع الإيراد 30% غالباً. ابني 3-4 خطط.

### 3. عدم وجود anchor
عندما تعرض خطة Premium بـ $500 بجانب Pro بـ $50، الـ Pro يبدو "صفقة".

### 4. خصم سنوي ضعيف
17% خصم لا يكفي. الـ standard هو 20-33%.

### 5. عدم اختبار الزيادات
ارفع السعر 20% كل سنة على الأقل لمستخدمين جدد.

### 6. عدم الـ usage-based pricing
إذا قيمتك تتزايد مع الاستخدام، اربط السعر بالاستخدام.

### 7. الخوف من رفع السعر
الـ price-takers يفلسون. الـ price-makers يربحون.

## كيف يساعدك كلميرون

وكيل **CFO** يبني لك نموذج تسعير مدروس بناءً على بيانات منافسيك في السوق العربي. يحلل LTV:CAC، يقترح خطط، ويختبر A/B لك.

ابني استراتيجية تسعير ذكية اليوم.
    `,
  },
  {
    slug: 'find-product-market-fit-arab-market',
    titleAr: 'كيف تجد Product-Market Fit في السوق العربي',
    excerptAr: 'PMF ليست لحظة، بل عملية. منهجية مدروسة لاكتشافها بسرعة.',
    metaDescriptionAr: 'دليل عملي لاكتشاف Product-Market Fit في السوق العربي بأقل تكلفة وأسرع وقت.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-04-12T10:00:00Z',
    readingTimeMinutes: 9,
    category: 'منتج',
    keywords: ['PMF', 'product market fit', 'سوق عربي', 'validation'],
    contentAr: `## ما هو PMF حقاً؟\n\nPMF ليس "لما الناس تحب منتجك". هو "لما الناس تكون مستعدة تدفع، تستخدم بشكل متكرر، وتقترحه لأصدقائها بدون سؤال".\n\n## 5 إشارات لـ PMF\n\n1. **NPS > 40**: العملاء يقترحون منتجك\n2. **Sean Ellis Test > 40%**: "كم ستحزن لو اختفى المنتج؟" 40%+ "very disappointed"\n3. **Organic growth ≥ 20%**: نمو بدون إعلانات\n4. **D30 retention > 25%**: المستخدمون يعودون\n5. **Negative churn**: المستخدمون يدفعون أكثر مع الوقت\n\n## الفروقات في السوق العربي\n\n- **Trust أساسي**: عرّف مؤسسك بوضوح\n- **WhatsApp > Email**: قنوات تواصل مختلفة\n- **العامية مهمة**: استخدمها في الـ marketing\n- **Cash on delivery لا يموت**: ادعمه\n\n## كيف يساعد كلميرون\n\nوكيل **Idea Validator** يبني لك framework لقياس PMF شهرياً مع تنبيهات.`,
  },
  {
    slug: 'how-to-hire-cofounder',
    titleAr: 'كيف تجد Co-founder الصح',
    excerptAr: 'اختيار co-founder أهم قرار في حياة الستارت أب. منهجية لاختيار صح.',
    metaDescriptionAr: 'دليل اختيار co-founder ناجح: المهارات، الـ chemistry، والتوقعات. مع نموذج اتفاقية.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-04-08T08:00:00Z',
    readingTimeMinutes: 8,
    category: 'فريق',
    keywords: ['co-founder', 'شريك', 'startup team'],
    contentAr: `## لماذا 65% من الستارت أبس تموت بسبب co-founder dispute؟\n\nاختيار شريك مؤسس أهم من اختيار زوجة. ستقضي معه ساعات أكثر من عائلتك.\n\n## معايير الاختيار\n\n1. **Complementary skills**: hustler + hacker، أو dreamer + executor\n2. **Aligned values**: ماذا تعنيله النجاح؟ المال أم الـ impact؟\n3. **Conflict style**: كيف يتعامل مع الضغط؟\n4. **Financial situation**: قادر يعيش بدون راتب 12 شهر؟\n5. **Long-term vision**: نفس الأفق الزمني؟\n\n## الـ Vesting الإجباري\n\n4-year vesting مع 1-year cliff. لا استثناءات. حتى لك أنت.\n\n## كيف يساعد كلميرون\n\n**Founder Network** يطابقك مع co-founders محتملين بناءً على skills وstage. مع نماذج عقود قانونية مصرية.`,
  },
  {
    slug: 'arabic-seo-startup-playbook',
    titleAr: 'دليل SEO العربي للستارت أبس في 2026',
    excerptAr: 'لماذا 90% من الـ SEO content العربي رديء، وكيف تتفوق عليه.',
    metaDescriptionAr: 'استراتيجية SEO عربية متكاملة: keyword research، content structure، technical SEO، وlink building.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-04-05T09:00:00Z',
    readingTimeMinutes: 12,
    category: 'تسويق',
    keywords: ['SEO عربي', 'arabic SEO', 'organic traffic', 'content marketing'],
    contentAr: `## لماذا SEO عربي مختلف؟\n\n- **Keywords أقل تشبعاً**: فرصة ذهبية\n- **Content quality متدنية**: سهل التفوق\n- **Backlinks نادرة**: link building أصعب لكن أقوى\n- **RTL technical issues**: شيء يتجاهله الجميع\n\n## استراتيجية 90 يوم\n\n### الشهر 1: Foundation\n- Keyword research عميق (Ahrefs/SEMrush)\n- Content audit للموجود\n- Technical SEO fixes\n\n### الشهر 2: Production\n- 30 مقالة عالية الجودة\n- Internal linking strategy\n- Schema.org markup\n\n### الشهر 3: Distribution\n- Outreach للـ backlinks\n- Social distribution\n- Email newsletter\n\n## كيف يساعد كلميرون\n\nوكيل **Marketing Orchestrator** يبني content plan كامل ويكتب أول 30 مقالة.`,
  },
  {
    slug: 'startup-financial-model-template',
    titleAr: 'نموذج مالي للستارت أب: كل ما تحتاجه',
    excerptAr: 'نموذج Excel مالي بمعايير VCs، مع شرح كل assumption.',
    metaDescriptionAr: 'دليل بناء نموذج مالي لستارت أب يقنع المستثمرين: revenue model، cost structure، scenarios.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-04-01T10:00:00Z',
    readingTimeMinutes: 11,
    category: 'مالية',
    keywords: ['financial model', 'نموذج مالي', 'startup finance', 'excel'],
    contentAr: `## أكثر 5 أخطاء في نماذج الستارت أبس\n\n1. **Hockey stick غير معقول**: 0 → $10M في 18 شهر؟ لن يصدقه أحد\n2. **Cost assumptions ساذجة**: نسيت taxes، benefits، tools\n3. **No sensitivity analysis**: ماذا لو churn ارتفع 5%؟\n4. **Top-down بدلاً من bottoms-up**: TAM × 1% ≠ revenue\n5. **No 13-week cash flow**: أهم أداة لـ founder\n\n## مكونات النموذج الصحيح\n\n- Revenue model (per segment)\n- Unit economics\n- Cohort retention\n- COGS detail\n- Operating expenses\n- Hiring plan\n- Cash flow statement\n- 3 scenarios (base/up/down)\n\n## كيف يساعد كلميرون\n\nوكيل **CFO** يبني النموذج كاملاً بناءً على فكرتك. قابل للتعديل في Excel.`,
  },
  {
    slug: 'rest-of-arab-world-not-just-egypt',
    titleAr: 'تجاهل بقية العالم العربي = خسارة 70% من السوق',
    excerptAr: 'لماذا التركيز على مصر فقط فخ، وكيف توسع للخليج وشمال أفريقيا.',
    metaDescriptionAr: 'استراتيجية التوسع من السوق المصري إلى MENA كاملة: السعودية، الإمارات، المغرب.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-03-28T11:00:00Z',
    readingTimeMinutes: 10,
    category: 'استراتيجية',
    keywords: ['expansion', 'MENA', 'GCC', 'arab world'],
    contentAr: `## أرقام لازم تعرفها\n\n- **مصر**: 110M، GDP per capita $4K\n- **السعودية**: 36M، GDP per capita $30K (7×)\n- **الإمارات**: 10M، GDP per capita $52K (13×)\n- **الكويت**: 4.5M، GDP per capita $35K\n\nقيمة العميل السعودي ≈ 7× المصري. الإماراتي 13×.\n\n## استراتيجية التوسع\n\n### مرحلة 1 (مصر): Validate\n- 0-1000 عميل\n- Iteration على المنتج\n- Unit economics واضحة\n\n### مرحلة 2 (السعودية): Premium\n- ادخل بسعر 2-3× المصري\n- شراكة مع saudi entity\n- توطين جدي (لهجة، imagery)\n\n### مرحلة 3 (الإمارات): Scale\n- Free zone setup\n- Enterprise sales\n- Regional HQ\n\n## كيف يساعد كلميرون\n\nوكلاء **Legal** و **Marketing** يخططون التوسع لكل سوق بـ playbook مفصل.`,
  },
  {
    slug: 'avoid-these-fundraising-mistakes',
    titleAr: '7 أخطاء قاتلة في جمع التمويل في 2026',
    excerptAr: 'حماقات تكلفك مليوناً قبل ما تبدأ.',
    metaDescriptionAr: 'الأخطاء الـ 7 الأكثر شيوعاً في fundraising وكيف تتجنبها. مع أمثلة من المنطقة.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-03-25T09:00:00Z',
    readingTimeMinutes: 9,
    category: 'تمويل',
    keywords: ['fundraising', 'تمويل', 'VC mistakes', 'pitch'],
    contentAr: `## الـ 7 أخطاء\n\n### 1. Raising too early\nبدون traction، عرضك ضعيف. Bootstrap حتى $100K ARR على الأقل.\n\n### 2. Wrong VCs\nVC للـ B2C ≠ VC للـ B2B. Match thesis dakhel.\n\n### 3. Bad pitch deck\n12 شريحة. لا 50. Each slide one idea.\n\n### 4. Weak Data Room\nاستعد قبل ما تبدأ. كل document منظم.\n\n### 5. Negotiating من ضعف\nDon't show desperation. Have alternatives.\n\n### 6. Bad term sheet\nUnderstand every clause. Anti-dilution، liquidation، control.\n\n### 7. No follow-up\n80% من المستثمرين ينسوك. Persistent follow-up.\n\n## كيف يساعد كلميرون\n\nوكلاء **CFO** و **Plan Builder** يجهزونك من A إلى Z قبل الـ outreach.`,
  },
  {
    slug: 'what-vcs-look-for-in-2026',
    titleAr: 'ماذا يبحث عنه VCs في 2026؟',
    excerptAr: 'بعد crash 2022-2024، تغيرت معايير VCs بشكل عميق.',
    metaDescriptionAr: 'تحليل لما يهم VCs في 2026: profitability، capital efficiency، AI moat. مع أمثلة.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-03-22T10:30:00Z',
    readingTimeMinutes: 8,
    category: 'تمويل',
    keywords: ['VC trends', 'fundraising 2026', 'venture capital'],
    contentAr: `## التحول الكبير\n\n2021: Growth at all costs\n2026: Profitable growth\n\n## ما يهم الآن\n\n1. **Capital efficiency**: $1M revenue per $1M raised\n2. **Path to profitability**: واضح في 24 شهر\n3. **Founder-market fit**: ليه أنت؟\n4. **AI advantage**: ليس مجرد wrapper على ChatGPT\n5. **Distribution moat**: قنوات لا يستطيع المنافسون نسخها\n\n## ما لم يعد يكفي\n\n- Hockey stick projections\n- "AI" as buzzword\n- Markets كبيرة بدون wedge واضح\n\n## كيف تستجيب\n\nاضبط pitch deckك حول capital efficiency و defensibility. كلميرون يساعد.`,
  },
  {
    slug: 'building-defensible-startup',
    titleAr: 'كيف تبني Moat حول startupك',
    excerptAr: 'بدون moat، أي منافس يقتلك في 6 شهور.',
    metaDescriptionAr: 'الـ 5 أنواع moats للستارت أبس وكيف تبني واحد لشركتك.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-03-18T11:00:00Z',
    readingTimeMinutes: 11,
    category: 'استراتيجية',
    keywords: ['moat', 'defensibility', 'competitive advantage', 'strategy'],
    contentAr: `## أنواع الـ Moats الـ 5\n\n### 1. Network Effects\nWhatsApp، LinkedIn. كل مستخدم جديد يزيد القيمة للجميع.\n\n### 2. Data Advantages\nGoogle، Netflix. كل تفاعل يحسن المنتج.\n\n### 3. Switching Costs\nSalesforce، QuickBooks. تغيير المنتج مكلف.\n\n### 4. Brand\nApple، Nike. الناس تدفع premium بسبب الـ brand.\n\n### 5. Scale Economies\nAmazon، Uber. كلما كبرت، انخفضت تكاليفك.\n\n## كيف تبني moat تدريجياً\n\nالشهر 1-12: Get to PMF\nالسنة 2: Build network effects\nالسنة 3: Lock-in customers\nالسنة 4: Brand investment\n\n## كيف يساعد كلميرون\n\nوكيل **Plan Builder** يحلل شركتك ويقترح moats مناسبة.`,
  },
  {
    slug: 'kalmeron-vs-traditional-consulting',
    titleAr: 'كلميرون vs استشاري تقليدي: مقارنة صادقة',
    excerptAr: 'متى تستخدم كلميرون ومتى تحتاج بشري؟',
    metaDescriptionAr: 'تحليل لمتى يكفي AI ومتى تحتاج consultant بشري. مع costs وtimelines.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-03-15T08:00:00Z',
    readingTimeMinutes: 7,
    category: 'تحليل',
    keywords: ['AI consulting', 'business consultant', 'consulting cost'],
    contentAr: `## التكلفة\n\n- **Big 4 (McKinsey, BCG)**: $300K-$2M/مشروع\n- **Local consultant**: $50K-$200K\n- **Boutique**: $30K-$100K\n- **كلميرون**: $19-$99/شهر\n\n## متى تستخدم كلميرون\n\n- استراتيجية يومية\n- تحليلات سريعة\n- نماذج مالية\n- Templates قانونية\n- Marketing plans\n\n## متى تحتاج بشري\n\n- M&A معقدة\n- Crisis management\n- Industry-specific deep expertise\n- Board-level strategy\n\n## الـ Hybrid Model\n\nاستخدم كلميرون للـ 80%. Bring consultant للـ 20% الحرجة. وفر 90%.`,
  },
  {
    slug: 'data-driven-startup-culture',
    titleAr: 'كيف تبني ثقافة Data-Driven في الستارت أب',
    excerptAr: 'القرارات بالـ gut feeling تنفع في الـ 0-1. بعدها تحتاج بيانات.',
    metaDescriptionAr: 'بناء data culture: tools، metrics، rituals، وdecision frameworks.',
    authorName: 'فريق كلميرون',
    publishedAt: '2026-03-10T10:00:00Z',
    readingTimeMinutes: 10,
    category: 'عمليات',
    keywords: ['data driven', 'analytics', 'metrics', 'KPIs'],
    contentAr: `## الـ Stack الأساسي\n\n- **Product analytics**: Mixpanel أو Amplitude\n- **Web analytics**: GA4\n- **CRM**: HubSpot أو Salesforce\n- **BI**: Metabase أو Looker\n- **Warehouse**: BigQuery أو Snowflake\n\n## North Star Metric\n\nمقياس واحد يلخص نجاح الشركة. مثل:\n- Spotify: time spent listening\n- Airbnb: nights booked\n- Slack: messages sent\n\n## Weekly Rituals\n\n- Monday: KPI review\n- Wednesday: experiments review\n- Friday: cohort analysis\n\n## كيف يساعد كلميرون\n\nوكيل **Plan Builder** يحدد لك North Star ويبني dashboards.`,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
