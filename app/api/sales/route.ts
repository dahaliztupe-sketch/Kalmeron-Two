/**
 * POST /api/sales — Sales & marketing strategy generator
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

const SalesSchema = z.object({
  brand: z.string().min(2).max(200),
  audience: z.string().max(500).default('رواد الأعمال المصريون'),
  goal: z.string().max(200).default('زيادة المبيعات'),
  budget: z.string().max(100).optional(),
  channels: z.array(z.string()).default([]),
  output: z.enum(['strategy', 'calendar', 'posts', 'full']).default('full'),
});

async function getUid(req: NextRequest): Promise<string | null> {
  const h = req.headers.get('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  try {
    const d = await adminAuth.verifyIdToken(h.slice(7).trim());
    return d.uid;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = SalesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
  }

  const { brand, audience, goal, budget, channels, output } = parsed.data;

  const outputMap = {
    strategy: 'استراتيجية التسويق الشاملة',
    calendar: 'تقويم محتوى 30 يوم تفصيلي',
    posts: 'أول 10 منشورات جاهزة للنشر',
    full: 'الاستراتيجية الكاملة + التقويم + المنشورات',
  };

  try {
    const { text } = await generateText({
      model: MODEL,
      prompt: `أنت مدير تسويق ومبيعات محترف متخصص في السوق المصري والعربي.

العلامة التجارية: ${brand}
الجمهور المستهدف: ${audience}
الهدف: ${goal}
${budget ? `الميزانية الشهرية: ${budget}` : ''}
${channels.length ? `القنوات المفضلة: ${channels.join('، ')}` : ''}

المطلوب: ${outputMap[output]}

ضمّن في إجابتك:
## استراتيجية التسويق
- تحديد القنوات الأمثل مع نسبة توزيع الميزانية
- الرسائل التسويقية الأساسية (Key Messages)
- الميزة التنافسية المقترحة

## تقويم المحتوى (4 أسابيع)
جدول أسبوعي بأنواع المحتوى ومواعيد النشر

## منشورات جاهزة (5 منشورات)
منشورات كاملة مع hashtags عربية وإنجليزية مناسبة

## مؤشرات النجاح (KPIs)
أرقام واقعية قابلة للقياس خلال 30-90 يوم`,
    });

    return NextResponse.json({ strategy: text, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('[sales] AI error:', e);
    return NextResponse.json({ error: 'ai_error' }, { status: 500 });
  }
}
