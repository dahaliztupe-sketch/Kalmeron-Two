import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { provisionVM, runTaskOnVM } from '@/src/lib/virtual-office/vm-manager';

export async function GET() {
  try {
    const snap = await adminDb.collection('virtual_office_vms').limit(100).get();
    const vms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ vms });
  } catch (e: any) {
    return NextResponse.json({ vms: [], error: e?.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const { action, agentId, departmentId, vmId, task, timeoutMs } = await req.json();
  try {
    if (action === 'provision') {
      const vm = await provisionVM(agentId, departmentId || 'general');
      return NextResponse.json({ vm });
    }
    if (action === 'run') {
      const result = await runTaskOnVM(vmId, task, timeoutMs || 60000);
      return NextResponse.json({ result });
    }
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
