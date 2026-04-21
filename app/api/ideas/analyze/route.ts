import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';
import xss from 'xss';

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const ideaDesc = xss(String(body.ideaDesc ?? '').slice(0, 5000));
    const industry = xss(String(body.industry ?? '').slice(0, 200));
    const startup_stage = xss(String(body.startup_stage ?? '').slice(0, 100));

    if (!ideaDesc || typeof ideaDesc !== 'string' || !ideaDesc.trim()) {
      return NextResponse.json({ error: 'ideaDesc is required' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
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
    console.error('[ideas/analyze] error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze idea' },
      { status: 500 }
    );
  }
}
