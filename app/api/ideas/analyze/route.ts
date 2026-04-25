import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/src/lib/gemini';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { adminAuth } from '@/src/lib/firebase-admin';
import { logger } from '@/src/lib/logger';
import xss from 'xss';

/**
 * Soft auth: same pattern as /api/council. Guests get a stricter rate
 * limit (3/min) so anonymous traffic cannot drain LLM credits unbounded.
 */
async function softAuth(req: NextRequest): Promise<{ userId: string; isGuest: boolean }> {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
      return { userId: dec.uid, isGuest: false };
    } catch {
      /* fall through */
    }
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
  if (isGuest) {
    logger.warn({ event: 'ideas_analyze_guest_call', path: '/api/ideas/analyze' }, 'ideas_analyze_guest_call');
  }

  try {
    const body = await request.json();
    const ideaDesc = xss(String(body.ideaDesc ?? '').slice(0, 5000));
    const industry = xss(String(body.industry ?? '').slice(0, 200));
    const startup_stage = xss(String(body.startup_stage ?? '').slice(0, 100));

    if (!ideaDesc || typeof ideaDesc !== 'string' || !ideaDesc.trim()) {
      return NextResponse.json({ error: 'ideaDesc is required' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `I have a startup idea. Please validate it aggressively for the Egyptian market. 
        Idea: "${ideaDesc}"
        My Target Industry is: ${industry} and Phase is ${startup_stage}.
        
        Respond in professional, formal Arabic (الفصحى المعاصرة). Structure your response beautifully with Markdown:
        1. SWOT Analysis (نقاط القوة، الضعف، الفرص، التهديدات)
        2. Market Fit in Egypt (حجم السوق واحتياجاته)
        3. Potential Competitors (المنافسين المباشرين وغير المباشرين)
        4. Recommendation (الخلاصة: هل تستحق ولا لأ، وما هي الخطوة التالية الخطوة العملية؟)`,
    });

    const resultText = response.text || '';

    return NextResponse.json({ result: resultText });
  } catch (error) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: error }, '[ideas/analyze] error');
    return NextResponse.json(
      { error: 'Failed to analyze idea' },
      { status: 500 }
    );
  }
}
