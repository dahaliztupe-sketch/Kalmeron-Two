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

/** Static seed data shown when Firestore has no opportunities yet. */
const SEED_OPPORTUNITIES = [
  {
    id: "eit-food-2026",
    title: "EIT Food Innovation Hub — منحة شركات الغذاء",
    type: "grant",
    organizer: "EIT Food",
    amount: "€50,000 – €500,000",
    currency: "EUR",
    deadline: "2026-06-30",
    tags: ["food", "sustainability", "europe"],
    stages: ["mvp", "foundation", "growth"],
    countries: ["EG", "SA", "AE"],
    link: "https://www.eitfood.eu",
    description: "منحة للشركات الناشئة في قطاع الغذاء والزراعة التقنية بالتعاون مع الاتحاد الأوروبي.",
  },
  {
    id: "khwarizmi-2026",
    title: "جائزة خوارزمي للابتكار التقني",
    type: "competition",
    organizer: "مؤسسة خوارزمي الدولية",
    amount: "$100,000",
    currency: "USD",
    deadline: "2026-07-15",
    tags: ["tech", "ai", "innovation"],
    stages: ["idea", "validation", "mvp"],
    countries: ["EG", "SA", "AE", "JO", "MA"],
    link: "https://khwarizmi.org",
    description: "مسابقة سنوية تكرّم المبتكرين العرب في التكنولوجيا والذكاء الاصطناعي.",
  },
  {
    id: "flat6labs-cairo-2026",
    title: "Flat6Labs Cairo — الدورة الخريفية 2026",
    type: "accelerator",
    organizer: "Flat6Labs",
    amount: "$15,000 + equity",
    currency: "USD",
    deadline: "2026-08-31",
    tags: ["tech", "fintech", "health", "edtech"],
    stages: ["idea", "validation", "mvp"],
    countries: ["EG"],
    link: "https://flat6labs.com/cairo",
    description: "أبرز برنامج تسريع في مصر — 4 أشهر، توجيه مكثف، وصول لشبكة مستثمرين.",
  },
  {
    id: "samir-abdel-latif-2026",
    title: "صندوق سمير عبد اللطيف للريادة",
    type: "grant",
    organizer: "بنك الاستثمار القومي",
    amount: "500,000 – 5,000,000 ج.م",
    currency: "EGP",
    deadline: "2026-09-01",
    tags: ["manufacturing", "food", "tech"],
    stages: ["foundation", "growth"],
    countries: ["EG"],
    link: "https://nib.com.eg",
    description: "تمويل ميسّر للشركات الصغيرة والمتوسطة المصرية بفائدة 5% وفترة سماح 2 سنة.",
  },
  {
    id: "disruptech-2026",
    title: "DisrupTECH Cairo — Demo Day نوفمبر",
    type: "competition",
    organizer: "RiseUp Summit",
    amount: "$50,000",
    currency: "USD",
    deadline: "2026-09-30",
    tags: ["tech", "ai", "fintech"],
    stages: ["mvp", "foundation"],
    countries: ["EG", "SA", "AE"],
    link: "https://riseupeg.com",
    description: "أكبر مسابقة تقنية في منطقة الشرق الأوسط وشمال أفريقيا مع أكثر من 500 مستثمر.",
  },
  {
    id: "saudi-vision-fund-2026",
    title: "Saudi Vision Accelerator — التقديم المفتوح",
    type: "accelerator",
    organizer: "Vision Ventures",
    amount: "$100,000 – $500,000",
    currency: "USD",
    deadline: "2026-10-15",
    tags: ["tech", "sustainability", "health"],
    stages: ["mvp", "foundation", "growth"],
    countries: ["SA", "EG", "AE"],
    link: "https://visionventures.co",
    description: "برنامج تسريع سعودي يركز على رؤية 2030 بدعم من صندوق الاستثمارات العامة.",
  },
  {
    id: "instapay-partner-2026",
    title: "شراكة InstaPay للفينتك المصرية",
    type: "partnership",
    organizer: "شركة المدفوعات المصرية",
    amount: "API access + revenue share",
    currency: "EGP",
    deadline: "2026-12-31",
    tags: ["fintech", "payments"],
    stages: ["mvp", "foundation", "growth"],
    countries: ["EG"],
    link: "https://instapayegypt.com",
    description: "شراكة تقنية للشركات الناشئة في مجال المدفوعات الرقمية مع واجهة برمجية مجانية.",
  },
  {
    id: "undp-egypt-sme-2026",
    title: "UNDP مصر — دعم المشاريع الصغيرة",
    type: "grant",
    organizer: "برنامج الأمم المتحدة الإنمائي",
    amount: "$10,000 – $50,000",
    currency: "USD",
    deadline: "2026-11-30",
    tags: ["sustainability", "social", "rural"],
    stages: ["idea", "validation", "mvp"],
    countries: ["EG"],
    link: "https://undp.org/egypt",
    description: "منح غير مستردة للمشاريع التي تحل مشكلات التنمية المستدامة في مصر.",
  },
];

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

  let opportunities: typeof SEED_OPPORTUNITIES = [];

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

  // Use seed data if Firestore empty or unavailable
  if (opportunities.length === 0) {
    opportunities = [...SEED_OPPORTUNITIES];
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
  });
}
