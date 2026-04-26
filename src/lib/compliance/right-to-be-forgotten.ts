import { adminDb } from '@/src/lib/firebase-admin';
import { ImmutableAuditTrail } from './audit-trail';
import { createHash, createHmac } from 'crypto';
import { logger } from '@/src/lib/logger';

const log = logger.child({ component: 'right-to-be-forgotten' });

function pepperedHash(value: string): string {
  const pepper =
    process.env.COMPLIANCE_HASH_PEPPER ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    'kalmeron-default-compliance-pepper';
  const key = createHash('sha256').update(pepper).digest();
  return createHmac('sha256', key).update(value).digest('hex');
}

/**
 * Bulk-delete every document a user owns across the canonical collections.
 *
 * Previous implementation had two bugs:
 *   1. Imported `db` from `@/src/lib/firebase` (the **client SDK**) which
 *      cannot run server-side without an authenticated user context. The
 *      function silently failed for any caller other than the user
 *      themselves.
 *   2. Used a single Firestore batch even though batches are capped at 500
 *      operations — users with > 500 documents in any one collection got
 *      `INVALID_ARGUMENT: cannot write more than 500 entities in a single
 *      call` and the deletion aborted half-way.
 *
 * Both fixes (admin SDK + 400-op chunking) are required for GDPR Art. 17
 * compliance.
 */
const COLLECTIONS = [
  'users',
  'chat_history',
  'ideas',
  'business_plans',
  'credit_transactions',
  'user_memory',
  'digital_twin',
] as const;

const CHUNK_SIZE = 400; // safely under Firestore's 500-op batch limit

export async function executeRightToBeForgotten(
  userId: string,
  requestId: string,
): Promise<{ collection: string; deleted: number }[]> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId is required');
  }

  const auditTrail = new ImmutableAuditTrail();
  await auditTrail.logDecision({
    agent_id: 'compliance-agent',
    agent_role: 'compliance',
    action: 'right_to_be_forgotten',
    intent: `User ${userId} requested data deletion per GDPR Art. 17`,
    tools_called: ['delete_user_data'],
    input_data_hash: pepperedHash(userId),
    output_summary: 'Initiated deletion process',
    trust_level: 'high',
    user_id: userId,
    session_id: requestId,
    risk_assessment: { level: 'low', justification: 'User-initiated request' },
  });

  const summary: { collection: string; deleted: number }[] = [];

  for (const collection of COLLECTIONS) {
    let totalDeleted = 0;
    // Loop until the query returns no documents. Each iteration:
    //  - reads up to CHUNK_SIZE docs
    //  - deletes them in a single batch (within the 500 cap)
    //  - re-runs the query (since the deleted docs are gone, the next page
    //    will surface the next CHUNK_SIZE docs naturally).
    // This is safe because we never read a "next" cursor; we always fetch
    // the head of the still-matching set.
     
    while (true) {
      const snapshot = await adminDb
        .collection(collection)
        .where('userId', '==', userId)
        .limit(CHUNK_SIZE)
        .get();
      if (snapshot.empty) break;
      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      totalDeleted += snapshot.size;
      log.info({ collection, deleted: snapshot.size, requestId }, 'rtbf_chunk_deleted');
      // If we got fewer than CHUNK_SIZE, we've drained the collection.
      if (snapshot.size < CHUNK_SIZE) break;
    }
    summary.push({ collection, deleted: totalDeleted });
  }

  log.info({ userId: pepperedHash(userId), requestId, summary }, 'rtbf_complete');
  return summary;
}
