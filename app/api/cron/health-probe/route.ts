/**
 * Vercel Cron health probe — runs every 5 minutes.
 *
 * - Calls the internal /api/health endpoint.
 * - If status === 'degraded', writes a Sentry breadcrumb + log entry.
 * - Auth is enforced via CRON_SECRET (same convention as other crons).
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(req: NextRequest, secret: string): boolean {
  if (req.headers.get('Authorization') === `Bearer ${secret}`) return true;
  if (req.headers.get('x-cron-secret') === secret) return true;
  return false;
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'cron_disabled' }, { status: 503 });
  }
  if (!authorized(req, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;

  const start = Date.now();
  let status: 'healthy' | 'degraded' | 'down' = 'down';
  let payload: unknown = null;
  try {
    const res = await fetch(`${baseUrl}/api/health`, { cache: 'no-store' });
    payload = await res.json();
    const obj = payload as { status?: string };
    status = obj.status === 'healthy' ? 'healthy' : obj.status === 'degraded' ? 'degraded' : 'down';
  } catch (e) {
    payload = { error: e instanceof Error ? e.message : String(e) };
    status = 'down';
  }
  const durationMs = Date.now() - start;

  // Log degradations loudly so Sentry / Vercel Logs alert on them.
  if (status !== 'healthy') {
    console.error(JSON.stringify({
      level: 'error',
      event: 'health_probe_degraded',
      status,
      durationMs,
      payload,
      timestamp: new Date().toISOString(),
    }));
  } else {
    console.log(JSON.stringify({
      level: 'info',
      event: 'health_probe_ok',
      durationMs,
      timestamp: new Date().toISOString(),
    }));
  }

  return NextResponse.json({ probe: status, durationMs, payload });
}

export const GET = handle;
export const POST = handle;
