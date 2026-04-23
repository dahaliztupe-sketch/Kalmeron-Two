/**
 * Immutable audit log — append-only Firestore collection `audit_logs`.
 * Writes should never be mutated or deleted by application code (enforce via rules).
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'read'
  | 'login'
  | 'logout'
  | 'impersonate'
  | 'export'
  | 'revoke'
  | 'agent_run'
  | 'webhook_dispatch'
  | 'quota_exceeded';

export interface AuditEntry {
  actorId: string | null;
  actorType: 'user' | 'api_key' | 'system' | 'admin';
  action: AuditAction;
  resource: string;
  resourceId?: string;
  workspaceId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
}

export async function writeAudit(entry: AuditEntry): Promise<string> {
  try {
    const doc = await adminDb.collection('audit_logs').add({
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    });
    return doc.id;
  } catch (e) {
    console.error('[audit] write failed', e);
    return '';
  }
}

export async function queryAudit(opts: {
  workspaceId?: string;
  actorId?: string;
  action?: AuditAction;
  resource?: string;
  limit?: number;
}) {
  let q: FirebaseFirestore.Query = adminDb.collection('audit_logs');
  if (opts.workspaceId) q = q.where('workspaceId', '==', opts.workspaceId);
  if (opts.actorId) q = q.where('actorId', '==', opts.actorId);
  if (opts.action) q = q.where('action', '==', opts.action);
  if (opts.resource) q = q.where('resource', '==', opts.resource);
  q = q.orderBy('createdAt', 'desc').limit(opts.limit ?? 50);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function extractClientInfo(req: Request | { headers: Headers }) {
  const h = (req as any).headers as Headers;
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    undefined;
  const userAgent = h.get('user-agent') || undefined;
  return { ip, userAgent };
}
