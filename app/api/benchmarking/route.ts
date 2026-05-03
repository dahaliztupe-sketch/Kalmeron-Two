import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import xss from 'xss';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

const MENA_BENCHMARKS = `
=== جداول بنشمارك MENA/مصر (بيانات مرجعية مُعتمَدة) ===

[SaaS / برمجيات — Seed]
Monthly Churn: 5-8%  |  CAC: 500-1500 جنيه  |  LTV/CAC: 2-4×  |  Gross Margin: 65-75%  |  MoM Growth: 10-20%  |  Runway Median: 12 شهر  |  Team Size: 3-8

[SaaS / برمجيات — Series A]
Monthly Churn: 2-5%  |  CAC: 1000-4000 جنيه  |  LTV/CAC: 3-6×  |  Gross Margin: 70-80%  |  MoM Growth: 8-15%  |  Runway Median: 18 شهر  |  Team Size: 10-30

[تجارة إلكترونية — Seed]
Monthly Churn: N/A (repeat purchase rate 25-40%)  |  CAC: 150-500 جنيه  |  Gross Margin: 20-35%  |  MoM Growth: 15-30%  |  Average Order Value (AOV): 300-800 جنيه  |  Cart Abandon Rate: 65-75%

[تجارة إلكترونية — Series A]
CAC: 80-300 جنيه  |  Gross Margin: 25-40%  |  MoM Growth: 10-20%  |  AOV: 400-1200 جنيه  |  NPS: 30-50

[Fintech / مالية — Seed]
Monthly Churn: 3-7%  |  CAC: 200-800 جنيه  |  Gross Margin: 40-65%  |  MoM Growth: 12-25%  |  Activation Rate: 40-60%

[Fintech / مالية — Series A]
Monthly Churn: 1-4%  |  CAC: 150-600 جنيه  |  Gross Margin: 50-70%  |  MoM Growth: 8-18%  |  AUM Growth MoM: 15-25%

[EdTech / تعليم — Seed]
Monthly Churn: 8-15%  |  CAC: 100-400 جنيه  |  Course Completion Rate: 15-30%  |  Gross Margin: 60-75%  |  MoM Growth: 10-20%

[HealthTech / صحة — Seed]
Monthly Churn: 4-10%  |  CAC: 300-1000 جنيه  |  Gross Margin: 50-70%  |  MoM Growth: 8-15%

[Marketplace — Seed]
Take Rate: 10-25%  |  GMV Growth MoM: 15-30%  |  Supplier Churn: 5-12%  |  Gross Margin: 15-30%

[لوجستيات وتوصيل — Seed]
On-Time Delivery: 85-92%  |  CAC: 50-200 جنيه  |  Gross Margin: 10-25%  |  MoM Orders Growth: 15-25%

معايير عامة للسوق المصري (Pre-Seed → Seed):
- Burn Rate مناسب لـ Seed: 50,000-200,000 جنيه/شهر
- Runway آمن: 12-18 شهر على الأقل
- LTV:CAC لـ Seed: يجب أن يتجاوز 2× — مثالي >3×
- Payback Period: أقل من 12 شهر لـ Seed، أقل من 6 أشهر لـ Series A
- MoM Revenue Growth صحي لـ Seed: 10-20%
- Day-30 Retention صحي: B2B >60% | B2C >20%
`;

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
    limit: isGuest ? 3 : 10,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const sector = xss(String(body.sector ?? 'SaaS').slice(0, 100));
    const stage = xss(String(body.stage ?? 'Seed').slice(0, 50));
    const mrr = xss(String(body.mrr ?? '').slice(0, 100));
    const burnRate = xss(String(body.burnRate ?? '').slice(0, 100));
    const cac = xss(String(body.cac ?? '').slice(0, 100));
    const churn = xss(String(body.churn ?? '').slice(0, 100));
    const ltv = xss(String(body.ltv ?? '').slice(0, 100));
    const teamSize = xss(String(body.teamSize ?? '').slice(0, 50));
    const runway = xss(String(body.runway ?? '').slice(0, 100));
    const growthRate = xss(String(body.growthRate ?? '').slice(0, 100));

    const { text } = await generateText({
      model: MODEL,
      system: `أنت محلل بيانات متخصص في قياس أداء الشركات الناشئة المصرية والعربية.
استخدم فقط أرقام البنشمارك المُعطاة لك في الـ prompt — لا تخترع أرقاماً من خارجها.
إذا لم يُدخل المستخدم مقياساً معيناً، لا تُحلّله.`,
      prompt: `${MENA_BENCHMARKS}

=== بيانات الشركة الناشئة ===
القطاع: ${sector}
المرحلة: ${stage}
${mrr ? `MRR: ${mrr}` : ''}
${burnRate ? `Burn Rate: ${burnRate}` : ''}
${cac ? `CAC: ${cac}` : ''}
${churn ? `Churn Rate: ${churn}` : ''}
${ltv ? `LTV: ${ltv}` : ''}
${teamSize ? `حجم الفريق: ${teamSize}` : ''}
${runway ? `Runway: ${runway}` : ''}
${growthRate ? `معدل النمو الشهري: ${growthRate}` : ''}

=== المطلوب ===
قارن كل مقياس أدخله المستخدم بالبنشمارك الواردة في الجدول أعلاه فقط.
قدّم التقرير بالعربية:

## 🎯 نظرة عامة على الأداء
(تقييم سريع — أين تقع الشركة مقارنة بالسوق؟)

## 📊 تحليل المقاييس المُدخَلة
لكل مقياس أدخله المستخدم فقط:
| المقياس | القيمة الحالية | معيار السوق (من الجدول) | التقييم |

## 🏆 نقاط القوة
(المقاييس التي تتفوق فيها الشركة على المعيار)

## 🔴 نقاط الضعف الحرجة
(المقاييس التي تحتاج تحسيناً عاجلاً)

## 📈 أولويات التحسين
(مرتّبة حسب الأهمية)

## 💡 توصيات قابلة للتطبيق خلال 90 يوماً`,
    });

    return NextResponse.json({ result: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
