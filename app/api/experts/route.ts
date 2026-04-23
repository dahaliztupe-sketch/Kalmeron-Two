import { NextRequest, NextResponse } from 'next/server';
import { createExpertFromDescription, saveExpert, listExperts, loadExpert, invokeExpert } from '@/src/ai/experts/expert-factory';

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || undefined;
  try {
    const experts = await listExperts({ workspaceId });
    return NextResponse.json({ experts });
  } catch (e: any) {
    return NextResponse.json({ experts: [], error: e?.message });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    if (body.action === 'invoke') {
      const out = await invokeExpert(body.expertId, body.message);
      return NextResponse.json({ output: out });
    }
    const { description, creatorId, workspaceId } = body;
    if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 });
    const expert = await createExpertFromDescription(description, creatorId || 'anonymous', { workspaceId });
    const id = await saveExpert(expert);
    return NextResponse.json({ expert: { ...expert, id } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
