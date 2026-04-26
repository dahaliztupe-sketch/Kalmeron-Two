// @ts-nocheck
/**
 * Typed registry of side-effecting agent actions ("tools that do things").
 *
 * Every action declares:
 *   - id, label, description
 *   - input schema (zod)
 *   - whether it requires explicit user approval before execution
 *   - an `execute(input, ctx)` handler
 *
 * Agents request actions via `requestAction(...)` which writes a row to
 * Firestore `agent_actions` with status='pending'. The /inbox page lists
 * pending rows; on approval the registered handler runs.
 *
 * External integrations (email, WhatsApp) are NO-OP'd here when the
 * required env vars are missing — execution still succeeds and the row
 * is marked 'executed_noop' so the audit trail is preserved.
 */
import { z } from 'zod';
import { adminDb } from '@/src/lib/firebase-admin';

export type ActionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'executed_noop'
  | 'failed';

export interface ActionContext {
  userId: string;
  workspaceId?: string;
}

export interface ActionDefinition<TInput = unknown> {
  id: string;
  label: string;
  description: string;
  requiresApproval: boolean;
  schema: z.ZodSchema<TInput>;
  execute: (input: TInput, ctx: ActionContext) => Promise<{ ok: true; result?: unknown; noop?: boolean } | { ok: false; error: string }>;
}

const REGISTRY = new Map<string, ActionDefinition>();

export function registerAction<T>(def: ActionDefinition<T>) {
  REGISTRY.set(def.id, def as ActionDefinition);
}

export function getAction(id: string) {
  return REGISTRY.get(id);
}

export function listActions() {
  return Array.from(REGISTRY.values()).map((a) => ({
    id: a.id,
    label: a.label,
    description: a.description,
    requiresApproval: a.requiresApproval,
  }));
}

// ---------- Built-in actions ----------

registerAction({
  id: 'send_email',
  label: 'إرسال بريد إلكتروني',
  description: 'يرسل بريداً إلكترونياً نيابة عن المستخدم (يتطلب RESEND_API_KEY).',
  requiresApproval: true,
  schema: z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(8000),
  }),
  async execute(input) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      return { ok: true, noop: true, result: { reason: 'no_resend_key', preview: input } };
    }
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Kalmeron <noreply@kalmeron.app>',
          to: input.to,
          subject: input.subject,
          text: input.body,
        }),
      });
      if (!r.ok) return { ok: false, error: `resend_${r.status}` };
      return { ok: true, result: await r.json() };
    } catch (e: unknown) {
      return { ok: false, error: e?.message || 'send_failed' };
    }
  },
});

registerAction({
  id: 'create_invoice_draft',
  label: 'إنشاء مسودة فاتورة',
  description: 'يحفظ مسودة فاتورة في Firestore لمراجعتها لاحقاً.',
  requiresApproval: true,
  schema: z.object({
    customerName: z.string().min(1).max(200),
    amount: z.number().positive(),
    currency: z.string().default('EGP'),
    notes: z.string().max(1000).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('invoices').add({
      ...input,
      userId: ctx.userId,
      status: 'draft',
      createdAt: new Date(),
    });
    return { ok: true, result: { invoiceId: ref.id } };
  },
});

registerAction({
  id: 'schedule_meeting',
  label: 'جدولة اجتماع',
  description: 'يحفظ اجتماعاً في تقويم المستخدم داخل التطبيق.',
  requiresApproval: true,
  schema: z.object({
    title: z.string().min(1).max(200),
    startsAt: z.string(), // ISO
    durationMinutes: z.number().int().min(5).max(480).default(30),
    attendees: z.array(z.string().email()).default([]),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('meetings').add({
      ...input,
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { meetingId: ref.id } };
  },
});

registerAction({
  id: 'send_whatsapp',
  label: 'إرسال رسالة واتساب',
  description: 'يرسل رسالة عبر WhatsApp Business API (يتطلب WHATSAPP_TOKEN).',
  requiresApproval: true,
  schema: z.object({
    to: z.string().min(8).max(20),
    text: z.string().min(1).max(4000),
  }),
  async execute(input) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId) {
      return { ok: true, noop: true, result: { reason: 'no_whatsapp_creds', preview: input } };
    }
    try {
      const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: input.to,
          type: 'text',
          text: { body: input.text },
        }),
      });
      if (!r.ok) return { ok: false, error: `whatsapp_${r.status}` };
      return { ok: true, result: await r.json() };
    } catch (e: unknown) {
      return { ok: false, error: e?.message || 'whatsapp_failed' };
    }
  },
});

