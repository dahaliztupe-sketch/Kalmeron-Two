/**
 * /api/billing/portal — open Stripe Customer Portal session.
 *
 * Lets paid users update payment methods, cancel, switch plans, download
 * invoices. Required by App Store/Play store rules and by EU consumer law.
 *
 * P0-1 from Virtual Boardroom 201.
 */
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-08-27.basil' as any }) : null;

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  if (!stripe) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token!);
    userId = decoded.uid;
  } catch {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userSnap = await adminDb.collection('users').doc(userId).get();
  const customerId = (userSnap.data() as any)?.stripeCustomerId as string | undefined;
  if (!customerId) {
    return Response.json(
      { error: 'No Stripe customer', message: 'لم يتم العثور على اشتراك مدفوع لهذا الحساب.' },
      { status: 404 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/account/billing`,
  });

  return Response.json({ url: session.url });
}
