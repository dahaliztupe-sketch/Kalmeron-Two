/**
 * GET /api/cron/reset-credits
 *
 * Called by an external cron scheduler (e.g. Vercel Cron, GitHub Actions,
 * or any HTTP-based scheduler) to trigger daily and monthly credit resets.
 *
 * Security: protected by `Authorization: Bearer <CRON_SECRET>`.
 * Set CRON_SECRET in environment variables and configure your scheduler
 * to send: `Authorization: Bearer <value>`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { resetDailyCredits, resetMonthlyCredits } from '@/src/lib/billing/reset-scheduler';
import { logger } from '@/src/lib/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    logger.warn({ event: 'cron_reset_credits_no_secret' });
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    logger.warn({ event: 'cron_reset_credits_unauthorized', ip: req.headers.get('x-forwarded-for') });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  const results: Record<string, unknown> = {};

  try {
    const dailyResult = await resetDailyCredits();
    results.daily = { ok: true, usersReset: dailyResult.usersReset };
    logger.info({ event: 'cron_daily_credits_reset', usersReset: dailyResult.usersReset });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    logger.error({ event: 'cron_daily_credits_reset_failed', error: msg });
    results.daily = { ok: false, error: msg, usersReset: 0 };
  }

  try {
    const monthlyResult = await resetMonthlyCredits();
    results.monthly = { ok: true, usersReset: monthlyResult.usersReset };
    logger.info({ event: 'cron_monthly_credits_reset', usersReset: monthlyResult.usersReset });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    logger.error({ event: 'cron_monthly_credits_reset_failed', error: msg });
    results.monthly = { ok: false, error: msg, usersReset: 0 };
  }

  const durationMs = Date.now() - startedAt;
  logger.info({ event: 'cron_reset_credits_done', durationMs, results });

  return NextResponse.json({ ok: true, durationMs, results });
}
