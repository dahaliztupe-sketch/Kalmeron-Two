import { NextRequest, NextResponse } from 'next/server';
import { listSkills, consolidateSkills } from '@/src/lib/evolution/learning-loop';

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'default';
  try {
    const skills = await listSkills(workspaceId);
    return NextResponse.json({ skills });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { workspaceId } = await req.json();
  try {
    const report = await consolidateSkills(workspaceId || 'default');
    return NextResponse.json({ report });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
