import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

async function requireAuth(req: NextRequest): Promise<string | null> {
  const h = req.headers.get('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(h.slice(7));
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const uid = await requireAuth(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, userId: uid, scope: 'user' });
  if (!rl.success) return rateLimitResponse();

  const { question } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: 'الرجاء كتابة سؤالك' }, { status: 400 });

  const system = `أنت "مستشار التأسيس القانوني" في منصة كلميرون — خبير في إجراءات تأسيس الشركات في مصر.

معرفتك تشمل:
- قانون الشركات المصري رقم 159 لسنة 1981 وتعديلاته
- قانون الاستثمار رقم 72 لسنة 2017
- إجراءات GAFI (الجهاز المصري لتنشيط المشروعات الخاصة)
- أشكال الشركات: LLC, JSC, مؤسسة فردية, فروع الشركات الأجنبية
- التسجيل الضريبي والتأمينات الاجتماعية
- السجل التجاري وتراخيص الأنشطة
- مناطق الاستثمار الحرة والمناطق الاقتصادية الخاصة
- الحوافز الضريبية والإعفاءات

أسلوبك: عملي، واضح، ومحدد. قدّم إجابة مباشرة مع النقاط الرئيسية ثم التفاصيل اللازمة.

تنبيه: دائماً أشر إلى ضرورة التحقق مع محامٍ مرخص للقرارات القانونية المهمة.`;

  const { text } = await generateText({
    model: MODEL,
    system,
    prompt: question,
  });

  return NextResponse.json({ result: text });
}
