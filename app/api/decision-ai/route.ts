import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { adminAuth } from '@/src/lib/firebase-admin';
import xss from 'xss';

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
  const rl = rateLimit(request, { limit: isGuest ? 2 : 10, windowMs: 60_000, userId: isGuest ? undefined : userId, scope: isGuest ? 'guest' : 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = body.mode as string;

    // Accept aliases: "premortem" → "before", "postmortem" → "review"
    const normalizedMode = mode === 'premortem' ? 'before' : mode === 'postmortem' ? 'review' : mode;

    if (normalizedMode === 'before') {
      // Pre-decision analysis
      // Accept "decision" as fallback for "title" (from decision-journal page)
      const title = xss(String(body.title ?? body.decision ?? '').slice(0, 500));
      const context = xss(String(body.context ?? '').slice(0, 2000));
      const options = xss(String(body.options ?? '').slice(0, 1000));
      const chosen = xss(String(body.chosen ?? '').slice(0, 500));
      const reasoning = xss(String(body.reasoning ?? '').slice(0, 2000));

      if (!title.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });

      const { text } = await generateText({
        model: MODELS.PRO,
        system: `أنت مستشار قرارات استراتيجي متخصص في مساعدة رواد الأعمال المصريين والعرب.
أسلوبك: مثل مدرب تنفيذي — لا تحكم على القرارات، بل تساعد في رؤية ما يُغفَل.
تعمل بثلاثة محاور: الثغرات المنطقية، التحيزات المعرفية، العوامل المُغفَلة.`,
        prompt: `القرار: ${title}
السياق: ${context || 'غير محدد'}
الخيارات: ${options || 'غير محددة'}
ما اختاره: ${chosen || 'لم يُحدَّد بعد'}
المبرر: ${reasoning || 'غير محدد'}

حلّل هذا القرار قبل اتخاذه:

## 🔍 التحيزات المحتملة
(ما هي التحيزات المعرفية التي قد تؤثر على هذا القرار؟)

## ⚠️ العوامل المُغفَلة
(ما الذي لم يُذكَر ويجب أخذه بالحسبان؟)

## 🎯 أسئلة توضيحية
(٣-٥ أسئلة يجب الإجابة عليها قبل المضي قدماً)

## 📊 Pre-Mortem: ماذا لو فشلنا؟
(أكثر سيناريوهات الفشل احتمالاً)

## ✅ توصية
(خلاصة واضحة في جملتين)`,
      });

      return NextResponse.json({ result: text, mode: 'before' });
    }

    if (normalizedMode === 'review') {
      // Post-decision review (lesson extraction)
      // Accept "decision" as fallback for "title", "outcome" for "actualOutcome"
      const title = xss(String(body.title ?? body.decision ?? '').slice(0, 500));
      const chosen = xss(String(body.chosen ?? '').slice(0, 500));
      const expectedOutcome = xss(String(body.expectedOutcome ?? '').slice(0, 1000));
      const actualOutcome = xss(String(body.actualOutcome ?? body.outcome ?? '').slice(0, 500));
      const daysSince = Number(body.daysSince ?? 30);

      if (!title.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });

      const { text } = await generateText({
        model: MODELS.FLASH,
        system: `أنت مدرب استراتيجي تساعد رواد الأعمال على استخلاص الدروس من قراراتهم.
مهمتك: تحليل الفجوة بين التوقع والواقع وتحويلها لدرس قابل للتطبيق.`,
        prompt: `القرار: ${title}
ما اتُّخذ: ${chosen}
ما كان متوقعاً: ${expectedOutcome}
ما حدث فعلاً: ${actualOutcome || 'لم يُحدَّد بعد'}
عدد الأيام منذ القرار: ${daysSince} يوم

استخلص الدرس:

## 📈 تقييم القرار: X/10

## 🎓 الدرس الرئيسي
(جملة واحدة قابلة للتطبيق مستقبلاً)

## 🔄 ما كان يجب فعله بشكل مختلف؟

## 💡 نمط يجب تجنّبه في المستقبل

## ✨ نقطة قوة تُعزَّز`,
      });

      return NextResponse.json({ result: text, mode: 'review' });
    }

    return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
