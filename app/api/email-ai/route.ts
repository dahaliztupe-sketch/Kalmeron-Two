/**
 * POST /api/email-ai
 * Writes professional emails: cold outreach, follow-up, proposal, partnership
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

const TONE_MAP: Record<string, string> = {
  professional: 'رسمي احترافي، مهذّب ومحترم',
  friendly: 'ودي ودافئ، كالتحدث مع صديق يحترمه',
  direct: 'مباشر وموجز، يحترم وقت القارئ',
  arabic: 'عربي أصيل، يستخدم مفردات راقية ومناسبة للثقافة المصرية',
};

const MODE_PROMPTS: Record<string, (d: Record<string, string>) => string> = {
  outreach: (d) => `اكتب رسالة Cold Outreach فعّالة:

المُرسِل: ${d.sender || 'مؤسس شركة'}
المُستلِم: ${d.recipient || 'عميل محتمل'}
السياق: ${d.context}
الهدف: ${d.goal || 'حجز اجتماع تعريفي'}
النبرة: ${TONE_MAP[d.tone] || TONE_MAP.professional}
اللغة: ${d.language === 'en' ? 'English' : 'العربية'}

اكتب رسالة تحتوي على:

**السطر الأول (Hook):** جملة تُثير الاهتمام فوراً

**الجسم:** مختصر (3-4 جمل) يوضح:
- من أنت
- لماذا تتواصل معهم تحديداً
- القيمة المضافة في جملة واحدة

**CTA:** طلب واضح وسهل التنفيذ

---

ثم أضف:

## نصائح للإرسال
- أفضل وقت للإرسال
- Subject Line مقترح (3 خيارات)
- ما تتجنبه في هذه الرسالة
`,

  followup: (d) => `اكتب رسالة متابعة ذكية لا تبدو ملحّة:

المُرسِل: ${d.sender || 'مؤسس شركة'}
المُستلِم: ${d.recipient || 'عميل محتمل'}
السياق: ${d.context}
الهدف: ${d.goal || 'الحصول على رد'}
النبرة: ${TONE_MAP[d.tone] || TONE_MAP.professional}
اللغة: ${d.language === 'en' ? 'English' : 'العربية'}

اكتب رسالة متابعة:
- تُشعر القارئ بأنك تُضيف قيمة لا تُضغط عليه
- تُذكّره بالرسالة السابقة بطريقة طبيعية
- تُقدّم سبباً جديداً للرد
- تنتهي بـ CTA خفيف

---

## 3 نسخ بزوايا مختلفة
**النسخة 1:** القيمة المضافة
**النسخة 2:** السؤال الذكي
**النسخة 3:** الإغلاق الرقيق (إذا كانت المتابعة الأخيرة)

## Subject Lines مقترحة
`,

  proposal: (d) => `اكتب عرض خدمات احترافي ومُقنع:

المُرسِل: ${d.sender || 'مؤسس شركة'}
المُستلِم: ${d.recipient || 'عميل'}
السياق: ${d.context}
الهدف: ${d.goal || 'الفوز بالعميل'}
النبرة: ${TONE_MAP[d.tone] || TONE_MAP.professional}
اللغة: ${d.language === 'en' ? 'English' : 'العربية'}

اكتب عرض خدمات يشمل:

## الافتتاحية
(تُظهر فهمك لمشكلة العميل)

## الحل المقترح
(وصف موجز وواضح للخدمة)

## لماذا أنت؟
(نقاط تميّز تفرّقك عن المنافسين)

## نتائج متوقعة
(قيمة ملموسة وقابلة للقياس)

## الخطوات التالية
(CTA واضح وخطوة واحدة فقط)

---
## Subject Line مقترح
## نصيحة للمتابعة
`,

  partnership: (d) => `اكتب رسالة طلب شراكة أو تعاون:

المُرسِل: ${d.sender || 'مؤسس شركة'}
المُستلِم: ${d.recipient || 'شريك محتمل'}
السياق: ${d.context}
الهدف: ${d.goal || 'بدء محادثة شراكة'}
النبرة: ${TONE_MAP[d.tone] || TONE_MAP.professional}
اللغة: ${d.language === 'en' ? 'English' : 'العربية'}

اكتب رسالة شراكة تُوضح:

## لماذا أنتم؟
(ما الذي لفت انتباهك في هذه الشركة تحديداً)

## فرصة التقاطع
(أين تلتقي مصالحكم؟)

## القيمة المشتركة
(ماذا يكسب كل طرف من التعاون؟)

## نماذج الشراكة المقترحة
(خيارات مرنة للبحث)

## الخطوة التالية
(مقترح لقاء أو مكالمة)

---
## Subject Line مقترح
## توقيت مثالي للإرسال
`,
};

export async function POST(request: NextRequest) {
  const { userId, isGuest } = await softAuth(request);
  const rl = rateLimit(request, {
    limit: isGuest ? 5 : 25,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = (body.mode as string) || 'outreach';
    if (!Object.keys(MODE_PROMPTS).includes(mode)) {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
    }

    const d = {
      sender: xss(String(body.sender ?? '').slice(0, 200)),
      recipient: xss(String(body.recipient ?? '').slice(0, 200)),
      context: xss(String(body.context ?? '').slice(0, 2000)),
      goal: xss(String(body.goal ?? '').slice(0, 200)),
      tone: xss(String(body.tone ?? 'professional').slice(0, 50)),
      language: (body.language === 'en') ? 'en' : 'ar',
    };

    if (!d.context.trim()) {
      return NextResponse.json({ error: 'context required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      system: `أنت "كاتب البريد الذكي" في منصة كلميرون — خبير في كتابة رسائل بريد إلكتروني تجارية مُقنعة وفعّالة.

تكتب بأسلوب يحترم ذكاء المُستلِم، يُضيف قيمة حقيقية، ويحقق نتائج.

تفهم الثقافة المصرية والعربية في المراسلات التجارية — الرسميات المناسبة دون التكلّف.`,
      prompt: MODE_PROMPTS[mode](d),
    });

    return NextResponse.json({ result: text, mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
