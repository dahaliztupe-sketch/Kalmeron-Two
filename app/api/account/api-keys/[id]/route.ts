import { NextResponse, NextRequest } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { revokeApiKey } from '@/src/lib/security/api-keys';
import { writeAudit, extractClientInfo } from '@/src/lib/audit/log';

export const runtime = 'nodejs';

async function uid(req: NextRequest) {
  const h = req.headers.get('authorization') || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return null;
  try { return (await adminAuth.verifyIdToken(t)).uid; } catch { return null; }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await uid(req);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const ok = await revokeApiKey(id, userId);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  writeAudit({
    actorId: userId,
    actorType: 'user',
    action: 'revoke',
    resource: 'api_key',
    resourceId: id,
    success: true,
    ...extractClientInfo(req as any),
  }).catch(() => {});
  return NextResponse.json({ success: true });
}
