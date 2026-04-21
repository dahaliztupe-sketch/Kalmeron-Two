import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { observe } from '@/src/ai/admin/observer.agent';
import { analyze } from '@/src/ai/admin/analyst.agent';
import { plan } from '@/src/ai/admin/planner.agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
      const email = (dec.email || '').toLowerCase();
      if (ADMIN_EMAILS.length && !ADMIN_EMAILS.includes(email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (ADMIN_EMAILS.length) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const report = await observe();
  const risks = analyze(report);
  const plans = plan(risks);

  return NextResponse.json({ report, risks, plans });
}
