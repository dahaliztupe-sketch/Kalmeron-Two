import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.split(' ')[1];
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token!);
    userId = decoded.uid;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const walletDoc = await adminDb.collection('user_credits').doc(userId).get();
    if (!walletDoc.exists) {
      return new Response(
        JSON.stringify({
          dailyBalance: 20,
          monthlyBalance: 100,
          rolledOverCredits: 0,
          dailyLimit: 20,
          monthlyLimit: 100,
          total: 120,
          initialized: false,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    const w = walletDoc.data() as any;
    const total =
      (w.dailyBalance || 0) + (w.monthlyBalance || 0) + (w.rolledOverCredits || 0);
    return new Response(
      JSON.stringify({
        dailyBalance: w.dailyBalance || 0,
        monthlyBalance: w.monthlyBalance || 0,
        rolledOverCredits: w.rolledOverCredits || 0,
        dailyLimit: w.dailyLimit || 20,
        monthlyLimit: w.monthlyLimit || 100,
        total,
        initialized: true,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
