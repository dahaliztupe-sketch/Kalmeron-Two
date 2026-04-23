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

50+ وكيل ذكي مدرب على بيانات السوق المصري والخليجي. كل وكيل يعرف خصوصية مجاله: الـ CFO يعرف معايير ضريبة القيمة المضافة المصرية، الحارس القانوني يفحص ضد قانون الشركات المصري، رادار الفرص يتابع جولات تمويل MENA.

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
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
