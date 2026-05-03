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
    const product = xss(String(body.product ?? '').slice(0, 2000));
    const model = xss(String(body.model ?? 'subscription').slice(0, 100));
    const segment = xss(String(body.segment ?? '').slice(0, 500));
    const currency = xss(String(body.currency ?? 'EGP').slice(0, 10));
    const competitors = xss(String(body.competitors ?? '').slice(0, 500));
    const cogs = xss(String(body.cogs ?? '').slice(0, 300));

    if (!product.trim()) {
      return NextResponse.json({ error: 'product description required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      maxOutputTokens: 4096,
      system: `أنت "مستشار التسعير الاستراتيجي" في منصة كلميرون — متخصص في بناء استراتيجيات تسعير للشركات الناشئة المصرية والعربية.

تعتمد على:
- Value-Based Pricing (التسعير القائم على القيمة)
- Competitive Analysis
- Egyptian/Arab market psychology (السيكولوجية السعرية المحلية)
- SaaS & Product pricing best practices

مبدأك: السعر الصح هو السعر الذي يعكس القيمة ويتحمّله السوق ويُولّد أرباحاً.`,

      prompt: `بنِ استراتيجية تسعير متكاملة:

المنتج/الخدمة: ${product}
نموذج التسعير المُفضَّل: ${model}
الشريحة المستهدفة: ${segment || 'غير محددة'}
العملة: ${currency}
أسعار المنافسين: ${competitors || 'غير متاحة'}
تكلفة الخدمة (COGS): ${cogs || 'غير محددة'}

أنشئ استراتيجية تسعير تشمل:

## ⚖️ مقارنة مناهج التسعير الثلاثة
قيّم كل منهج بوضوح لهذا المنتج تحديداً:

| المنهج | السعر المُقدَّر | المبرر | الملاءمة لهذا المنتج |
|--------|--------------|--------|----------------------|
| **Cost-Plus** (التكلفة + هامش ربح) | ... | COGS + X% | ✅/⚠️/❌ — السبب |
| **Value-Based** (القيمة المُدرَكة) | ... | ما يوفره على العميل | ✅/⚠️/❌ — السبب |
| **Competitive** (محاذاة المنافسين) | ... | بناءً على السوق | ✅/⚠️/❌ — السبب |

**المنهج الموصى به:** اذكر أيها أنسب ولماذا.

## 💰 السعر الموصى به
(رقم واضح أو نطاق — مبني على المنهج الموصى به)

## 📦 هيكل الخطط المقترح
(إذا كان Tiered/Freemium — حدّد كل خطة بمحتواها وسعرها)

## 🧠 سيكولوجية التسعير
(تقنيات Pricing Psychology المناسبة للسوق العربي)

## 📈 مسار رفع الأسعار
(كيف ترفع السعر مع نمو المنتج؟)

## ⚠️ الأخطاء الشائعة في تسعير هذا النوع من المنتجات
(في السوق المصري تحديداً)

## 🔢 هامش الربح المتوقع
(تقدير مبني على COGS إذا كانت متاحة)

## 💡 توصية نهائية
(جملة واحدة — ما أهم شيء يجب تذكّره؟)`,
    });

    return NextResponse.json({ result: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
