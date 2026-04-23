import { NextRequest, NextResponse } from 'next/server';
import { getRecentAudit, getCostSnapshot, getCostByModel } from '@/src/lib/llm/gateway';
import { adminAuth } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

async function isAdmin(req: NextRequest): Promise<boolean> {
  // Fail-closed: if admin allow-list is unconfigured, deny all access.
  if (ADMIN_EMAILS.length === 0) return false;
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return ADMIN_EMAILS.includes((decoded.email || '').toLowerCase());
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || 100), 500);
  const summary = req.nextUrl.searchParams.get('summary');
  if (summary === 'byModel') {
    return NextResponse.json({ byModel: getCostByModel() });
  }
  return NextResponse.json({
    audit: getRecentAudit(limit),
    cost: getCostSnapshot(),
    byModel: getCostByModel(),
  });
}
