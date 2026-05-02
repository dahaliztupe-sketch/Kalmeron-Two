/**
 * GET  /api/plan  — جلب قائمة OKRs للمستخدم من Firestore
 * POST /api/plan  — إنشاء OKR جديد
 * PUT  /api/plan  — تحديث تقدم Key Results
 * DELETE /api/plan?id=<okrId> — حذف OKR
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAuth(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return dec.uid || null;
  } catch {
    return null;
  }
}

function col(userId: string) {
  return adminDb.collection('plan_okrs').doc(userId).collection('okrs');
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await requireAuth(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  try {
    const snap = await col(userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const okrs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      };
    });

    return NextResponse.json({ okrs });
  } catch {
    return NextResponse.json({ okrs: [] });
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await requireAuth(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const body = await req.json() as {
    objective: string;
    quarter: string;
    status: string;
    keyResults: Array<{ id: string; text: string; progress: number }>;
  };

  if (!body.objective?.trim()) {
    return NextResponse.json({ error: 'objective_required' }, { status: 400 });
  }

  const now = Timestamp.now();
  const ref = await col(userId).add({
    userId,
    objective: body.objective.trim(),
    quarter: body.quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
    status: body.status || 'on-track',
    keyResults: (body.keyResults || []).map((kr, i) => ({
      id: kr.id || `kr-${Date.now()}-${i}`,
      text: kr.text,
      progress: kr.progress ?? 0,
    })),
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id: ref.id, ok: true });
}

export async function PUT(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await requireAuth(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const body = await req.json() as {
    id: string;
    keyResults?: Array<{ id: string; text: string; progress: number }>;
    status?: string;
    objective?: string;
  };

  if (!body.id) return NextResponse.json({ error: 'id_required' }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: Timestamp.now() };
  if (body.keyResults) update.keyResults = body.keyResults;
  if (body.status) update.status = body.status;
  if (body.objective) update.objective = body.objective.trim();

  await col(userId).doc(body.id).update(update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await requireAuth(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });

  await col(userId).doc(id).delete();
  return NextResponse.json({ ok: true });
}
