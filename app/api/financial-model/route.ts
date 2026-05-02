/**
 * POST /api/financial-model
 * Builds financial projections, break-even analysis, and unit economics
 * for Egyptian startups using Gemini 2.5 Flash.
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

const PROMPTS: Record<string, (data: Record<string, string>) => string> = {
  model: (d) => `ابنِ توقعات مالية واقعية:

النشاط التجاري: ${d.description}
نوع النشاط: ${d.businessType}
الإيراد الابتدائي: ${d.initialRevenue || 'غير محدد'}
معدل النمو الشهري المستهدف: ${d.growthRate || 'غير محدد'}
التكاليف الثابتة الشهرية: ${d.fixedCosts || 'غير محددة'}
التكاليف المتغيرة/وحدة: ${d.variableCosts || 'غير محددة'}
الأفق الزمني: ${d.horizon} شهر

أنشئ نموذجاً مالياً يشمل:

## 📊 ملخص التوقعات
(الأرقام الرئيسية في نهاية الفترة)

## 📈 جدول التدفق الشهري (أهم نقاط التحول)
(شهر 1، 3، 6، 12 — وإن كانت 24-36 شهر، أضف 18 و24 و36)
| الشهر | الإيراد | التكاليف | صافي الربح | تراكمي |

## 💰 هامش الربح الإجمالي والصافي

## ⚡ نقطة التعادل المتوقعة
(في أي شهر تصبح الشركة مربحة؟)

## 🎯 الأهداف الربعية
(Q1, Q2, Q3, Q4 — أرقام واضحة)

## ⚠️ افتراضات حساسة
(ما الافتراضات التي إن تغيّرت ستؤثر جوهرياً على النموذج؟)

## 💡 توصيات مالية
(3 قرارات مالية مبكرة تُحدث فرقاً كبيراً)`,

  breakeven: (d) => `احسب نقطة التعادل بدقة:

النشاط التجاري: ${d.description}
نوع النشاط: ${d.businessType}
الإيراد الابتدائي: ${d.initialRevenue || 'غير محدد'}
التكاليف الثابتة الشهرية: ${d.fixedCosts || 'غير محددة'}
التكاليف المتغيرة/وحدة: ${d.variableCosts || 'غير محددة'}
معدل النمو: ${d.growthRate || 'غير محدد'}

أنشئ تحليل نقطة التعادل:

## 🎯 نقطة التعادل
(عدد الوحدات/العملاء المطلوبة لتغطية التكاليف الثابتة)

## 📐 المعادلة المستخدمة
Break-even = Fixed Costs ÷ (Price - Variable Cost per Unit)

## 📊 جدول نقطة التعادل
| عدد العملاء | الإيراد | التكاليف المتغيرة | هامش المساهمة | التكاليف الثابتة | صافي الربح |

## ⏱️ متى تصل لنقطة التعادل؟
(بناءً على معدل النمو المستهدف)

## 📈 هامش الأمان (Margin of Safety)
(كم يمكن أن تنخفض المبيعات قبل الخسارة؟)

## 💡 سيناريوهات مقارنة
| السيناريو | نقطة التعادل | الشهر المتوقع |
|-----------|-------------|--------------|
| متحفظ (-20%) | ... | ... |
| أساسي | ... | ... |
| متفائل (+20%) | ... | ... |`,

  uniteconomics: (d) => `حلّل اقتصاديات الوحدة:

النشاط التجاري: ${d.description}
نوع النشاط: ${d.businessType}
الإيراد الابتدائي: ${d.initialRevenue || 'غير محدد'}
التكاليف المتغيرة/وحدة: ${d.variableCosts || 'غير محددة'}

أنشئ تحليل Unit Economics:

## 💰 المقاييس الجوهرية
| المقياس | القيمة | التفسير |
|---------|--------|---------|
| LTV (قيمة العميل مدى الحياة) | ... | ... |
| CAC (تكلفة اكتساب عميل) | ... | ... |
| نسبة LTV:CAC | ... | يجب أن تكون > 3x |
| Payback Period | ... | ... |
| Gross Margin | ... | ... |
| Churn Rate المستهدف | ... | ... |

## 📊 تحليل LTV
(احسب LTV بمعادلة واضحة)

## 📉 تأثير Churn
(كيف يؤثر معدل المغادرة على اقتصاديات الشركة؟)

## 🚀 مسار التحسين
(3 قرارات لتحسين Unit Economics)

## ⚠️ علامات التحذير
(متى تصبح Unit Economics غير مستدامة؟)`,
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
    const mode = (body.mode as string) || 'model';
    if (!['model', 'breakeven', 'uniteconomics'].includes(mode)) {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
    }

    const d = {
      description: xss(String(body.description ?? '').slice(0, 2000)),
      businessType: xss(String(body.businessType ?? 'other').slice(0, 50)),
      initialRevenue: xss(String(body.initialRevenue ?? '').slice(0, 200)),
      growthRate: xss(String(body.growthRate ?? '').slice(0, 100)),
      fixedCosts: xss(String(body.fixedCosts ?? '').slice(0, 300)),
      variableCosts: xss(String(body.variableCosts ?? '').slice(0, 300)),
      horizon: xss(String(body.horizon ?? '12').slice(0, 5)),
    };

    if (!d.description.trim()) {
      return NextResponse.json({ error: 'business description required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      system: `أنت "المستشار المالي" في منصة كلميرون — خبير في بناء النماذج المالية للشركات الناشئة المصرية والعربية.
أسلوبك: دقيق، رقمي، وعملي. تُقدّم أرقاماً واقعية مبنية على الافتراضات المُعطاة.
عندما لا تُعطى أرقام دقيقة، استخدم أفضل تقدير للسوق المصري مع توضيح الافتراض.`,
      prompt: PROMPTS[mode](d),
    });

    return NextResponse.json({ result: text, mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
