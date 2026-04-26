// @ts-nocheck
import { adminDb } from '@/src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { PLANS, getPlan, type PlanId } from './plans';

export interface CreditWallet {
  userId: string;
  plan: PlanId;
  dailyBalance: number;
  monthlyBalance: number;
  lifetimeEarned: number;
  lifetimeConsumed: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyResetAt: Timestamp;
  monthlyResetAt: Timestamp;
  rolledOverCredits: number;
  unlimited: boolean;
  lastUpdated: Timestamp;
}

function buildInitialWallet(userId: string, planId: PlanId): CreditWallet {
  const plan = getPlan(planId);
  const now = Timestamp.now();
  return {
    userId,
    plan: plan.id,
    dailyBalance: plan.dailyCredits,
    monthlyBalance: plan.monthlyCredits,
    lifetimeEarned: plan.dailyCredits + plan.monthlyCredits,
    lifetimeConsumed: 0,
    dailyLimit: plan.dailyCredits,
    monthlyLimit: plan.monthlyCredits,
    dailyResetAt: new Timestamp(now.seconds + 86400, 0),
    monthlyResetAt: new Timestamp(now.seconds + 2592000, 0),
    rolledOverCredits: 0,
    unlimited: plan.unlimited,
    lastUpdated: now,
  };
}

async function getUserPlanId(userId: string): Promise<PlanId> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const data = userDoc.data() as unknown;
    const plan = data?.plan as PlanId | undefined;
    if (plan && PLANS[plan]) return plan;
  } catch {}
  return 'free';
}

export class CreditManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async consumeCredits(amount: number, agentName: string, model: string): Promise<{ success: boolean; message: string }> {
    const walletRef = adminDb.collection('user_credits').doc(this.userId);
    const planId = await getUserPlanId(this.userId);

    return adminDb.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      const wallet = walletDoc.data() as CreditWallet | undefined;

      let createdNew = false;
      let workingWallet: CreditWallet;

      if (!wallet) {
        workingWallet = buildInitialWallet(this.userId, planId);
        createdNew = true;
      } else {
        workingWallet = wallet;
        // إذا تغيّرت الخطة، حدث الحدود الافتراضية ولكن احتفظ بالأرصدة المتبقية
        if (workingWallet.plan !== planId) {
          const plan = getPlan(planId);
          workingWallet = {
            ...workingWallet,
            plan: plan.id,
            dailyLimit: plan.dailyCredits,
            monthlyLimit: plan.monthlyCredits,
            unlimited: plan.unlimited,
            // امنح المستخدم الأرصدة الجديدة عند الترقية
            dailyBalance: Math.max(workingWallet.dailyBalance, plan.dailyCredits),
            monthlyBalance: Math.max(workingWallet.monthlyBalance, plan.monthlyCredits),
          };
        }
      }

      // المؤسسات: استهلاك غير محدود
      if (workingWallet.unlimited) {
        const updatedFields = {
          plan: workingWallet.plan,
          unlimited: true,
          lifetimeConsumed: (workingWallet.lifetimeConsumed || 0) + amount,
          lastUpdated: Timestamp.now(),
        };
        if (createdNew) {
          transaction.set(walletRef, { ...workingWallet, ...updatedFields });
        } else {
          transaction.update(walletRef, updatedFields);
        }
        const txRef = adminDb.collection('credit_transactions').doc();
        transaction.set(txRef, {
          userId: this.userId,
          type: 'consume',
          amount,
          agentName,
          modelUsed: model,
          plan: workingWallet.plan,
          timestamp: Timestamp.now(),
        });
        return { success: true, message: 'تم خصم الأرصدة بنجاح (خطة غير محدودة)' };
      }

      let remaining = amount;
      let dailyConsumed = 0;
      let monthlyConsumed = 0;
      let rolloverConsumed = 0;

