import { NextRequest, NextResponse } from 'next/server';
  import xss from 'xss';
  import { adminAuth } from '@/src/lib/firebase-admin';
  import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
  import { receptionistRespond } from '@/src/ai/receptionist/agent';
  import { createRequestLogger } from '@/src/lib/logger';

  export const runtime = 'nodejs';
  export const maxDuration = 60;

  export async function POST(req: NextRequest) {
    const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
    const log = createRequestLogger(requestId);
    const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    try {
      const { message, uiContext, segment, threadId } = await req.json();
      if (!message || typeof message !== 'string') {
        return NextResponse.json({ error: 'message is required' }, { status: 400 });
      }

      let userId = 'guest';
      const auth = req.headers.get('Authorization');
      if (auth?.startsWith('Bearer ')) {
        try {
          const dec = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
          userId = dec.uid;
        } catch { /* guest fallback */ }
      }

      const clean = xss(message);
      const result = await receptionistRespond({
        userId, message: clean, uiContext, segment, threadId,
      });

      return NextResponse.json(result);
    } catch (err: any) {
      log.error({ msg: 'Receptionist API error', error: err?.message, stack: err?.stack });
      return NextResponse.json(
        { error: 'حدث خلل في فريق العمل. الفريق التقني يحقق في الأمر.' },
        { status: 500 }
      );
    }
  }
  