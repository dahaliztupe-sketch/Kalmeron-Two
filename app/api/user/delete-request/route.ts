import { NextResponse } from 'next/server';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await addDoc(collection(db, 'deletion_requests'), {
      userId,
      requestedAt: serverTimestamp(),
      status: 'pending'
    });
    return NextResponse.json({ message: 'Request received. Processing...' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
