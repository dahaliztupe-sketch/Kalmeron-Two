// @ts-nocheck
/**
 * Marketplace — سوق مهام داخلي للوكلاء (مستوحى من EpochX).
 * Firestore collection: marketplace_jobs.
 * كل مهمة تحمل credits، assignee، وحالة (open|claimed|completed|cancelled).
 */
import { adminDb } from '@/src/lib/firebase-admin';

export interface MarketplaceJob {
  id?: string;
  userId: string;
  postedBy: string;
  title: string;
  description: string;
  credits: number;
  status: 'open' | 'claimed' | 'completed' | 'cancelled';
  claimedBy?: string;
  claimedAt?: Date;
  completedAt?: Date;
  result?: any;
  createdAt?: Date;
}

const col = () => adminDb.collection('marketplace_jobs');

export async function postJob(j: Omit<MarketplaceJob, 'status' | 'id' | 'createdAt'>) {
  const ref = await col().add({ ...j, status: 'open', createdAt: new Date() });
  return { id: ref.id, ...j, status: 'open' as const };
}

export async function listOpenJobs(userId: string, limit = 50) {
  const snap = await col().where('userId', '==', userId).where('status', '==', 'open').limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function claimJob(jobId: string, agentId: string) {
  const ref = col().doc(jobId);
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error('job_not_found');
    const data: any = snap.data();
    if (data.status !== 'open') throw new Error('job_not_open');
    tx.update(ref, { status: 'claimed', claimedBy: agentId, claimedAt: new Date() });
    return { id: jobId, ...data, status: 'claimed', claimedBy: agentId };
  });
}

export async function completeJob(jobId: string, result: any) {
  await col().doc(jobId).update({ status: 'completed', completedAt: new Date(), result });
  return { id: jobId, status: 'completed' as const };
}

export async function cancelJob(jobId: string) {
  await col().doc(jobId).update({ status: 'cancelled' });
  return { id: jobId, status: 'cancelled' as const };
}
