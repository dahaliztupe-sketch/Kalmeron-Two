/**
 * POST /api/okr/generate
 * AI-powered custom OKR generation based on a user-provided goal description.
 * Used by the plan/page.tsx AI OKR generator.
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

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const { userId, isGuest } = await softAuth(req);
  if (isGuest) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const body = await req.json().catch(() => ({})) as Record<string, string>;
  const goal = xss(body.goal?.trim() || '');
  const quarter = xss(body.quarter?.trim() || `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`);

  if (!goal) {
    return NextResponse.json({ error: 'يرجى وصف هدفك أو فكرتك' }, { status: 400 });
  }

  const prompt = `بناءً على الهدف التالي لرائد الأعمال، صغ OKR احترافياً واضح وقابل للقياس:

الهدف: ${goal}
الفصل: ${quarter}

اكتب OKR جاهزاً للتنفيذ يشمل:

## 🎯 الهدف (Objective)
جملة هدف طموحة وملهمة لا تتجاوز سطرين.

## 📊 النتائج الرئيسية (Key Results) — ٣ إلى ٥ نتائج
لكل نتيجة:
- **KR:** وصف النتيجة
- **المقياس:** ما الرقم أو النسبة المستهدفة؟
- **كيف تقيسه:** الأداة أو المصدر

## 📅 الجدول الزمني
كيف يُقسَّم الهدف على أشهر الفصل؟

## ⚠️ المخاطر والعوائق المحتملة
أبرز ٢-٣ مخاطر وكيف تتجنبها.

## ✅ تعريف النجاح
متى تعتبر هذا الفصل ناجحاً تحديداً؟

اجعل OKR واقعياً ومناسباً لرائد الأعمال العربي في السوق المصري والعربي.`;

  try {
    const { text } = await generateText({
      model: MODEL,
      system: `أنت مستشار استراتيجي متخصص في OKRs وتخطيط الشركات الناشئة.
تكتب بالعربية الاحترافية مع أمثلة ومقاييس واقعية وقابلة للتطبيق.
اجعل النتائج الرئيسية محددة وقابلة للقياس (SMART).`,
      prompt,
      maxOutputTokens: 1500,
    });
    return NextResponse.json({ result: text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'فشل إنشاء OKR';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