      if (workingWallet.dailyBalance >= remaining) {
        dailyConsumed = remaining;
        remaining = 0;
      } else {
        dailyConsumed = workingWallet.dailyBalance;
        remaining -= workingWallet.dailyBalance;
      }

      if (remaining > 0 && workingWallet.monthlyBalance >= remaining) {
        monthlyConsumed = remaining;
        remaining = 0;
      } else if (remaining > 0) {
        monthlyConsumed = workingWallet.monthlyBalance;
        remaining -= workingWallet.monthlyBalance;
      }

      if (remaining > 0 && workingWallet.rolledOverCredits >= remaining) {
        rolloverConsumed = remaining;
        remaining = 0;
      } else if (remaining > 0) {
        rolloverConsumed = workingWallet.rolledOverCredits;
        remaining -= workingWallet.rolledOverCredits;
      }

      if (remaining > 0) {
        return {
          success: false,
          message: `رصيدك غير كافٍ. تحتاج ${amount} رصيدًا، والمتبقي لديك ${
            workingWallet.dailyBalance + workingWallet.monthlyBalance + workingWallet.rolledOverCredits
          } رصيدًا.`,
        };
      }

      const updatedWallet: CreditWallet = {
        ...workingWallet,
        dailyBalance: workingWallet.dailyBalance - dailyConsumed,
        monthlyBalance: workingWallet.monthlyBalance - monthlyConsumed,
        rolledOverCredits: workingWallet.rolledOverCredits - rolloverConsumed,
        lifetimeConsumed: workingWallet.lifetimeConsumed + amount,
        lastUpdated: Timestamp.now(),
      };

      if (createdNew) {
        transaction.set(walletRef, updatedWallet);
      } else {
        transaction.update(walletRef, {
          plan: updatedWallet.plan,
          dailyLimit: updatedWallet.dailyLimit,
          monthlyLimit: updatedWallet.monthlyLimit,
          unlimited: updatedWallet.unlimited,
          dailyBalance: updatedWallet.dailyBalance,
          monthlyBalance: updatedWallet.monthlyBalance,
          rolledOverCredits: updatedWallet.rolledOverCredits,
          lifetimeConsumed: updatedWallet.lifetimeConsumed,
          lastUpdated: updatedWallet.lastUpdated,
        });
      }

      const txRef = adminDb.collection('credit_transactions').doc();
      transaction.set(txRef, {
        userId: this.userId,
        type: 'consume',
        amount,
        dailyConsumed,
        monthlyConsumed,
        rolloverConsumed,
        agentName,
        modelUsed: model,
        plan: updatedWallet.plan,
        timestamp: Timestamp.now(),
        remainingDaily: updatedWallet.dailyBalance,
        remainingMonthly: updatedWallet.monthlyBalance,
      });

      return { success: true, message: 'تم خصم الأرصدة بنجاح' };
    });
  }

  async checkAndNotifyThreshold(): Promise<void> {
    const walletRef = adminDb.collection('user_credits').doc(this.userId);
    const walletDoc = await walletRef.get();
    const wallet = walletDoc.data() as CreditWallet | undefined;
    if (!wallet || wallet.unlimited) return;

    const monthlyUsagePercent =
      wallet.monthlyLimit > 0
        ? ((wallet.monthlyLimit - wallet.monthlyBalance) / wallet.monthlyLimit) * 100
        : 0;
    const dailyUsagePercent =
      wallet.dailyLimit > 0
        ? ((wallet.dailyLimit - wallet.dailyBalance) / wallet.dailyLimit) * 100
        : 0;

    if (monthlyUsagePercent >= 80 && monthlyUsagePercent < 100) {
      await this.sendNotification('monthly_warning', monthlyUsagePercent);
    }
    if (dailyUsagePercent >= 100) {
      await this.sendNotification('daily_cap_reached', dailyUsagePercent);
    }
  }

  private async sendNotification(type: string, percent: number): Promise<void> {
    console.log(`Notification for ${this.userId}: ${type} (${percent}%)`);
  }
}
