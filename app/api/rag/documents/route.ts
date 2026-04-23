// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { listUserDocuments, deleteUserDocument } from '@/src/lib/rag/user-rag';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return decoded.uid || null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const documents = await listUserDocuments(userId);
  return NextResponse.json({ documents });
}

export async function DELETE(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const documentId = new URL(req.url).searchParams.get('documentId');
  if (!documentId) return NextResponse.json({ error: 'documentId_required' }, { status: 400 });
  const removed = await deleteUserDocument(userId, documentId);
  return NextResponse.json({ ok: true, removed });
}
