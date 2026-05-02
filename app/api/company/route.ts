/**
 * POST /api/company  — إنشاء شركة جديدة
 * GET  /api/company  — قائمة شركات المستخدم
 *
 * Authentication: Firebase Bearer token (Authorization header)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { createCompany, listCompaniesByOwner } from '@/src/lib/company-builder/engine';
import type { CompanyType, CompanyStage } from '@/src/lib/company-builder/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const CreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  type: z.string() as z.ZodType<CompanyType>,
  stage: z.string().optional() as z.ZodType<CompanyStage | undefined>,
  industry: z.string().max(100).optional(),
  country: z.string().max(10).optional(),
  currency: z.enum(['EGP', 'USD', 'SAR', 'AED']).optional(),
  logo: z.string().max(10).optional(),
  brandColor: z.string().max(10).optional(),
  usePreset: z.string().optional() as z.ZodType<CompanyType | undefined>,
});

// ─── Auth Helper ──────────────────────────────────────────────────────────────

async function authenticate(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }
  const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
  return decoded.uid;
}

// ─── POST /api/company ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await authenticate(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const company = await createCompany(userId, {
      ...parsed.data,
      usePreset: parsed.data.usePreset ?? parsed.data.type,
    });
    return NextResponse.json({ company }, { status: 201 });
  } catch (err) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ event: 'company_post_failed', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}

// ─── GET /api/company ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    userId = await authenticate(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const companies = await listCompaniesByOwner(userId);
    return NextResponse.json({ companies });
  } catch (err) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ event: 'company_get_failed', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}
