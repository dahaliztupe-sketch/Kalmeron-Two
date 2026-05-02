/**
 * POST /api/sales-coach
 * Sales scripts, objection handling, pipeline management, closing techniques
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
  script: (d) => `اكتب سكريبت مبيعات احترافي:

المنتج: ${d.product}
نوع المنتج: ${d.productType}
نطاق السعر: ${d.priceRange || 'غير محدد'}
العميل المستهدف: ${d.targetCustomer || 'غير محدد'}

اكتب سكريبت مبيعات للسوق المصري:

## 📞 سكريبت المكالمة الباردة (Cold Call)
**الافتتاح (15 ثانية):**
"السلام عليكم، أنا [الاسم] من [الشركة]..."

**تحديد الألم:**
(3 أسئلة تكشف احتياج العميل)

**العرض:**
(جملة مزايا موجزة ومقنعة)

**الاستجواب (Discovery Questions):**
(5 أسئلة لفهم الوضع)

**الخطوة التالية:**
(CTA واضح — اجتماع، ديمو، عرض)

## 💬 سكريبت WhatsApp / الرسائل
(نسخة مكثّفة مناسبة للمحادثة النصية)

## 📧 سكريبت Demo / الاجتماع التعريفي
(هيكل اجتماع 30 دقيقة)

## 💡 نصائح خاصة بالسوق المصري
(ما يجب قوله وما يجب تجنبه)
`,

  objections: (d) => `اكتب ردوداً ذكية على الاعتراضات:

المنتج: ${d.product}
نوع المنتج: ${d.productType}
نطاق السعر: ${d.priceRange || 'غير محدد'}
أكبر اعتراض: ${d.challenge || 'السعر مرتفع'}

أنشئ دليل التغلب على الاعتراضات:

## 💰 "السعر غالي / مش في الميزانية"
**الرد:** ...
**التقنية:** Feel-Felt-Found / إعادة تأطير القيمة

## ⏰ "مش وقته دلوقتي / هفكر فيها"
**الرد:** ...
**التقنية:** خلق urgency حقيقية

## 🤔 "محتاج أفكر / أتشاور مع شريكي"
**الرد:** ...
**التقنية:** كشف صاحب القرار الحقيقي

## 🏆 "عندنا حل تاني / المنافس أرخص"
**الرد:** ...
**التقنية:** مقارنة القيمة لا السعر

## 😐 "مش مقتنع إن ده هيحل مشكلتي"
**الرد:** ...
**التقنية:** Social proof + Proof of Concept

## 🇪🇬 اعتراضات خاصة بالسوق المصري
(اعتراضات ثقافية أو محلية وكيفية التعامل معها)

## 📊 جدول الاعتراضات الشامل
| الاعتراض | الرد المقترح | التقنية |
`,

  pipeline: (d) => `صمّم منهجية إدارة Pipeline:

المنتج: ${d.product}
نوع المنتج: ${d.productType}
نطاق السعر: ${d.priceRange || 'غير محدد'}
العميل المستهدف: ${d.targetCustomer || 'غير محدد'}

أنشئ منهجية Pipeline للسوق المصري:

## 🔄 مراحل دورة المبيعات
| المرحلة | المعايير | الإجراءات | الزمن المتوقع |
|---------|---------|----------|--------------|
| Prospect | | | |
| Qualified Lead | | | |
| Demo/Meeting | | | |
| Proposal | | | |
| Negotiation | | | |
| Closed Won/Lost | | | |

## 📊 Qualification Framework
(BANT أو MEDDIC مُعدَّل للسوق المصري)

## 🎯 Lead Scoring
(كيف تُرتّب العملاء المحتملين حسب الأولوية؟)

## 📱 CRM بسيط بدون تكلفة
(كيف تُدير Pipeline بـ Excel أو Notion)

## ⏰ Cadence المتابعة
(جدول التواصل المثالي في كل مرحلة)

## 📈 مقاييس Pipeline الأساسية
(Win Rate، Cycle Length، Average Deal Size)
`,

  closing: (d) => `علّمني تقنيات إغلاق الصفقات:

المنتج: ${d.product}
نوع المنتج: ${d.productType}
نطاق السعر: ${d.priceRange || 'غير محدد'}
أكبر تحدي: ${d.challenge || 'العميل يتردد في آخر لحظة'}

أنشئ دليل إغلاق الصفقات للسوق المصري:

## 🔑 إشارات الشراء (Buying Signals)
(علامات تدل على أن العميل مستعد للشراء)

## ✅ تقنيات الإغلاق الفعّالة في مصر
**1. Assumptive Close:**
"طيب، نبدأ من إمتى؟"

**2. Alternative Close:**
"تفضل الباقة الأساسية ولا المتكاملة؟"

**3. Summary Close:**
(تلخيص كل ما اتفقنا عليه)

**4. Trial Close:**
(اختبار جاهزية العميل)

**5. Urgency Close:**
(خلق urgency حقيقية وأخلاقية)

## 🚫 أخطاء الإغلاق الشائعة في السوق المصري

## 📋 خطوات ما بعد الإغلاق
(Onboarding، referral request، upsell)

## 💬 جمل إغلاق جاهزة للاستخدام
`,
};

export async function POST(request: NextRequest) {
  const { userId, isGuest } = await softAuth(request);
  const rl = rateLimit(request, {
    limit: isGuest ? 3 : 20,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = (body.mode as string) || 'script';
    if (!Object.keys(MODE_PROMPTS).includes(mode)) {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
    }

    const d = {
      product: xss(String(body.product ?? '').slice(0, 2000)),
      productType: xss(String(body.productType ?? 'أخرى').slice(0, 100)),
      priceRange: xss(String(body.priceRange ?? '').slice(0, 100)),
      targetCustomer: xss(String(body.targetCustomer ?? '').slice(0, 300)),
      challenge: xss(String(body.challenge ?? '').slice(0, 300)),
    };

    if (!d.product.trim()) {
      return NextResponse.json({ error: 'product description required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      system: `أنت "مدرّب المبيعات الذكي" في منصة كلميرون — خبير B2B وB2C بخبرة واسعة في السوق المصري.

تفهم جيداً: طريقة التفكير والتفاوض المصري، الحواجز الثقافية في البيع، وكيف تبني ثقة العميل المحلي.

أسلوبك: عملي تماماً — سكريبتات جاهزة للاستخدام الفوري، لا نظريات فارغة.`,
      prompt: MODE_PROMPTS[mode](d),
    });

    return NextResponse.json({ result: text, mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
