import { adminDb } from '@/src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export interface ResetResult {
  usersReset: number;
}

export async function resetDailyCredits(): Promise<ResetResult> {
  const now = Timestamp.now();
  const wallets = await adminDb
    .collection('user_credits')
    .where('dailyResetAt', '<=', now)
    .get();

  const batch = adminDb.batch();
  wallets.forEach((doc: QueryDocumentSnapshot) => {
    const wallet = doc.data();
    batch.update(doc.ref, {
      dailyBalance: wallet['dailyLimit'],
      dailyResetAt: new Timestamp(now.seconds + 86400, 0),
      lastUpdated: now,
    });
  });
  await batch.commit();
  return { usersReset: wallets.size };
}

export async function resetMonthlyCredits(): Promise<ResetResult> {
  const now = Timestamp.now();
  const wallets = await adminDb
    .collection('user_credits')
    .where('monthlyResetAt', '<=', now)
    .get();

  const batch = adminDb.batch();
  wallets.forEach((doc: QueryDocumentSnapshot) => {
    const wallet = doc.data();
    const unusedMonthly = (wallet['monthlyBalance'] as number) || 0;
    const rolloverCap = ((wallet['monthlyLimit'] as number) || 0) * 2;
    const newRollover = Math.min(
      ((wallet['rolledOverCredits'] as number) || 0) + unusedMonthly,
      rolloverCap,
    );

    batch.update(doc.ref, {
      monthlyBalance: wallet['monthlyLimit'],
      rolledOverCredits: newRollover,
      monthlyResetAt: new Timestamp(now.seconds + 2592000, 0),
      lastUpdated: now,
    });
  });
  await batch.commit();
  return { usersReset: wallets.size };
}
