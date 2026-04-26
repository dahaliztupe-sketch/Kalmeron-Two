import { NextResponse, NextRequest } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { revokeSubscription } from '@/src/lib/webhooks/dispatcher';
import { writeAudit, extractClientInfo } from '@/src/lib/audit/log';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const h = req.headers.get('authorization') || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let userId: string;
  try { userId = (await adminAuth.verifyIdToken(t)).uid; } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); }
  const { id } = await params;
  const ok = await revokeSubscription(id, userId);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  writeAudit({
    actorId: userId, actorType: 'user', action: 'revoke', resource: 'webhook',
    resourceId: id, success: true, ...extractClientInfo(req),
  }).catch(() => {});
  return NextResponse.json({ success: true });
}
