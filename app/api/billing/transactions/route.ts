import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(auth);
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10));

  try {
    const snap = await adminDb
      .collection('credit_transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const transactions = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        type: d.type as string,
        amount: d.amount as number,
        description: (d.description as string | undefined) ?? labelFromType(d.type, d.amount),
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error('[billing/transactions]', err);
    return NextResponse.json({ transactions: [] });
  }
}

function labelFromType(type: string, amount: number): string {
  if (type === 'consume') return `استخدام ${Math.abs(amount)} رصيد`;
  if (type === 'reset')   return 'تجديد يومي / شهري';
  if (type === 'topup')   return `إضافة ${amount} رصيد`;
  return 'معاملة';
}
