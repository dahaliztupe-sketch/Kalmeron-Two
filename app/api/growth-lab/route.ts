import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import xss from 'xss';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

async function softAuth(req: NextRequest): Promise<{ userId: string; isGuest: boolean }> {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
      return { userId: dec.uid, isGuest: false };
    } catch { /* fall through */ }
  }
  return { userId: 'guest', isGuest: true };
}

const MODE_PROMPTS: Record<string, (d: Record<string, string>) => string> = {
  experiment: (d) => `أنت Growth Scientist متخصص في تصميم تجارب نمو قابلة للقياس للشركات الناشئة.

فكرة التجربة: ${d.experimentIdea}
${d.product ? `المنتج/الخدمة: ${d.product}` : ''}
${d.stage ? `مرحلة الشركة: ${d.stage}` : ''}
${d.currentMetrics ? `المقاييس الحالية: ${d.currentMetrics}` : ''}

صمّم تجربة نمو كاملة بالعربية:

## 🔬 الفرضية (Hypothesis)
صيغة واضحة: "نعتقد أن [الإجراء] سيؤدي إلى [النتيجة] لأن [المبرر]"

## 🎯 مؤشر النجاح الرئيسي (Primary KPI)
- المقياس المحدد:
- عتبة النجاح (Success Threshold): [القيمة التي تُعتبر فوزاً]
- المهلة الزمنية للقياس:

## 📋 خطة التنفيذ الأسبوعية
| الأسبوع | المهمة | المسؤول | التسليمات |
|---------|-------|---------|----------|
| 1 | ... | ... | ... |
| 2 | ... | ... | ... |
| 3 | ... | ... | ... |
| 4 | ... | ... | ... |

## ✅ متطلبات التجربة
- الحد الأدنى من العينة:
- متطلبات البنية التحتية:
- موارد الفريق المطلوبة:

## 🚦 معايير الإيقاف المبكر
متى تتوقف عن التجربة قبل اكتمالها؟

## 📊 كيف تحلل النتائج
خطوات القياس والتحليل بعد انتهاء التجربة.
`,
  strategy: (d) => `ابنِ استراتيجية نمو شاملة:

المنتج: ${d.product}
مرحلة النمو: ${d.stage}
الميزانية الشهرية: ${d.budget || 'محدودة'}
المقاييس الحالية: ${d.currentMetrics || 'غير متاحة'}
أكبر تحدي: ${d.challenge || 'غير محدد'}

أنشئ استراتيجية نمو مُخصَّصة للسوق المصري:

## 🚀 استراتيجية النمو المقترحة
(النهج الرئيسي المناسب لمرحلتك)

## 📊 Growth Framework المختار
(PLG / SLG / Community-Led / Channel-Led — مع مبرر)

## 🗓️ خطة الـ 90 يوم القادمة
| الأسبوع | الهدف | الإجراءات | المسؤول |

## 📈 المقاييس التي تتبعها (North Star + Supporting Metrics)

## 🔑 Growth Levers الأساسية
(٣-٥ محركات النمو الأهم لمرحلتك)

## 💡 Quick Wins يمكن تنفيذها هذا الأسبوع

## ⚠️ فخاخ النمو الشائعة في السوق المصري
`,

  channels: (d) => `حدّد أفضل قنوات الاكتساب:

المنتج: ${d.product}
مرحلة النمو: ${d.stage}
الميزانية: ${d.budget || 'محدودة'}
المقاييس الحالية: ${d.currentMetrics || 'غير متاحة'}

أنشئ تحليل قنوات الاكتساب:

## 🎯 أولوية القنوات للسوق المصري
| القناة | الأولوية | التكلفة | الزمن للنتيجة | الصعوبة |
|--------|---------|--------|--------------|---------|

## 📱 القنوات العضوية (Zero Budget)
(مرتّبة من الأعلى تأثيراً)

## 💰 القنوات المدفوعة (ROI-Optimized)
(مع ميزانية مقترحة ومقاييس قياس)

## 🤝 قنوات الشراكة والتوزيع
(Channel partnerships مناسبة للسوق المصري)

## 📧 Outreach Templates
(رسالة نموذجية للتواصل مع أول 10 عملاء)

## 📊 CAC المتوقع لكل قناة
`,

  retention: (d) => `ابنِ منظومة الاحتفاظ بالعملاء:

المنتج: ${d.product}
مرحلة النمو: ${d.stage}
المقاييس الحالية: ${d.currentMetrics || 'غير متاحة'}
أكبر تحدي: ${d.challenge || 'غير محدد'}

أنشئ استراتيجية Retention:

## 📊 تشخيص مشكلة الاحتفاظ
(أين يغادر العملاء؟ ولماذا؟)

## 🔄 Retention Loops المقترحة
(كيف تجعل استخدام منتجك عادة؟)

## 📅 خطة Onboarding مثالية
(الـ 7 أيام الأولى من تجربة العميل)

## 📧 تسلسل رسائل Lifecycle
(Activation → Engagement → Re-engagement)

## 🎁 برنامج الولاء المقترح
(مناسب للسوق المصري)

## 📈 مقاييس Retention التي تتبعها
(Day-7, Day-30, Month-3 Retention)

## ⚡ تكتيكات فورية لخفض Churn
(قابلة للتنفيذ هذا الأسبوع)
`,

  viral: (d) => `ابنِ Growth Loops فيروسية:

المنتج: ${d.product}
مرحلة النمو: ${d.stage}
الميزانية: ${d.budget || 'محدودة'}
المقاييس الحالية: ${d.currentMetrics || 'غير متاحة'}

أنشئ استراتيجية الانتشار الفيروسي:

## 🔁 Growth Loops المقترحة
(ارسم كل Loop بوضوح: Input → Action → Output → Back to Input)

## 💫 Viral Mechanics مناسبة للسوق العربي
(Referral / Social Sharing / Content / Product-led)

## 📤 برنامج Referral المقترح
(الحوافز، الميكانيزم، الأتمتة)

## 🌐 استراتيجية المحتوى الفيروسي
(أنواع المحتوى التي تنتشر في السوق المصري)

## 🔢 حساب Viral Coefficient (K-factor)
K = مشتركين جدد من كل مستخدم × معدل التحويل
الهدف: K > 1 للنمو الفيروسي

## 📊 مرحلة البناء: الـ 30 يوم الأولى
(كيف تبني الزخم الأولي؟)

## ⚠️ لماذا يفشل الانتشار الفيروسي؟
(الأخطاء الشائعة في السوق العربي)
`,
};

