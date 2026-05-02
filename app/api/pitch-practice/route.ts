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
  const rl = rateLimit(request, { limit: isGuest ? 3 : 15, windowMs: 60_000, userId: isGuest ? undefined : userId, scope: isGuest ? 'guest' : 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = body.mode as string;

    if (mode === 'feedback') {
      const pitch = xss(String(body.pitch ?? '').slice(0, 5000));
      const audience = xss(String(body.audience ?? 'مستثمر').slice(0, 200));
      if (!pitch.trim() || pitch.length < 50) {
        return NextResponse.json({ error: 'pitch is required (min 50 chars)' }, { status: 400 });
      }

      const { text } = await generateText({
        model: MODELS.PRO,
        system: `أنت مدرب متخصص في Pitch Coaching للشركات الناشئة في مصر والمنطقة العربية.
مهمتك: تقييم عروض المؤسسين وتقديم تغذية راجعة قابلة للتطبيق فوراً.
المعايير: الوضوح، الإقناع، بنية القصة، الأدلة والأرقام، قوة الـ CTA.
أسلوبك: دافئ لكن صريح — لا مجاملات فارغة، مثل مدرب YC الحقيقي.`,
        prompt: `المستثمر المستهدف: ${audience}

نص العرض:
---
${pitch}
---

قدّم تقييماً شاملاً يشمل:
## 🎯 الدرجة الكلية: X/10

## ✅ نقاط القوة (ما يعمل بشكل رائع)
(٣ نقاط على الأقل)

## ⚠️ نقاط التحسين الفورية
(الأهم أولاً — مرتّبة بالأولوية)

## 🔴 الثغرات الحرجة
(ما قد يرفضك بسببه المستثمر)

## 💡 اقتراحات الإعادة الصياغة
(أعِد كتابة ٢-٣ جمل ضعيفة بشكل أقوى)

## ❓ أسئلة المستثمر المتوقعة
(٥ أسئلة ستواجهها في الاجتماع)

## 🎬 الخطوة التالية
(تعليمة واحدة واضحة للمؤسس)`,
      });

      return NextResponse.json({ result: text, mode: 'feedback' });
    }

    if (mode === 'questions') {
      const idea = xss(String(body.idea ?? '').slice(0, 2000));
      const stage = xss(String(body.stage ?? 'early').slice(0, 100));
      if (!idea.trim()) return NextResponse.json({ error: 'idea required' }, { status: 400 });

      const { text } = await generateText({
        model: MODELS.FLASH,
        system: `أنت مستثمر متمرّس في السوق المصري (مثل Algebra Ventures / Flat6Labs).
مهمتك: توليد الأسئلة الصعبة التي ستطرحها على المؤسسين خلال الـ pitch.`,
        prompt: `الفكرة: ${idea}
المرحلة: ${stage}

اطرح ١٠ أسئلة صعبة ومباشرة كما يفعل المستثمرون الحقيقيون.
رتّبها من الأصعب للأسهل.
أضف بعد كل سؤال تلميحاً صغيراً: ما الذي يريد المستثمر سماعه؟`,
      });

      return NextResponse.json({ result: text, mode: 'questions' });
    }

    return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
