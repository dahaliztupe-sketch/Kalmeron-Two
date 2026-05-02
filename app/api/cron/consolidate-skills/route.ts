/**
 * Daily Skill Consolidation Cron — iterates ALL workspaces with skills and
 * runs consolidation per-workspace. Strict tenant isolation is preserved.
 *
 * Auth (any one):
 *   - Header `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron / generic)
 *   - Header `x-cron-secret: ${CRON_SECRET}`        (Replit Scheduled Deploys)
 *
 * If CRON_SECRET is not set, the endpoint refuses (503) — never run open.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  consolidateSkills,
  listWorkspaceIdsWithSkills,
  type ConsolidationReport,
} from '@/src/lib/learning/loop';
import { sanitizeLogValue } from '@/src/lib/security/sanitize-log';
import { logger } from '@/src/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorized(req: NextRequest, secret: string): boolean {
  const bearer = req.headers.get('Authorization');
  if (bearer === `Bearer ${secret}`) return true;
  if (req.headers.get('x-cron-secret') === secret) return true;
  return false;
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'cron_disabled_no_secret' }, { status: 503 });
  }
  if (!authorized(req, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const single = url.searchParams.get('workspaceId');

  let workspaceIds: string[];
  if (single) {
    workspaceIds = [single];
  } else {
    workspaceIds = await listWorkspaceIdsWithSkills();
  }

  const totals: ConsolidationReport = { scanned: 0, merged: 0, pruned: 0, refined: 0 };
  const perWorkspace: Array<{ workspaceId: string; report: ConsolidationReport }> = [];

  for (const wid of workspaceIds) {
    try {
      const report = await consolidateSkills(wid);
      totals.scanned += report.scanned;
      totals.merged += report.merged;
      totals.pruned += report.pruned;
      totals.refined += report.refined;
      perWorkspace.push({ workspaceId: wid, report });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'failed';
      logger.error({ event: 'consolidate_skills_failed', workspaceId: sanitizeLogValue(wid), error: sanitizeLogValue(msg) });
    }
  }

  return NextResponse.json({ ok: true, totals, perWorkspace, workspaces: workspaceIds.length });
}

export const POST = handle;
export const GET = handle;
