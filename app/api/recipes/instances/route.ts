// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  if (!adminAuth?.verifyIdToken) return null;
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const d = await adminAuth.verifyIdToken(token);
    return d.uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!adminDb?.collection) return NextResponse.json({ runs: [] });

  const snap = await adminDb
    .collection('recipe_runs')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()
    .catch(() => null);
  const runs = snap
    ? snap.docs.map((d: { id: string; data: () => unknown }) => {
        const v = d.data();
        return {
          id: d.id,
          recipeId: v.recipeId,
          title: v.title,
          status: v.status,
          totalSteps: v.totalSteps,
          pendingApprovals: v.pendingApprovals,
          completedSteps: v.completedSteps,
          createdAt: v.createdAt?.toMillis?.() ?? null,
        };
      })
    : [];
  return NextResponse.json({ runs });
}
