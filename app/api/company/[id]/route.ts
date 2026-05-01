/**
 * GET    /api/company/[id]  — قراءة شركة بمعرّفها
 * PATCH  /api/company/[id]  — تحديث بيانات الشركة
 * DELETE /api/company/[id]  — حذف (soft delete) الشركة
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { getCompany, updateCompany, deleteCompany } from '@/src/lib/company-builder/engine';
import type { CompanyStage } from '@/src/lib/company-builder/types';

async function authenticate(req: NextRequest): Promise<string> {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');
  const decoded = await adminAuth.verifyIdToken(h.slice(7));
  return decoded.uid;
}

async function authorizeCompany(userId: string, companyId: string) {
  const company = await getCompany(companyId);
  if (!company) throw new Error('NOT_FOUND');
  if (company.ownerUid !== userId) throw new Error('FORBIDDEN');
  return company;
}

const UpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  stage: z.string().optional(),
  values: z.array(z.string()).optional(),
  currentOkrs: z.array(z.string()).optional(),
  brandColor: z.string().optional(),
  logo: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;
  try { userId = await authenticate(req); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const company = await authorizeCompany(userId, params.id);
    return NextResponse.json({ company });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'error';
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;
  try { userId = await authenticate(req); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    await authorizeCompany(userId, params.id);
    const body = await req.json() as unknown;
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    const patch = {
      ...parsed.data,
      ...(parsed.data.stage ? { stage: parsed.data.stage as CompanyStage } : {}),
    } as unknown as Parameters<typeof updateCompany>[1];
    await updateCompany(params.id, patch);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'error';
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;
  try { userId = await authenticate(req); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    await authorizeCompany(userId, params.id);
    await deleteCompany(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'error';
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (msg === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
