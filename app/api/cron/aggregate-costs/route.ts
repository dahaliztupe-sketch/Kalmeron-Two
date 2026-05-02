/**
 * Cost rollup cron — runs every 15 min (configured in vercel.json).
 *
 * Materializes hourly + daily rollup documents from `cost_events` so the
 * admin Cost Dashboard reads in O(1).
 */
import { NextRequest, NextResponse } from 'next/server';
import { aggregateRollup } from '@/src/lib/observability/cost-ledger';
import { logger } from '@/src/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

function authorized(req: NextRequest, secret: string): boolean {
  if (req.headers.get('Authorization') === `Bearer ${secret}`) return true;
  if (req.headers.get('x-cron-secret') === secret) return true;
  return false;
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'cron_disabled' }, { status: 503 });
  if (!authorized(req, secret)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const result = await aggregateRollup(2);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error({ event: 'cost_rollup_failed', error: msg });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
