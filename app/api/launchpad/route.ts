import { NextRequest, NextResponse } from 'next/server';
import { launchStartup, getLaunchRun } from '@/src/ai/launchpad/pipeline';

export async function POST(req: NextRequest) {
  const { idea, workspaceId } = await req.json();
  if (!idea) return NextResponse.json({ error: 'idea required' }, { status: 400 });
  try {
    const result = await launchStartup({ idea, workspaceId: workspaceId || 'default' });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get('runId');
  if (!runId) return NextResponse.json({ error: 'runId required' }, { status: 400 });
  const run = await getLaunchRun(runId);
  return NextResponse.json({ run });
}
