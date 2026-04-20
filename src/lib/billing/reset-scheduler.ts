import { adminDb } from '@/src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function resetDailyCredits(): Promise<void> {
  const now = Timestamp.now();
  const wallets = await adminDb.collection('user_credits')
    .where('dailyResetAt', '<=', now)
    .get();

  const batch = adminDb.batch();
  wallets.forEach(doc => {
    const wallet = doc.data();
    batch.update(doc.ref, {
      dailyBalance: wallet.dailyLimit,
      dailyResetAt: new Timestamp(now.seconds + 86400, 0), // +24 ساعة
      lastUpdated: now,
    });
  });
  await batch.commit();
}

export async function resetMonthlyCredits(): Promise<void> {
  const now = Timestamp.now();
  const wallets = await adminDb.collection('user_credits')
    .where('monthlyResetAt', '<=', now)
    .get();

  const batch = adminDb.batch();
  wallets.forEach(doc => {
    const wallet = doc.data();
    const unusedMonthly = wallet.monthlyBalance;
    const rolloverCap = wallet.monthlyLimit * 2;
    const newRollover = Math.min(wallet.rolledOverCredits + unusedMonthly, rolloverCap);

    batch.update(doc.ref, {
      monthlyBalance: wallet.monthlyLimit,
      rolledOverCredits: newRollover,
      monthlyResetAt: new Timestamp(now.seconds + 2592000, 0), // +30 يومًا
      lastUpdated: now,
    });
  });
  await batch.commit();
}
