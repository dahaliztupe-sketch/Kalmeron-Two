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
    limit: isGuest ? 3 : 10,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const startupName = xss(String(body.startupName ?? '').slice(0, 200));
    const problem = xss(String(body.problem ?? '').slice(0, 1000));
    const solution = xss(String(body.solution ?? '').slice(0, 1000));
    const sector = xss(String(body.sector ?? '').slice(0, 100));
    const stage = xss(String(body.stage ?? 'Seed').slice(0, 50));
    const traction = xss(String(body.traction ?? '').slice(0, 500));
    const teamBio = xss(String(body.teamBio ?? '').slice(0, 500));
    const askAmount = xss(String(body.askAmount ?? '').slice(0, 200));

    if (!startupName.trim() || !problem.trim() || !solution.trim()) {
      return NextResponse.json({ error: 'startup name, problem, and solution are required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      maxOutputTokens: 4096,
      system: `أنت خبير متخصص في إعداد عروض المستثمرين (Pitch Decks) للشركات الناشئة في منطقة MENA.
خلفيتك تشمل العمل مع صناديق Algebra Ventures وSTV و500 Global وVentures Platform.
أسلوبك: واضح، مقنع، مبني على البيانات، ومناسب لتوقعات المستثمرين الإقليميين.`,
      prompt: `أنشئ هيكل عرض مستثمرين كاملاً من 12 شريحة للشركة التالية:

الشركة: ${startupName}
القطاع: ${sector}
المرحلة: ${stage}
المشكلة: ${problem}
الحل: ${solution}
${traction ? `الزخم والإنجازات: ${traction}` : ''}
${teamBio ? `الفريق: ${teamBio}` : ''}
${askAmount ? `الجولة المطلوبة: ${askAmount}` : ''}

أنشئ العرض بالعربية بهذا الهيكل بالضبط:

## 🎯 الشريحة 1: الافتتاحية
(جملة واحدة قوية تلخص القيمة — Tagline)

## 😤 الشريحة 2: المشكلة
(اعرض المشكلة بأرقام وأثر واقعي — اجعل المستثمر يشعر بها)

## 💡 الشريحة 3: الحل
(كيف تحل المشكلة بشكل فريد — مع الاختلاف عن البدائل الموجودة)

## 📊 الشريحة 4: حجم السوق
TAM / SAM / SOM مع أرقام مُقدَّرة لمصر والمنطقة

## 🖥️ الشريحة 5: عرض المنتج
(3 ميزات رئيسية وكيف يعمل المنتج خطوة بخطوة)

## 📈 الشريحة 6: الزخم والإنجازات
${traction ? '(استخدم البيانات المُدخَلة)' : '(ضع قوالب للأرقام التي يجب على الفريق ملؤها)'}

## 💰 الشريحة 7: نموذج العمل (Business Model)
(كيف تجني المال — Pricing، Revenue Streams، Unit Economics)

## 🗺️ الشريحة 8: خطة الوصول للسوق (GTM)
(القنوات، الشراكات، تسلسل التوسع)

## ⚔️ الشريحة 9: المنافسون
(مصفوفة مقارنة واضحة — أين التفوق التنافسي)

## 👥 الشريحة 10: الفريق
${teamBio ? '(استخدم بيانات الفريق المُدخَلة)' : '(قالب لما يجب ذكره عن كل مؤسس)'}

## 📉 الشريحة 11: البيانات المالية والطلب
${askAmount ? `الجولة: ${askAmount}` : '(ضع قالباً للطلب الاستثماري)'}
توزيع الاستخدام المقترح للتمويل (3 بنود رئيسية)
أبرز المقاييس المالية المتوقعة بعد 18 شهراً

## 🚀 الشريحة 12: الرؤية والخاتمة
(أين ستكون الشركة بعد 3 سنوات — اجعلها طموحة وقابلة للتصديق)

---
## 💬 نصائح التقديم
(3 نصائح عملية لتقديم هذا العرض أمام المستثمرين العرب)

## ❓ أسئلة المستثمرين المتوقعة
(5 أسئلة صعبة محتملة مع إجابات مقترحة)`,
    });

    return NextResponse.json({ result: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
