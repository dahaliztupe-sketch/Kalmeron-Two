import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { conveneMeeting, detectCollaborationOpportunity } from '@/src/ai/orchestrator/virtual-meeting';

export async function GET() {
  try {
    const snap = await adminDb.collection('virtual_meetings').orderBy('createdAt', 'desc').limit(50).get();
    const meetings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const opportunities = await detectCollaborationOpportunity();
    return NextResponse.json({ meetings, opportunities });
  } catch (e: any) {
    return NextResponse.json({ meetings: [], opportunities: [], error: e?.message });
  }
}

export async function POST(req: NextRequest) {
  const { topic, departmentIds, context } = await req.json();
  if (!topic || !Array.isArray(departmentIds) || departmentIds.length === 0) {
    return NextResponse.json({ error: 'topic and departmentIds required' }, { status: 400 });
  }
  try {
    const meeting = await conveneMeeting(topic, departmentIds, context || {});
    return NextResponse.json({ meeting });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