export async function POST(request: NextRequest) {
  const { userId, isGuest } = await softAuth(request);
  const rl = rateLimit(request, {
    limit: isGuest ? 3 : 15,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = (body.mode as string) || 'strategy';
    if (!Object.keys(MODE_PROMPTS).includes(mode)) {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
    }

    const d = {
      product: xss(String(body.product ?? '').slice(0, 2000)),
      stage: xss(String(body.stage ?? 'MVP').slice(0, 100)),
      currentMetrics: xss(String(body.currentMetrics ?? '').slice(0, 500)),
      budget: xss(String(body.budget ?? '').slice(0, 200)),
      challenge: xss(String(body.challenge ?? '').slice(0, 500)),
      experimentIdea: xss(String(body.experimentIdea ?? '').slice(0, 1000)),
    };

    if (mode === 'experiment' && !d.experimentIdea.trim()) {
      return NextResponse.json({ error: 'experiment idea required' }, { status: 400 });
    }
    if (mode !== 'experiment' && !d.product.trim()) {
      return NextResponse.json({ error: 'product description required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      maxOutputTokens: 4096,
      system: `أنت "خبير النمو" في منصة كلميرون — متخصص في Growth Hacking وبناء استراتيجيات نمو للشركات الناشئة في الأسواق الناشئة.

خلفيتك: عملت مع شركات B2B وB2C في السوق المصري والعربي. تفهم السلوك الاستهلاكي المحلي والقيود المالية للشركات الناشئة.

أسلوبك: عملي جداً، بأرقام واضحة وخطوات قابلة للتنفيذ الفوري.`,
      prompt: MODE_PROMPTS[mode](d),
    });

    return NextResponse.json({ result: text, mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
