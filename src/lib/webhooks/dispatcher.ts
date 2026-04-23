/**
 * Outbound webhooks — subscribe URLs and deliver signed events with retry.
 */
import crypto from 'crypto';
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeAudit } from '@/src/lib/audit/log';

export type WebhookEvent =
  | 'launch.completed'
  | 'meeting.completed'
  | 'expert.created'
  | 'agent.run.completed';

const COL = 'webhook_subscriptions';
const DELIV = 'webhook_deliveries';

export interface WebhookSubscription {
  id?: string;
  workspaceId: string;
  ownerId: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt?: FirebaseFirestore.Timestamp;
}

function sign(body: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

export async function createSubscription(args: {
  workspaceId: string;
  ownerId: string;
  url: string;
  events: WebhookEvent[];
}) {
  const secret = crypto.randomBytes(24).toString('base64url');
  const ref = await adminDb.collection(COL).add({
    workspaceId: args.workspaceId,
    ownerId: args.ownerId,
    url: args.url,
    events: args.events,
    secret,
    active: true,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id, secret };
}

export async function listSubscriptions(workspaceId: string) {
  const snap = await adminDb
    .collection(COL)
    .where('workspaceId', '==', workspaceId)
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      url: data.url,
      events: data.events,
      active: data.active,
      createdAt: data.createdAt?.toMillis?.() ?? null,
    };
  });
}

export async function revokeSubscription(id: string, ownerId: string): Promise<boolean> {
  const ref = adminDb.collection(COL).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  if ((doc.data() as any).ownerId !== ownerId) return false;
  await ref.update({ active: false, revokedAt: FieldValue.serverTimestamp() });
  return true;
}

async function deliverOne(sub: any, event: WebhookEvent, payload: any) {
  const body = JSON.stringify({ event, timestamp: Date.now(), data: payload });
  const signature = sign(body, sub.secret);
  const maxAttempts = 3;
  let lastStatus = 0;
  let lastError = '';
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(sub.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-kalmeron-event': event,
          'x-kalmeron-signature': `sha256=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      lastStatus = res.status;
      if (res.ok) {
        await adminDb.collection(DELIV).add({
          subscriptionId: sub.id,
          workspaceId: sub.workspaceId,
          event,
          status: res.status,
          attempt,
          success: true,
          deliveredAt: FieldValue.serverTimestamp(),
        });
        return { ok: true, status: res.status, attempt };
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
    }
    // exponential backoff: 500ms, 2s
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 500 * attempt * attempt));
    }
  }
  await adminDb.collection(DELIV).add({
    subscriptionId: sub.id,
    workspaceId: sub.workspaceId,
    event,
    status: lastStatus,
    error: lastError,
    success: false,
    deliveredAt: FieldValue.serverTimestamp(),
  });
  await writeAudit({
    actorId: null,
    actorType: 'system',
    action: 'webhook_dispatch',
    resource: 'webhook',
    resourceId: sub.id,
    workspaceId: sub.workspaceId,
    success: false,
    errorMessage: lastError || `http_${lastStatus}`,
  });
  return { ok: false, status: lastStatus, error: lastError };
}

export async function dispatchEvent(
  workspaceId: string,
  event: WebhookEvent,
  payload: any
) {
  const snap = await adminDb
    .collection(COL)
    .where('workspaceId', '==', workspaceId)
    .where('active', '==', true)
    .get();
  const subs = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .filter((s) => (s.events as WebhookEvent[]).includes(event));
  if (subs.length === 0) return { delivered: 0 };
  const results = await Promise.all(subs.map((s) => deliverOne(s, event, payload)));
  return { delivered: results.filter((r) => r.ok).length, total: subs.length };
}

export function verifyIncomingSignature(body: string, signature: string, secret: string) {
  const expected = 'sha256=' + sign(body, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
