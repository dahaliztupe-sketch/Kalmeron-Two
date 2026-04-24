/**
 * Consent ledger — see `docs/CONSENT_LEDGER.md` for the contract and legal basis.
 *
 * - Append-only: `withdrawConsent` writes a NEW event (`granted: false`) rather
 *   than mutating the previous one. The whole history is the legal evidence.
 * - Each event is also mirrored to the immutable `audit_logs` collection.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue, type Timestamp } from 'firebase-admin/firestore';
import { writeAudit } from '@/src/lib/audit/log';

const COL = 'consent_events';

export type ConsentType =
  | 'tos'
  | 'privacy'
  | 'marketing_email'
  | 'whatsapp_outreach'
  | 'data_export'
  | 'ai_training_optout';

export type ConsentSource = 'signup' | 'settings' | 'modal' | 'api';

export interface ConsentEvent {
  userId: string;
  workspaceId?: string;
  consentType: ConsentType;
  policyVersion: string;
  granted: boolean;
  ip?: string;
  userAgent?: string;
  source: ConsentSource;
  collectedAt?: Timestamp;
}

export interface ConsentEventOut extends Omit<ConsentEvent, 'collectedAt'> {
  id: string;
  collectedAt: Timestamp | null;
}

/** Record a granted-or-withdrawn event. Always APPEND. */
export async function recordConsent(
  e: Omit<ConsentEvent, 'collectedAt'>,
): Promise<string> {
  const ref = await adminDb.collection(COL).add({
    ...e,
    collectedAt: FieldValue.serverTimestamp(),
  });
  await writeAudit({
    actorId: e.userId,
    actorType: 'user',
    action: e.granted ? 'create' : 'revoke',
    resource: 'consent',
    resourceId: ref.id,
    workspaceId: e.workspaceId,
    success: true,
    metadata: {
      consentType: e.consentType,
      policyVersion: e.policyVersion,
      source: e.source,
    },
    ip: e.ip,
    userAgent: e.userAgent,
  });
  return ref.id;
}

/** Convenience wrapper. */
export async function grantConsent(args: {
  userId: string;
  workspaceId?: string;
  consentType: ConsentType;
  policyVersion: string;
  source: ConsentSource;
  ip?: string;
  userAgent?: string;
}): Promise<string> {
  return recordConsent({ ...args, granted: true });
}

/** Convenience wrapper — writes a NEW event (`granted: false`). */
export async function withdrawConsent(args: {
  userId: string;
  workspaceId?: string;
  consentType: ConsentType;
  policyVersion: string;
  source: ConsentSource;
  ip?: string;
  userAgent?: string;
}): Promise<string> {
  return recordConsent({ ...args, granted: false });
}

/** Latest state of a single consent type for a user. */
export async function hasConsent(
  userId: string,
  consentType: ConsentType,
): Promise<boolean> {
  const snap = await adminDb
    .collection(COL)
    .where('userId', '==', userId)
    .where('consentType', '==', consentType)
    .orderBy('collectedAt', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return false;
  const doc = snap.docs[0];
  if (!doc) return false;
  const data = doc.data() as { granted?: boolean };
  return data.granted === true;
}

/** Full history for the user (most recent first). */
export async function listConsent(userId: string, limit = 100): Promise<ConsentEventOut[]> {
  const snap = await adminDb
    .collection(COL)
    .where('userId', '==', userId)
    .orderBy('collectedAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as Partial<ConsentEvent> & { collectedAt?: Timestamp };
    return {
      id: d.id,
      userId: data.userId ?? userId,
      workspaceId: data.workspaceId,
      consentType: data.consentType ?? 'tos',
      policyVersion: data.policyVersion ?? 'unknown',
      granted: data.granted ?? false,
      source: data.source ?? 'api',
      ip: data.ip,
      userAgent: data.userAgent,
      collectedAt: data.collectedAt ?? null,
    };
  });
}

/**
 * Withdraw EVERY granted consent. Used by `/api/account/delete` so the legal
 * record reflects the user's final wishes before the 30-day deletion window.
 */
export async function withdrawAll(args: {
  userId: string;
  ip?: string;
  userAgent?: string;
}): Promise<number> {
  const types: ConsentType[] = [
    'tos', 'privacy', 'marketing_email',
    'whatsapp_outreach', 'data_export', 'ai_training_optout',
  ];
  let count = 0;
  for (const t of types) {
    const granted = await hasConsent(args.userId, t);
    if (granted) {
      await withdrawConsent({
        userId: args.userId,
        consentType: t,
        policyVersion: 'account-deletion@1',
        source: 'api',
        ip: args.ip,
        userAgent: args.userAgent,
      });
      count += 1;
    }
  }
  return count;
}
