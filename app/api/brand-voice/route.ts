/**
 * GET  /api/brand-voice  — fetch brand voice settings
 * POST /api/brand-voice  — generate preview copy using AI
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

const PreviewSchema = z.object({
  name: z.string().max(200).default(''),
  tagline: z.string().max(500).default(''),
  tone: z.array(z.string().max(100)).default([]),
  audience: z.string().max(1000).default(''),
  values: z.string().max(1000).default(''),
  avoid: z.string().max(500).default(''),
  sampleMessage: z.string().max(2000).default(''),
  scenario: z.string().max(500).optional(),
});

async function getUid(req: NextRequest): Promise<string | null> {
  const h = req.headers.get('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  try {
    const d = await adminAuth.verifyIdToken(h.slice(7).trim());
    return d.uid;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!adminDb?.collection) {
    return NextResponse.json({ data: null, warning: 'firestore_unavailable' });
  }

  const snap = await adminDb
    .collection('users').doc(uid)
    .collection('settings').doc('brand_voice')
    .get().catch(() => null);

  return NextResponse.json({ data: snap?.exists ? snap.data() : null });
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

  const parsed = PreviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
  }

  const d = parsed.data;

  const scenarioText = d.scenario
    ? `السيناريو: ${d.scenario}`
    : 'اكتب منشور سوشيال ميديا يروّج لهذه الشركة ويعكس صوت علامتها التجارية.';

  const toneText = d.tone.length
    ? `نبرة الصوت: ${d.tone.join('، ')}`
    : 'نبرة احترافية وودية';

  try {
    const { text } = await generateText({
      model: MODEL,
      prompt: `أنت كاتب محتوى محترف متخصص في بناء هوية العلامات التجارية العربية.

الشركة: ${d.name || 'شركة ناشئة'}
الشعار: ${d.tagline || 'غير محدد'}
${toneText}
الجمهور المستهدف: ${d.audience || 'عام'}
القيم: ${d.values || 'غير محددة'}
تجنّب: ${d.avoid || 'لا قيود محددة'}
${d.sampleMessage ? `رسالة نموذجية بأسلوبك: ${d.sampleMessage}` : ''}

${scenarioText}

اكتب نصاً واحداً مقنعاً (150-250 كلمة) يعكس هوية العلامة التجارية بدقة. يجب أن:
- يعكس النبرة المطلوبة بشكل أصيل
- يخاطب الجمهور المستهدف مباشرةً
- يتجنب ما طُلب تجنّبه
- يكون مناسباً للسوق العربي
- ينتهي بـ call-to-action واضح`,
    });

    return NextResponse.json({ preview: text, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('[brand-voice] AI error:', e);
    return NextResponse.json({ error: 'ai_error' }, { status: 500 });
  }
}
