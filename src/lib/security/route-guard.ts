/**
 * Unified route guard: authentication + rate-limiting + zod validation.
 * Drop-in wrapper for App Router route handlers.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodType } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';
import { createRequestLogger } from '@/src/lib/logger';

export interface AuthedRequest<T = unknown> {
  req: NextRequest;
  userId: string | null;
  body: T;
  log: ReturnType<typeof createRequestLogger>;
  requestId: string;
}

export interface GuardOptions<T extends ZodType> {
  /** Require a valid Firebase ID token in the Authorization header. */
  requireAuth?: boolean;
  /** Zod schema for POST/PUT body. `z.object({})` means empty payload allowed. */
  schema?: T;
  /** Requests per window (defaults to 30/min). */
  rateLimit?: { limit: number; windowMs: number; scope?: string };
}

async function verifyAuth(req: NextRequest): Promise<string | null> {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export function guardedRoute<T extends ZodType>(
  handler: (ctx: AuthedRequest<z.infer<T>>) => Promise<NextResponse> | Promise<Response>,
  opts: GuardOptions<T> = {}
) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
    const log = createRequestLogger(requestId);

    // 1) Rate limit
    const rl = rateLimit(req, opts.rateLimit ?? { limit: 30, windowMs: 60_000 });
    if (!rl.success) {
      log.warn?.({ path: req.nextUrl.pathname }, 'rate_limited');
      return rateLimitResponse();
    }

    // 2) Auth
    let userId: string | null = null;
    if (opts.requireAuth) {
      userId = await verifyAuth(req);
      if (!userId) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
    } else {
      userId = await verifyAuth(req); // optional — best-effort
    }

    // 3) Validate body (POST/PUT/PATCH only)
    let body: any = {};
    const method = req.method.toUpperCase();
    if (opts.schema && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const raw = await req.json();
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'invalid_body', details: parsed.error.flatten() },
            { status: 400 }
          );
        }
        body = parsed.data;
      } catch {
        return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
      }
    }

    try {
      const res = await handler({ req, userId, body, log, requestId });
      if (res instanceof NextResponse) {
        res.headers.set('X-Request-ID', requestId);
      }
      return res;
    } catch (err: any) {
      log.error?.({ err: err?.message || String(err), path: req.nextUrl.pathname }, 'route_error');
      return NextResponse.json(
        { error: 'internal_error', message: err?.message || 'unknown' },
        { status: 500, headers: { 'X-Request-ID': requestId } }
      );
    }
  };
}
