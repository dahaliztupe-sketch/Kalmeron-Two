import { founderModel } from '@/src/lib/company/models';
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/src/lib/gemini';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { adminAuth } from '@/src/lib/firebase-admin';
import { logger } from '@/src/lib/logger';
import xss from 'xss';
import { consumeGuestQuota } from '@/src/lib/plan/guest-cap';
import { parseValidatedPlan, planToMarkdown } from '@/src/lib/plan/validated-plan';

const PLAN_PROMPT = (idea: string, industry: string, stage: string) => `You are validating a startup idea for the Egyptian market. Be critical, not flattering.
Idea: "${idea}"
Industry: ${industry || 'unspecified'}. Stage: ${stage || 'unspecified'}.
Return ONLY one JSON object, no prose, with exactly these keys:
{"idea":string,"verdict":"proceed"|"refine"|"stop","verdictReason":string,"swot":{"strengths":[{"text":string,"basis":"assumption"|"user_fact"|"needs_check"}],"weaknesses":[...],"opportunities":[...],"threats":[...]},"targetCustomer":string,"competitors":[{"name":string,"note":string}],"risks":[{"text":string,"basis":...}],"nextSteps":[{"action":string,"costEgp":number|null,"days":integer}]}
Rules: all text in Arabic. Use basis "user_fact" only for things stated in the idea text, otherwise "assumption" or "needs_check". Do not invent statistics, market sizes or competitor revenue. 1 to 7 next steps, each doable in under 30 days.`;

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

  // Guests: bounded daily spend and the cheaper model. Signed-in users keep the pro model.
  if (isGuest && !(await consumeGuestQuota())) {
    return NextResponse.json({ error: 'guest_cap', message: 'Daily free limit reached. Sign in to continue.' }, { status: 429 });
  }
  const model = founderModel(isGuest);

  try {
    const body = await request.json();
    const ideaDesc = xss(String(body.ideaDesc ?? '').slice(0, 5000));
    const industry = xss(String(body.industry ?? '').slice(0, 200));
    const startup_stage = xss(String(body.startup_stage ?? '').slice(0, 100));

    if (!ideaDesc || typeof ideaDesc !== 'string' || !ideaDesc.trim()) {
      return NextResponse.json({ error: 'ideaDesc is required' }, { status: 400 });
    }

    if (body.format === 'plan') {
      try {
        const planResp = await ai.models.generateContent({
          model,
          contents: PLAN_PROMPT(ideaDesc, industry, startup_stage),
          config: { responseMimeType: 'application/json' },
        });
        const parsed = parseValidatedPlan(planResp.text || '');
        if (parsed.ok) {
          return NextResponse.json({ result: planToMarkdown(parsed.plan), plan: parsed.plan });
        }
        logger.warn({ event: 'ideas_plan_parse_failed', reason: parsed.error }, 'ideas_plan_parse_failed');
      } catch (err) {
        logger.warn({ err, event: 'ideas_plan_call_failed' }, 'ideas_plan_call_failed');
      }
      // Fall through to the free-form markdown analysis below.
    }

    const response = await ai.models.generateContent({
      model,
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
