/**
 * GET /api/opportunities?industry=&stage=&limit=20
 * Returns curated funding, competition, and partnership opportunities
 * for Arab/Egyptian entrepreneurs. Reads from Firestore `opportunities`
 * collection (seeded by cron/opportunity-alerts) with fallback to built-in data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import type { DocumentSnapshot } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7).trim());
    return decoded.uid || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  // Auth optional — public list, but filter by user profile if authed
  let _uid: string | null = null;
  try { _uid = await authedUserId(req); } catch { /* guest */ }

  const url = new URL(req.url);
  const industry = url.searchParams.get('industry') ?? '';
  const stage = url.searchParams.get('stage') ?? '';
  const type = url.searchParams.get('type') ?? '';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 50);

  let opportunities: Array<{
    id: string;
    title: string;
    type: string;
    organizer: string;
    amount: string;
    currency: string;
    deadline: string;
    tags: string[];
    stages: string[];
    countries: string[];
    link: string;
    description: string;
  }> = [];

  // Try Firestore first
  if (adminDb?.collection) {
    try {
      let query = adminDb
        .collection('opportunities')
        .orderBy('deadline', 'asc')
        .limit(limit + 5);

      const snap = await query.get();
      if (!snap.empty) {
        snap.forEach((doc: DocumentSnapshot) => {
          const d = doc.data();
          if (!d) return;
          opportunities.push({
            id: doc.id,
            title: (d['title'] as string) ?? '',
            type: (d['type'] as string) ?? 'grant',
            organizer: (d['organizer'] as string) ?? '',
            amount: (d['amount'] as string) ?? '',
            currency: (d['currency'] as string) ?? 'USD',
            deadline: (d['deadline'] as string) ?? '',
            tags: (d['tags'] as string[]) ?? [],
            stages: (d['stages'] as string[]) ?? [],
            countries: (d['countries'] as string[]) ?? [],
            link: (d['link'] as string) ?? '',
            description: (d['description'] as string) ?? '',
          });
        });
      }
    } catch { /* fall through to seed data */ }
  }

  // Apply filters
  if (industry) {
    opportunities = opportunities.filter(o =>
      o.tags.includes(industry) || o.tags.some(t => t.includes(industry))
    );
  }
  if (stage) {
    opportunities = opportunities.filter(o => o.stages.includes(stage));
  }
  if (type) {
    opportunities = opportunities.filter(o => o.type === type);
  }

  return NextResponse.json({
    opportunities: opportunities.slice(0, limit),
    total: opportunities.length,
    filters: { industry, stage, type },
    status: opportunities.length > 0 ? "available" : "unavailable",
  });
}

export async function POST(req: NextRequest) {
  const uid = await authedUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const { query } = await req.json();
  if (!query?.trim()) return NextResponse.json({ error: 'الرجاء وصف شركتك' }, { status: 400 });

  try {
    const { generateText } = await import('ai');
    const { google } = await import('@/src/lib/gemini');
    const MODEL = google('gemini-2.5-flash');

    const system = `أنت "رادار الفرص" في منصة كلميرون — خبير في مصادر التمويل والدعم للشركات الناشئة المصرية والعربية.

مهمتك: بناءً على وصف المستخدم، حدد أنسب 3-5 فرص تمويل أو دعم متاحة.

لكل فرصة:
- اذكر اسمها والجهة المانحة
- سبب ملاءمتها لهذه الشركة تحديداً
- المبلغ أو نوع الدعم
- آخر موعد للتقديم
- الخطوة التالية المطلوبة

كن محدداً وعملياً. ركّز على الفرص المتاحة للشركات المصرية أو العربية.`;

    const { text } = await generateText({
      model: MODEL,
      system,
      prompt: `بناءً على هذا الوصف، ما أنسب الفرص المتاحة؟\n\n${query}`,
    });

    return NextResponse.json({ result: text });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'حدث خطأ أثناء البحث' }, { status: 500 });
  }
}
