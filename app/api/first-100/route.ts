/**
 * POST /api/first-100
 * Generates a "First 100 Customers" strategy for Egyptian startups.
 * Uses Gemini 2.5 Flash to produce a practical, actionable playbook.
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
    const segment = xss(String(body.segment ?? '').slice(0, 500));
    const channel = xss(String(body.channel ?? '').slice(0, 300));
    const stage = xss(String(body.stage ?? 'pre-product').slice(0, 100));
    const budget = xss(String(body.budget ?? '').slice(0, 200));

    if (!product.trim()) {
      return NextResponse.json({ error: 'product description required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      system: `أنت "استراتيجي النمو الأول" في منصة كلميرون — متخصص في مساعدة الشركات الناشئة المصرية والعربية على اكتساب أول 100 عميل بدون ميزانية تسويق ضخمة.

خبرتك تشمل: Growth Hacking، Lean Startup، Mom Test، Community-Led Growth، الأسواق الناشئة.
أسلوبك: عملي جداً، بخطوات قابلة للتنفيذ اليوم لا الشهر القادم.`,

      prompt: `ساعدني في بناء استراتيجية اكتساب أول 100 عميل:

المنتج/الخدمة: ${product}
الشريحة المستهدفة: ${segment || 'غير محددة'}
القناة المفضّلة: ${channel || 'مفتوحة'}
المرحلة الحالية: ${stage}
الميزانية المتاحة: ${budget || 'محدودة جداً'}

أنشئ خطة تفصيلية تشمل:

## 🎯 الشريحة الأولى المثالية
(من هو عميلك الأول المثالي — كن محدداً جداً)

## 📞 الـ 10 أيام الأولى: الخطة اليومية
(ماذا تفعل كل يوم لتجد أول 10 عملاء)

## 🔑 القنوات الأكثر فعالية لهذا المنتج في السوق المصري
(مرتّبة بالأولوية مع سبب الاختيار)

## 💬 Script المحادثة الأولى
(ماذا تقول عند الاتصال أو الاجتماع الأول؟)

## 🎁 العرض الأولي الذي لا يُرفَض
(كيف تصيغ عرضك الأول للعملاء الأوائل؟)

## 📊 المقاييس التي تتبعها يومياً

## ⚠️ الأخطاء الشائعة التي يقع فيها المؤسسون في مرحلة الـ 100 عميل الأولى`,
    });

    return NextResponse.json({ result: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