// ---------- Action requests (inbox) ----------

const ACTIONS_COLLECTION = 'agent_actions';

export async function requestAction(opts: {
  userId: string;
  actionId: string;
  input: unknown;
  rationale?: string;
  requestedBy?: string;
  workspaceId?: string;
}): Promise<{ id: string; status: ActionStatus }> {
  const def = REGISTRY.get(opts.actionId);
  if (!def) throw new Error(`unknown_action_${opts.actionId}`);
  const parsed = def.schema.safeParse(opts.input);
  if (!parsed.success) throw new Error(`invalid_input: ${parsed.error.message}`);

  if (!adminDb?.collection) throw new Error('firestore_unavailable');

  // Auto-execute if action does not require approval.
  if (!def.requiresApproval) {
    const r = await def.execute(parsed.data, { userId: opts.userId, workspaceId: opts.workspaceId });
    const status: ActionStatus = r.ok ? (r.noop ? 'executed_noop' : 'executed') : 'failed';
    const ref = await adminDb.collection(ACTIONS_COLLECTION).add({
      userId: opts.userId,
      workspaceId: opts.workspaceId || null,
      actionId: opts.actionId,
      label: def.label,
      input: parsed.data,
      rationale: opts.rationale || null,
      requestedBy: opts.requestedBy || 'agent',
      status,
      result: r.ok ? r.result || null : null,
      error: r.ok ? null : r.error,
      createdAt: new Date(),
      executedAt: new Date(),
    });
    return { id: ref.id, status };
  }

  const ref = await adminDb.collection(ACTIONS_COLLECTION).add({
    userId: opts.userId,
    workspaceId: opts.workspaceId || null,
    actionId: opts.actionId,
    label: def.label,
    input: parsed.data,
    rationale: opts.rationale || null,
    requestedBy: opts.requestedBy || 'agent',
    status: 'pending' as ActionStatus,
    createdAt: new Date(),
  });
  return { id: ref.id, status: 'pending' };
}

export async function decideAction(opts: {
  userId: string;
  actionDocId: string;
  decision: 'approve' | 'reject';
  editedInput?: unknown;
}): Promise<{ status: ActionStatus; result?: unknown; error?: string }> {
  if (!adminDb?.collection) throw new Error('firestore_unavailable');
  const ref = adminDb.collection(ACTIONS_COLLECTION).doc(opts.actionDocId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('action_not_found');
  const data: unknown = snap.data();
  if (data.userId !== opts.userId) throw new Error('forbidden');
  if (data.status !== 'pending') throw new Error(`already_${data.status}`);

  if (opts.decision === 'reject') {
    await ref.update({ status: 'rejected', decidedAt: new Date() });
    return { status: 'rejected' };
  }

  const def = REGISTRY.get(data.actionId);
  if (!def) {
    await ref.update({ status: 'failed', error: 'unknown_action', decidedAt: new Date() });
    return { status: 'failed', error: 'unknown_action' };
  }
  const inputCandidate = opts.editedInput ?? data.input;
  const parsed = def.schema.safeParse(inputCandidate);
  if (!parsed.success) {
    await ref.update({ status: 'failed', error: 'invalid_input', decidedAt: new Date() });
    return { status: 'failed', error: 'invalid_input' };
  }
  const r = await def.execute(parsed.data, { userId: data.userId, workspaceId: data.workspaceId });
  const status: ActionStatus = r.ok ? (r.noop ? 'executed_noop' : 'executed') : 'failed';
  await ref.update({
    status,
    input: parsed.data,
    result: r.ok ? r.result || null : null,
    error: r.ok ? null : r.error,
    decidedAt: new Date(),
    executedAt: new Date(),
  });
  return { status, result: r.ok ? r.result : undefined, error: r.ok ? undefined : r.error };
}

export async function listInbox(userId: string, status?: ActionStatus): Promise<unknown[]> {
  if (!adminDb?.collection) return [];
  let q = adminDb.collection(ACTIONS_COLLECTION).where('userId', '==', userId);
  if (status) q = q.where('status', '==', status);
  const snap = await q.limit(200).get().catch(() => null);
  if (!snap || snap.empty) return [];
  const rows: unknown[] = [];
  snap.forEach((d: unknown) => rows.push({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));
  return rows;
}
