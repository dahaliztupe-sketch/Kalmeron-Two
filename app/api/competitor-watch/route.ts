/**
 * POST /api/competitor-watch
 * Competitive intelligence: SWOT analysis, market gaps, positioning for Arab startups.
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { buildKey, hashInputs, withCache, TTL } from '@/src/lib/cache/firestore-cache';
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
  full: (d) => `أجرِ تحليلاً تنافسياً شاملاً:

الصناعة/القطاع: ${d.industry}
اسم الشركة/المنتج: ${d.companyName || 'غير محدد'}
المنافسون المعروفون: ${d.competitors || 'غير محدد'}
الشريحة المستهدفة: ${d.targetCustomer || 'غير محددة'}

اكتب تحليلاً تنافسياً احترافياً يشمل:

## 🗺️ خريطة السوق
قدّم نظرة عامة على المشهد التنافسي في القطاع.

## 🔍 تحليل المنافسين الرئيسيين
لكل منافس: نقاط القوة، نقاط الضعف، شريحة العملاء، استراتيجية التسعير.

## ⚔️ تحليل SWOT تنافسي
نقاط القوة، الضعف، الفرص، التهديدات — من منظور تنافسي.

## 🎯 الفجوات السوقية
ما الذي لا يقدمه المنافسون جيداً؟ أين الفراغ الحقيقي في السوق؟

## 💡 نقطة التميز المقترحة (Differentiation)
كيف تبني ميزة تنافسية مستدامة؟

## 📊 Positioning Map
أين تقع الشركات المختلفة في مصفوفة السعر × القيمة؟

## 🚀 توصيات استراتيجية
خطوات عملية للتميز والنمو في هذا السوق.`,

  gaps: (d) => `حلّل الفجوات السوقية في قطاع ${d.industry}:

المنافسون المعروفون: ${d.competitors || 'حلّل القطاع بشكل عام'}
الشريحة المستهدفة: ${d.targetCustomer || 'غير محددة'}

ركّز على:
## 🕳️ الفجوات الحقيقية في السوق
ما الذي يبحث عنه العملاء ولا يجدونه؟

## 😤 نقاط الألم غير المحلولة
ما أكثر شكاوى العملاء من المنافسين الحاليين؟

## 💰 فرص التسعير
هل هناك شريحة سعرية غير مخدومة؟

## 🌍 فجوات جغرافية
مناطق أو مدن غير مخدومة جيداً؟

## 🛒 فجوات في الخدمات/الميزات
ما الذي يتمنى العملاء وجوده ولا يجدونه؟

## 🎯 الفرصة الأمثل
ما الفجوة الأكثر واعداً للدخول إليها الآن؟`,

  positioning: (d) => `صمّم استراتيجية تمايز لشركة في قطاع ${d.industry}:

اسم الشركة/المنتج: ${d.companyName || 'شركتنا'}
المنافسون: ${d.competitors || 'المنافسون العامون في القطاع'}
شريحة العملاء المستهدفة: ${d.targetCustomer || 'غير محددة'}

قدّم:
## 🏆 Unique Value Proposition
جملة واحدة تشرح سبب اختيار العميل لك دون المنافسين.

## 📍 خريطة التموضع (Positioning)
كيف تُعرّف نفسك مقارنة بالمنافسين في أذهان العملاء؟

## 🗣️ رسائل التسويق الرئيسية
٣ رسائل أساسية تُميّزك وتُقنع عملاءك.

## 🎯 الشريحة المثلى (Sweet Spot)
من عميلك المثالي الذي سيختارك حتماً على المنافسين؟

## 🚧 ما يجب تجنبه
أخطاء في التموضع تجعلك تبدو مثل المنافسين.

## 📈 خطة بناء الإدراك التنافسي
كيف تبني سمعتك وتُثبّت موقعك في السوق خلال 6 أشهر؟`,
};

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 15, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const { isGuest } = await softAuth(req);

  const body = await req.json().catch(() => ({})) as Record<string, string>;
  const industry = xss(body.industry?.trim() || '');
  const companyName = xss(body.companyName?.trim() || '');
  const competitors = (body.knownCompetitors as unknown as string[])?.filter(Boolean).map(c => xss(c)).join('، ') || '';
  const analysisType = body.analysisType || 'full';
  const targetCustomer = xss(body.targetCustomer?.trim() || '');

  if (!industry) {
    return NextResponse.json({ error: 'يرجى تحديد القطاع أو الصناعة' }, { status: 400 });
  }

  const promptFn = MODE_PROMPTS[analysisType] || MODE_PROMPTS.full;
  const prompt = promptFn({ industry, companyName, competitors, targetCustomer });

  const cacheKey = buildKey(
    'competitor-watch',
    hashInputs(industry, analysisType, companyName, competitors, targetCustomer),
  );

  try {
    const { value: result, hit } = await withCache<string>(
      cacheKey,
      TTL.ONE_DAY,
      async () => {
        const { text } = await generateText({
          model: MODEL,
          system: `أنت خبير استراتيجية تنافسية متخصص في الأسواق المصرية والعربية.
تكتب بالعربية الاحترافية مع أمثلة من السوق المحلي.
استخدم الجداول والقوائم والأقسام المنظمة لتقديم تحليل واضح وقابل للتنفيذ.
ركّز على الواقع العملي وليس التحليل النظري المجرد.${isGuest ? '\nالمستخدم ضيف — قدّم تحليلاً مفيداً ولكن موجزاً.' : ''}`,
          prompt,
          maxOutputTokens: 2500,
        });
        return text;
      },
    );
    return NextResponse.json({ result, cached: hit });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'فشل التحليل';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
