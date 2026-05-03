/**
 * POST /api/cap-table/analyze
 * Analyzes cap table and calculates dilution for Egyptian startups.
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
    const shareholders = body.shareholders ?? [];
    const newRound = body.newRound ?? null;
    const companyName = xss(String(body.companyName ?? 'الشركة').slice(0, 100));

    if (!Array.isArray(shareholders) || shareholders.length === 0) {
      return NextResponse.json({ error: 'shareholders required' }, { status: 400 });
    }

    const shareholdersSummary = shareholders
      .map((s: { name: string; role: string; shares: number; type: string }) =>
        `- ${s.name} (${s.role}): ${s.shares} سهم — ${s.type}`)
      .join('\n');

    const totalShares = shareholders.reduce((sum: number, s: { shares: number }) => sum + Number(s.shares), 0);

    const roundInfo = newRound
      ? `\n\nجولة استثمار جديدة:\n- المبلغ: ${newRound.amount}\n- التقييم Pre-Money: ${newRound.valuation}\n- المستثمر: ${newRound.investorName || 'مستثمر جديد'}`
      : '';

    const { text } = await generateText({
      model: MODEL,
      system: `أنت مستشار مالي متخصص في هيكلة الملكية للشركات الناشئة المصرية والعربية. خبرتك في Cap Tables وجولات الاستثمار وحقوق ESOP.`,
      prompt: `حلّل جدول الحصص التالي لشركة "${companyName}":

المساهمون الحاليون:
${shareholdersSummary}

إجمالي الأسهم الحالية: ${totalShares} سهم
${roundInfo}

قدّم تحليلاً يشمل:

## 📊 ملخص الملكية الحالية
(جدول بالنسب المئوية لكل مساهم)

## 💰 التقييم الحالي
(إذا توفرت بيانات الجولة السابقة)

${newRound ? `## 🔄 تأثير الجولة الجديدة (Dilution Analysis)
(احسب النسب الجديدة بعد الجولة)

## 📉 نسبة التخفيف لكل مساهم
(كم خسر كل مساهم من نسبته؟)

## 💵 Post-Money Valuation` : ''}

## ⚠️ مخاطر هيكل الملكية
(هل هناك تركيز كبير؟ هل ESOP مناسب؟)

## 💡 توصيات
(ما الذي يجب تحسينه في هيكل الملكية للمرحلة القادمة؟)

## 📋 هيكل ESOP الموصى به
(نسبة ووقت التخصيص المناسبين للمرحلة)`,
    });

    return NextResponse.json({ result: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
