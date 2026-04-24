/**
 * Newsletter subscribers — lightweight Firestore-backed list.
 *
 * Stored in `newsletter_subscribers` collection keyed by email hash to avoid
 * duplicates. Each doc tracks email, source, locale, and timestamps.
 */

import { adminDb } from '@/src/lib/firebase-admin';
import { logger } from '@/src/lib/logger';
import { createHash } from 'crypto';

const COLLECTION = 'newsletter_subscribers';

export interface SubscriberRecord {
  email: string;
  source: string; // e.g. 'footer', 'blog', 'pricing'
  locale: string; // 'ar' | 'en'
  createdAt: number;
  ip?: string;
  unsubscribed?: boolean;
}

function emailKey(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 24);
}

// Bounded, single-pass email validator — avoids polynomial backtracking by
// short-circuiting on length first and using atomic-style character classes.
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length === 0 || email.length > 254) {
    return false;
  }
  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@') || at === email.length - 1) {
    return false;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length > 64 || domain.length > 253) return false;
  if (/[\s@]/.test(local) || /[\s@]/.test(domain)) return false;
  const dot = domain.lastIndexOf('.');
  if (dot <= 0 || dot === domain.length - 1) return false;
  return true;
}

export async function subscribe(opts: {
  email: string;
  source?: string;
  locale?: string;
  ip?: string;
}): Promise<{ ok: boolean; alreadySubscribed?: boolean; reason?: string }> {
  const email = opts.email.trim().toLowerCase();
  if (!isValidEmail(email)) return { ok: false, reason: 'invalid_email' };

  try {
    const ref = adminDb.collection(COLLECTION).doc(emailKey(email));
    const existing = await ref.get();
    if (existing.exists) {
      // Re-activate if previously unsubscribed.
      const data = existing.data() as SubscriberRecord;
      if (data.unsubscribed) {
        await ref.set({ unsubscribed: false, updatedAt: Date.now() }, { merge: true });
        return { ok: true };
      }
      return { ok: true, alreadySubscribed: true };
    }
    const record: SubscriberRecord = {
      email,
      source: opts.source || 'unknown',
      locale: opts.locale || 'ar',
      createdAt: Date.now(),
      ip: opts.ip,
    };
    await ref.set(record);
    return { ok: true };
  } catch (e) {
    logger.error({ err: e, email, msg: 'newsletter subscribe failed' });
    return { ok: false, reason: 'storage_error' };
  }
}

export async function unsubscribe(email: string): Promise<boolean> {
  if (!isValidEmail(email)) return false;
  try {
    const ref = adminDb.collection(COLLECTION).doc(emailKey(email));
    await ref.set({ unsubscribed: true, updatedAt: Date.now() }, { merge: true });
    return true;
  } catch (e) {
    logger.warn({ err: e, msg: 'newsletter unsubscribe failed' });
    return false;
  }
}
