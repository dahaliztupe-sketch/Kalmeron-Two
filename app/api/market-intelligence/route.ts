/**
 * POST /api/market-intelligence
 * Market analysis, trends, ICP, and market entry strategy for Egyptian startups.
 */
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
  market: (d) => `حلّل السوق بعمق:

المنتج/الخدمة: ${d.product}
القطاع: ${d.sector}
الجغرافيا: ${d.geography || 'مصر'}
الشريحة المستهدفة: ${d.targetSegment || 'غير محدد'}

أنشئ تحليل سوق شامل:

## 📊 حجم السوق (Market Sizing)
| المستوى | الحجم | المصدر/المنطق |
|---------|-------|--------------|
| TAM (السوق الإجمالي) | ... | |
| SAM (السوق القابل للخدمة) | ... | |
| SOM (الحصة المستهدفة سنة 1) | ... | |

## 📈 معدل نمو القطاع
(CAGR المتوقع + محركات النمو في السوق المصري)

## 🎯 شرائح السوق الرئيسية
(3-5 شرائح مرتّبة حسب الجاذبية)

## 💡 الفرص غير المستغَلة
(Gap Analysis في السوق المصري)

## ⚠️ تحديات السوق
(العقبات الهيكلية والثقافية)

## 🏆 خريطة المنافسين
| المنافس | الحصة السوقية | نقطة الضعف | فرصة التمايز |

## 🎯 التوصيات الاستراتيجية
(3 قرارات فورية بناءً على التحليل)
`,

  trends: (d) => `حدّد أبرز اتجاهات السوق:

المنتج/الخدمة: ${d.product}
القطاع: ${d.sector}
الجغرافيا: ${d.geography || 'مصر'}

أنشئ تحليل الاتجاهات:

## 🔥 الترندات الساخنة الآن (2025-2026)
(في قطاع ${d.sector} بالسوق المصري والعربي)

## 📱 تحولات سلوك المستهلك المصري
(ماذا تغيّر في كيفية الشراء والاستخدام؟)

## 🤖 تأثير الذكاء الاصطناعي على القطاع
(فرص + تهديدات)

## 🌍 الترندات العالمية القادمة للسوق المصري
(ما الذي سيصل خلال 12-24 شهر؟)

## 📉 الترندات المتراجعة
(ما الذي بدأ ينتهي؟)

## ⚡ فرص First-Mover
(من يدخل الآن يكسب ميزة تنافسية كبيرة)

## 🗓️ التوقيت المثالي للدخول
(هل الوقت مناسب الآن؟ أم انتظر؟)
`,

  customer: (d) => `ابنِ ملف العميل المثالي:

المنتج/الخدمة: ${d.product}
القطاع: ${d.sector}
الجغرافيا: ${d.geography || 'مصر'}
الشريحة المستهدفة: ${d.targetSegment || 'غير محدد'}

أنشئ ICP (Ideal Customer Profile) للسوق المصري:

## 👤 ملف العميل المثالي
**الديموغرافيا:**
(السن، الجنس، الموقع، المستوى التعليمي، الدخل)

**السيكوغرافيا:**
(القيم، الاهتمامات، أسلوب الحياة)

**السلوك الشرائي في السوق المصري:**
(كيف يبحث، أين يشتري، من يثق به)

## 😤 نقاط الألم (Pain Points)
(مرتّبة من الأشد إلحاحاً)

## 🎯 الدوافع الشرائية
(ما الذي يجعله يشتري اليوم وليس غداً؟)

## 🚫 موانع الشراء
(لماذا يتردد أو يرفض؟)

## 🗣️ صوت العميل (Voice of Customer)
(عبارات يستخدمها فعلاً عند وصف مشكلته)

## 📍 أين تجده؟
(القنوات، المجتمعات، الأماكن)

## 💬 رسالة تسويقية تُلامس ألمه
(جملة واحدة تجعله يقول "هذا بالضبط ما أحتاجه")
`,

  entry: (d) => `صمّم استراتيجية دخول السوق:

المنتج/الخدمة: ${d.product}
القطاع: ${d.sector}
الجغرافيا: ${d.geography || 'مصر'}
الشريحة المستهدفة: ${d.targetSegment || 'غير محدد'}

أنشئ استراتيجية دخول السوق:

## 🎯 نموذج الدخول المقترح
(Direct / Partnership / Freemium / Pilot / Niche-first — مع مبرر)

## 🏁 Beachhead Market
(أصغر شريحة يمكنك السيطرة عليها أولاً)

## 🗓️ خطة الإطلاق (90 يوم)
| الأسبوع | الهدف | الإجراءات | المقياس |

## 🤝 الشراكات الاستراتيجية المُسرِّعة
(من تتشارك معه ليُسرّع وصولك للعملاء؟)

## 💰 تكلفة دخول السوق المتوقعة
(Minimum Viable Budget للتحقق)

## ⚠️ المخاطر وخطط التخفيف
| المخاطرة | الاحتمال | الأثر | خطة B |

## ✅ مؤشرات نجاح مرحلة الدخول
(متى تعتبر دخولك للسوق ناجحاً؟)
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
    const mode = (body.mode as string) || 'market';
    if (!Object.keys(MODE_PROMPTS).includes(mode)) {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
    }

    const d = {
      product: xss(String(body.product ?? '').slice(0, 2000)),
      sector: xss(String(body.sector ?? 'أخرى').slice(0, 100)),
      geography: xss(String(body.geography ?? 'مصر').slice(0, 100)),
      targetSegment: xss(String(body.targetSegment ?? '').slice(0, 500)),
    };

    if (!d.product.trim()) {
      return NextResponse.json({ error: 'product description required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      system: `أنت "محلل السوق الاستراتيجي" في منصة كلميرون — خبير في تحليل الأسواق الناشئة، متخصص في السوق المصري والعربي.

تجمع بين المنهجية الأكاديمية والخبرة العملية في السوق المحلي. تُقدّم تحليلات واقعية مبنية على فهم عميق للديناميكيات المحلية.

أسلوبك: تحليلي ودقيق، تستخدم أرقاماً وبيانات واضحة مع توضيح مصادر التقدير.`,
      prompt: MODE_PROMPTS[mode](d),
    });

    return NextResponse.json({ result: text, mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
