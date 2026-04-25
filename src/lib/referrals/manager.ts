/**
 * Referral System — Viral Growth Engine.
 *
 * Each user gets a unique referral code. When a new user signs up using a code:
 *   - Referrer earns: +1 free month on their current plan (or 500 bonus credits if free)
 *   - Referee earns: +50% bonus credits for first month
 *
 * Storage: Firestore collection `referrals` keyed by referee uid.
 * Code generation: deterministic-ish (uid hash) so each user has one stable code.
 */

import { adminDb } from '@/src/lib/firebase-admin';
import { logger } from '@/src/lib/logger';

const COLLECTION = 'referrals';

export interface ReferralRecord {
  refereeUid: string;
  referrerUid: string;
  code: string;
  createdAt: number;
  rewardedReferrer: boolean;
  rewardedReferee: boolean;
  refereeUpgradedToPaid: boolean;
}

export interface ReferralStats {
  code: string;
  totalSignups: number;
  totalConversions: number;
  totalRewardsEarned: number;
  shareUrl: string;
}

/** Generates a stable, URL-safe referral code from a uid. */
export function generateReferralCode(uid: string): string {
  // Take first 6 chars of uid + 2-char checksum for entropy/typo-protection.
  const base = uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  let sum = 0;
  for (let i = 0; i < uid.length; i++) sum = (sum + uid.charCodeAt(i)) % 1296;
  const checksum = sum.toString(36).toUpperCase().padStart(2, '0');
  return `${base}${checksum}`;
}

/** Looks up the user uid that owns a referral code. */
export async function findReferrerByCode(code: string): Promise<string | null> {
  if (!code || code.length < 6) return null;
  try {
    const snap = await adminDb
      .collection('users')
      .where('referralCode', '==', code.toUpperCase())
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0]!.id;
  } catch (e) {
    logger.warn({ err: e, code, msg: 'Failed to look up referral code' });
    return null;
  }
}

/** Ensures a user has a referral code stored. Returns the code. */
export async function ensureReferralCode(uid: string): Promise<string> {
  try {
    const userRef = adminDb.collection('users').doc(uid);
    const snap = await userRef.get();
    const data = snap.data() || {};
    if (data.referralCode) return data.referralCode;

    const code = generateReferralCode(uid);
    await userRef.set({ referralCode: code, referralCreatedAt: Date.now() }, { merge: true });
    return code;
  } catch (e) {
    logger.warn({ err: e, uid, msg: 'Failed to ensure referral code' });
    return generateReferralCode(uid);
  }
}

/** Records that a new user signed up via a referral code. */
export async function recordReferral(refereeUid: string, code: string): Promise<boolean> {
  const referrerUid = await findReferrerByCode(code);
  if (!referrerUid || referrerUid === refereeUid) return false;

  try {
    const ref = adminDb.collection(COLLECTION).doc(refereeUid);
    const existing = await ref.get();
    if (existing.exists) return false; // already attributed

    const record: ReferralRecord = {
      refereeUid,
      referrerUid,
      code: code.toUpperCase(),
      createdAt: Date.now(),
      rewardedReferrer: false,
      rewardedReferee: true, // immediate bonus credits
      refereeUpgradedToPaid: false,
    };
    await ref.set(record);

    // Grant referee a 500-credit bonus immediately.
    await adminDb
      .collection('users')
      .doc(refereeUid)
      .set(
        {
          credits_bonus: 500,
          credits_bonus_source: 'referral_signup',
          referredBy: referrerUid,
        },
        { merge: true }
      );

    return true;
  } catch (e) {
    logger.error({ err: e, refereeUid, code, msg: 'Failed to record referral' });
    return false;
  }
}

/** Marks the referee as upgraded (paid) and rewards the referrer. */
export async function rewardReferrerOnUpgrade(refereeUid: string): Promise<void> {
  try {
    const ref = adminDb.collection(COLLECTION).doc(refereeUid);
    const snap = await ref.get();
    if (!snap.exists) return;
    const data = snap.data() as ReferralRecord;
    if (data.rewardedReferrer) return;

    await adminDb
      .collection('users')
      .doc(data.referrerUid)
      .set(
        {
          credits_bonus: 5000, // ~ equivalent of one free month on Pro
          credits_bonus_source: 'referral_conversion',
        },
        { merge: true }
      );

    await ref.set(
      {
        rewardedReferrer: true,
        refereeUpgradedToPaid: true,
        rewardedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    logger.warn({ err: e, refereeUid, msg: 'Failed to reward referrer' });
  }
}

/** Returns aggregated stats for a user's referral code. */
export async function getReferralStats(uid: string, baseUrl?: string): Promise<ReferralStats> {
  const code = await ensureReferralCode(uid);
  let totalSignups = 0;
  let totalConversions = 0;

  try {
    // Bounded read: cap at 1000 referrals per user. The MAU per individual
    // referrer is realistically < 100; the cap protects the read budget if a
    // viral influencer signs up. Showing "1000+" in the UI when capped is
    // acceptable for the stats panel; precise counts come from the
    // server-side `cost_rollups_daily` aggregate (admin only).
    const snap = await adminDb
      .collection(COLLECTION)
      .where('referrerUid', '==', uid)
      .limit(1000)
      .get();
    totalSignups = snap.size;
    totalConversions = snap.docs.filter((d) => (d.data() as ReferralRecord).refereeUpgradedToPaid).length;
  } catch (e) {
    logger.warn({ err: e, uid, msg: 'Failed to load referral stats' });
  }

  const root = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';
  const shareUrl = `${root}/auth/signup?ref=${encodeURIComponent(code)}`;

  return {
    code,
    totalSignups,
    totalConversions,
    totalRewardsEarned: totalConversions * 5000,
    shareUrl,
  };
}
