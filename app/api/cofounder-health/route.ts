import { NextRequest, NextResponse } from 'next/server';
import { cofounderHealthCheckAction } from '@/src/ai/agents/cofounder-coach/agent';
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
  const rl = rateLimit(request, { limit: isGuest ? 2 : 8, windowMs: 60_000, userId: isGuest ? undefined : userId, scope: isGuest ? 'guest' : 'user' });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = body.mode as string | undefined;
    const founders = body.founders ?? [];
    const companyStage = xss(String(body.companyStage ?? 'idea').slice(0, 100));
    const specificChallenges = body.specificChallenges ? xss(String(body.specificChallenges).slice(0, 1000)) : undefined;

    if (!Array.isArray(founders) || founders.length < 1) {
      return NextResponse.json({ error: 'At least 1 founder required' }, { status: 400 });
    }

    // Agreement generation mode
    if (mode === 'agreement') {
      const { generateText } = await import('ai');
      const { google } = await import('@/src/lib/gemini');
      const MODEL = google('gemini-2.5-pro');
      const companyName = xss(String(body.companyName ?? 'الشركة').slice(0, 200));
      const companyType = xss(String(body.companyType ?? 'LLC').slice(0, 50));
      const terms = body.terms ?? {};

      const foundersText = founders.map((f: { name: string; role: string; equity: number; answers?: Record<string, string> }) =>
        `- ${f.name || 'مؤسس'} (${f.role || 'دور'}): ${f.equity}% — مسؤوليات: ${f.answers?.responsibilities || 'غير محددة'}, الالتزام: ${f.answers?.commitment || 'full-time'}`
      ).join('\n');

      const { text } = await generateText({
        model: MODEL,
        maxOutputTokens: 6000,
        system: `أنت مستشار قانوني متخصص في اتفاقيات التأسيس للشركات الناشئة في مصر. أنشئ مسودة اتفاقية مؤسسين شاملة باللغة العربية.`,
        prompt: `أنشئ اتفاقية مؤسسين لـ:
الشركة: ${companyName} (${companyType})
المؤسسون:
${foundersText}
الشروط: Vesting ${terms.vestingPeriod || 4} سنوات، Cliff ${terms.cliffMonths || 12} شهراً، ملكية IP: ${terms.ipOwnership || 'الشركة'}، عدم منافسة: ${terms.nonCompete || 'سنتان'}، حل النزاعات: ${terms.disputeResolution || 'تحكيم تجاري'}

اكتب اتفاقية مفصّلة تشمل: ديباجة، تعريفات، توزيع الحصص، Vesting schedule، أدوار ومسؤوليات، اتخاذ القرار، IP، سرية، عدم منافسة، الخروج، حل النزاعات، أحكام ختامية.`,
      });

      return NextResponse.json({ result: text });
    }

    const result = await cofounderHealthCheckAction({ founders, companyStage, specificChallenges });
    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
