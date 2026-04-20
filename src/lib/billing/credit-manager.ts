// @ts-nocheck
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export interface CreditWallet {
  userId: string;
  dailyBalance: number;
  monthlyBalance: number;
  lifetimeEarned: number;
  lifetimeConsumed: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyResetAt: Timestamp;
  monthlyResetAt: Timestamp;
  rolledOverCredits: number;
  lastUpdated: Timestamp;
}

export class CreditManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async consumeCredits(amount: number, agentName: string, model: string): Promise<{ success: boolean; message: string }> {
    const walletRef = adminDb.collection('user_credits').doc(this.userId);
    
    return adminDb.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      const wallet = walletDoc.data() as CreditWallet | undefined;

      if (!wallet) {
        // Initialize default wallet if not exists (Freemium)
        const now = Timestamp.now();
        const initialWallet: CreditWallet = {
          userId: this.userId,
          dailyBalance: 20,
          monthlyBalance: 100,
          lifetimeEarned: 120,
          lifetimeConsumed: 0,
          dailyLimit: 20,
          monthlyLimit: 100,
          dailyResetAt: new Timestamp(now.seconds + 86400, 0),
          monthlyResetAt: new Timestamp(now.seconds + 2592000, 0),
          rolledOverCredits: 0,
          lastUpdated: now,
        };
        transaction.set(walletRef, initialWallet);
        return { success: false, message: 'Wallet initialized. Please retry.' };
      }

      let remaining = amount;
      let dailyConsumed = 0;
      let monthlyConsumed = 0;
      let rolloverConsumed = 0;

      // 1. استهلاك الأرصدة اليومية أولاً
      if (wallet.dailyBalance >= remaining) {
        dailyConsumed = remaining;
        remaining = 0;
      } else {
        dailyConsumed = wallet.dailyBalance;
        remaining -= wallet.dailyBalance;
      }

      // 2. استهلاك الأرصدة الشهرية
      if (remaining > 0 && wallet.monthlyBalance >= remaining) {
        monthlyConsumed = remaining;
        remaining = 0;
      } else if (remaining > 0) {
        monthlyConsumed = wallet.monthlyBalance;
        remaining -= wallet.monthlyBalance;
      }

      // 3. استهلاك الأرصدة المرحلة (Rollover)
      if (remaining > 0 && wallet.rolledOverCredits >= remaining) {
        rolloverConsumed = remaining;
        remaining = 0;
      } else if (remaining > 0) {
          rolloverConsumed = wallet.rolledOverCredits;
          remaining -= wallet.rolledOverCredits;
      }

      // 4. فشل - رصيد غير كافٍ
      if (remaining > 0) {
        return {
          success: false,
          message: `رصيدك غير كافٍ. تحتاج ${amount} رصيدًا، والمتبقي لديك ${wallet.dailyBalance + wallet.monthlyBalance + wallet.rolledOverCredits} رصيدًا.`,
        };
      }

      // 5. تحديث المحفظة
      transaction.update(walletRef, {
        dailyBalance: wallet.dailyBalance - dailyConsumed,
        monthlyBalance: wallet.monthlyBalance - monthlyConsumed,
        rolledOverCredits: wallet.rolledOverCredits - rolloverConsumed,
        lifetimeConsumed: wallet.lifetimeConsumed + amount,
        lastUpdated: Timestamp.now(),
      });

      // 6. تسجيل المعاملة
      const transactionRef = adminDb.collection('credit_transactions').doc();
      transaction.set(transactionRef, {
        userId: this.userId,
        type: 'consume',
        amount,
        dailyConsumed,
        monthlyConsumed,
        rolloverConsumed,
        agentName,
        modelUsed: model,
        timestamp: Timestamp.now(),
        remainingDaily: wallet.dailyBalance - dailyConsumed,
        remainingMonthly: wallet.monthlyBalance - monthlyConsumed,
      });

      return { success: true, message: 'تم خصم الأرصدة بنجاح' };
    });
  }

  async checkAndNotifyThreshold(): Promise<void> {
    const walletRef = adminDb.collection('user_credits').doc(this.userId);
    const walletDoc = await walletRef.get();
    const wallet = walletDoc.data() as CreditWallet | undefined;
    if (!wallet) return;

    const monthlyUsagePercent = ((wallet.monthlyLimit - wallet.monthlyBalance) / wallet.monthlyLimit) * 100;
    const dailyUsagePercent = ((wallet.dailyLimit - wallet.dailyBalance) / wallet.dailyLimit) * 100;

    // تحذير عند 80% من الحد الشهري
    if (monthlyUsagePercent >= 80 && monthlyUsagePercent < 100) {
      await this.sendNotification('monthly_warning', monthlyUsagePercent);
    }

    // إيقاف عند 100% من الحد اليومي
    if (dailyUsagePercent >= 100) {
      await this.sendNotification('daily_cap_reached', dailyUsagePercent);
    }
  }

  private async sendNotification(type: string, percent: number): Promise<void> {
    // إرسالية إشعار داخل المنصة أو بريد إلكتروني
    console.log(`Notification for ${this.userId}: ${type} (${percent}%)`);
  }
}
