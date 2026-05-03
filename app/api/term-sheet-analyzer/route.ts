/**
 * POST /api/term-sheet-analyzer
 * Analyzes term sheets and identifies risky/unusual clauses for MENA startups.
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import xss from 'xss';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-pro');

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
    limit: isGuest ? 2 : 8,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const termSheetText = xss(String(body.termSheetText ?? '').slice(0, 15000));
    const investmentAmount = xss(String(body.investmentAmount ?? '').slice(0, 200));
    const roundType = xss(String(body.roundType ?? 'Seed').slice(0, 50));

    if (!termSheetText.trim() || termSheetText.trim().length < 100) {
      return NextResponse.json({ error: 'term sheet text required (min 100 chars)' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      system: `أنت مستشار قانوني ومالي متخصص في صفقات الاستثمار في الشركات الناشئة في مصر ومنطقة MENA. خبرتك في تحليل Term Sheets ووثائق الاستثمار وتحديد البنود الخطيرة.

تحديداً: أنت تعرف الفرق بين الشروط المعتادة في السوق المصري والخليجي والشروط غير المعتادة التي تضرّ برائد الأعمال.`,
      prompt: `حلّل الـ Term Sheet التالي وقدّم تقييماً شاملاً بالعربي:

نوع الجولة: ${roundType}
مبلغ الاستثمار: ${investmentAmount || 'غير محدد'}

نص الـ Term Sheet:
${termSheetText}

قدّم تحليلاً منظماً يشمل:

## 📋 ملخص الصفقة
(أبرز البنود في 5 نقاط)

## ✅ البنود المقبولة والمعتادة
(قائمة بالبنود الطبيعية في هذا النوع من الصفقات مع شرح مختصر)

## ⚠️ البنود التي تحتاج تفاوضاً
(بنود غير معتادة أو يمكن التفاوض عليها — مع اقتراح البديل)

## 🚨 البنود الخطيرة (Red Flags)
(بنود تحمي المستثمر بشكل مفرط على حساب المؤسس — مع تفسير الخطر)

## 📊 مقارنة بمعايير السوق المصري والخليجي
(كيف تقاس هذه الشروط مقارنة بالسوق المحلي؟)

## 💡 نصائح للتفاوض
(أهم 3-5 نقاط يجب التفاوض عليها قبل التوقيع)

## 🎯 التقييم الإجمالي
(من 10 — هل الـ Term Sheet جيد لرائد الأعمال؟)

تنبيه: ذكّر القارئ بالحصول على استشارة محامٍ متخصص قبل التوقيع.`,
    });

    return NextResponse.json({ result: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
