/**
 * Outbound webhooks — subscribe URLs and deliver signed events with retry.
 *
 * Security:
 *   - URL must pass `assertSafeUrlNode` (SSRF guard) at subscribe time AND
 *     again immediately before each delivery (DNS rebinding defense).
 *   - Body is HMAC-SHA256 signed; receivers verify via `verifyIncomingSignature`.
 */
import crypto from 'crypto';
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue, type Timestamp } from 'firebase-admin/firestore';
import { writeAudit } from '@/src/lib/audit/log';
import { assertSafeUrlNode, validateOutboundUrl } from '@/src/lib/security/url-allowlist';

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
  createdAt?: Timestamp;
  revokedAt?: Timestamp;
}

interface WebhookSubscriptionRecord extends WebhookSubscription {
  id: string;
}

function sign(body: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

export async function createSubscription(args: {
  workspaceId: string;
  ownerId: string;
  url: string;
  events: WebhookEvent[];
}): Promise<{ id: string; secret: string }> {
  // SSRF guard at subscribe time — reject obviously bad URLs early.
  const urlCheck = validateOutboundUrl(args.url);
  if (!urlCheck.ok) {
    throw new Error(`webhook_url_rejected:${urlCheck.reason ?? 'unknown'}`);
  }
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

export async function listSubscriptions(workspaceId: string): Promise<Array<{
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: number | null;
}>> {
  const snap = await adminDb
    .collection(COL)
    .where('workspaceId', '==', workspaceId)
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as Partial<WebhookSubscription> & { createdAt?: Timestamp };
    return {
      id: d.id,
      url: data.url ?? '',
      events: (data.events ?? []) as WebhookEvent[],
      active: data.active ?? false,
      createdAt: data.createdAt?.toMillis?.() ?? null,
    };
  });
}

export async function revokeSubscription(id: string, ownerId: string): Promise<boolean> {
  const ref = adminDb.collection(COL).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  const data = doc.data() as Partial<WebhookSubscription> | undefined;
  if (!data || data.ownerId !== ownerId) return false;
  await ref.update({ active: false, revokedAt: FieldValue.serverTimestamp() });
  return true;
}

async function deliverOne(
  sub: WebhookSubscriptionRecord,
  event: WebhookEvent,
  payload: unknown,
): Promise<{ ok: boolean; status: number; attempt?: number; error?: string }> {
  // SSRF guard — re-check resolution right before opening a socket.
  const safe = await assertSafeUrlNode(sub.url);
  if (!safe.ok) {
    await adminDb.collection(DELIV).add({
      subscriptionId: sub.id,
      workspaceId: sub.workspaceId,
      event,
      status: 0,
      error: `ssrf_blocked:${safe.reason ?? 'unknown'}`,
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
      errorMessage: `ssrf_blocked:${safe.reason ?? 'unknown'}`,
    });
    return { ok: false, status: 0, error: `ssrf_blocked:${safe.reason ?? 'unknown'}` };
  }

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
        redirect: 'manual', // never follow redirects (SSRF bypass surface)
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
    } catch (e: unknown) {
      lastError = e instanceof Error ? e.message : String(e);
    }
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
  payload: unknown,
): Promise<{ delivered: number; total?: number }> {
  const snap = await adminDb
    .collection(COL)
    .where('workspaceId', '==', workspaceId)
    .where('active', '==', true)
    .get();
  const subs: WebhookSubscriptionRecord[] = snap.docs.map((d) => {
    const data = d.data() as WebhookSubscription;
    return { ...data, id: d.id };
  });
  const matching = subs.filter((s) => s.events.includes(event));
  if (matching.length === 0) return { delivered: 0 };
  const results = await Promise.all(matching.map((s) => deliverOne(s, event, payload)));
  return { delivered: results.filter((r) => r.ok).length, total: matching.length };
}

export function verifyIncomingSignature(body: string, signature: string, secret: string) {
  const expected = 'sha256=' + sign(body, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
