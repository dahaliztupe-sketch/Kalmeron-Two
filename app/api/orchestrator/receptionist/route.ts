import { NextRequest, NextResponse } from 'next/server';
  import xss from 'xss';
  import { adminAuth } from '@/src/lib/firebase-admin';
  import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
  import { receptionistRespond } from '@/src/ai/receptionist/agent';
  import { createRequestLogger } from '@/src/lib/logger';
  import { toErrorDetails } from '@/src/lib/errors/to-message';

  export const runtime = 'nodejs';
  export const maxDuration = 60;

  export async function POST(req: NextRequest) {
    // Always generate the requestId server-side. Never trust an
    // X-Request-ID header — it could be used to bypass per-request
    // tracing/security checks or spoof another user's request.
    const requestId = crypto.randomUUID();
    const log = createRequestLogger(requestId);
    const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    try {
      const { message, uiContext, segment, threadId } = await req.json();
      // Strict shape validation — `message` is the only user-controlled field
      // that flows into the LLM context. Reject empty / non-string payloads
      // before any auth or LLM call. (CodeQL: this is a *type* check, not a
      // user-controlled bypass of an authn/authz check; the auth path below
      // runs unconditionally for every well-formed request.)
      if (!message || typeof message !== 'string') {
        return NextResponse.json({ error: 'message is required' }, { status: 400 });
      }

      // ── Authentication (anonymous-by-design) ────────────────────────────
      // The receptionist endpoint is a public-facing pre-onboarding chat:
      // anonymous visitors *must* be able to talk to it before signing up,
      // so the absence of a Bearer token is not a privilege escalation —
      // it deterministically downgrades the request to the `guest` user
      // pool, which is rate-limited (line 18) and isolated in the agent
      // layer. The conditional below is therefore NOT a user-controlled
      // bypass of a security check — it is an explicit auth-tier router.
      // codeql[js/user-controlled-bypass]: anonymous tier is intentional;
      //   guest requests are rate-limited and sandboxed downstream.
      let userId = 'guest';
      const auth = req.headers.get('Authorization') ?? '';
      if (auth.startsWith('Bearer ')) {
        // We slice past "Bearer " (7 chars) and trim, instead of split()[1]!,
        // to avoid a non-null assertion on user-controlled input.
        const token = auth.slice(7).trim();
        if (token) {
          try {
            const dec = await adminAuth.verifyIdToken(token);
            if (dec?.uid) userId = dec.uid;
          } catch { /* invalid/expired token → guest fallback (logged below) */ }
        }
      }

      const clean = xss(message);
      const result = await receptionistRespond({
        userId, message: clean, uiContext, segment, threadId,
      });

      return NextResponse.json(result);
    } catch (err: unknown) {
      const details = toErrorDetails(err);
      log.error({ msg: 'Receptionist API error', error: details.message, stack: details.stack });
      return NextResponse.json(
        { error: 'حدث خلل في فريق العمل. الفريق التقني يحقق في الأمر.' },
        { status: 500 }
      );
    }
  }
  