/**
 * GET  /api/market-lab          — list user's experiments
 * POST /api/market-lab          — create a new experiment (triggers analysis)
 * GET  /api/market-lab?id=XYZ   — get single experiment details
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

async function requireAuth(req: NextRequest): Promise<string | null> {
  const h = req.headers.get('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  try {
    const dec = await adminAuth.verifyIdToken(h.slice(7).trim());
    return dec.uid || null;
  } catch {
    return null;
  }
}

const CreateSchema = z.object({
  title: z.string().min(3).max(200),
  hypothesis: z.string().min(10).max(2000),
  targetSegment: z.string().min(3).max(500).optional(),
  personaCount: z.number().int().min(1).max(20).default(5),
});

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await requireAuth(req);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!adminDb?.collection) {
    return NextResponse.json({ experiments: [], warning: 'firestore_unavailable' });
  }

  if (id) {
    const doc = await adminDb
      .collection('users').doc(userId)
      .collection('market_experiments').doc(id)
      .get();
    if (!doc.exists) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ experiment: { id: doc.id, ...doc.data() } });
  }

  const snap = await adminDb
    .collection('users').doc(userId)
    .collection('market_experiments')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()
    .catch(() => null);

  const experiments = snap?.docs.map((d) => ({ id: d.id, ...d.data() })) ?? [];
  return NextResponse.json({ experiments });
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const userId = await requireAuth(req);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
  }

  const { title, hypothesis, targetSegment, personaCount } = parsed.data;

  // Run AI analysis
  let resultSummary = '';
  let personas: unknown[] = [];
  try {
    const { text } = await generateText({
      model: MODEL,
      prompt: `أنت محلل سوق متخصص في السوق العربي والمصري.

العنوان: ${title}
الفرضية: ${hypothesis}
${targetSegment ? `شريحة المستخدمين المستهدفة: ${targetSegment}` : ''}
عدد الشخصيات: ${personaCount}

اصنع تقريراً بالشكل التالي (JSON فقط، بدون markdown):
{
  "summary": "ملخص التحليل في 3-4 جمل",
  "verdict": "واعد|محايد|مشكوك_فيه",
  "personas": [
    {
      "name": "اسم عربي",
      "age": 32,
      "job": "المهنة",
      "pain": "المشكلة التي يعانيها",
      "reaction": "رد فعله على الفكرة (صريح وواقعي)",
      "willPay": true,
      "priceSensitivity": "عالية|متوسطة|منخفضة"
    }
  ],
  "keyInsights": ["رؤية 1", "رؤية 2", "رؤية 3"],
  "risks": ["خطر 1", "خطر 2"],
  "nextSteps": ["خطوة 1", "خطوة 2", "خطوة 3"]
}`,
    });

    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      resultSummary = parsed.summary || '';
      personas = parsed.personas || [];

      if (adminDb?.collection) {
        const docRef = adminDb
          .collection('users').doc(userId)
          .collection('market_experiments')
          .doc();

        await docRef.set({
          title,
          hypothesis,
          targetSegment: targetSegment || null,
          personaCount,
          status: 'completed',
          resultSummary,
          verdict: parsed.verdict || 'محايد',
          personas,
          keyInsights: parsed.keyInsights || [],
          risks: parsed.risks || [],
          nextSteps: parsed.nextSteps || [],
          insightCount: (parsed.keyInsights || []).length,
          interviewCount: personas.length,
          createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
          id: docRef.id,
          status: 'completed',
          resultSummary,
          verdict: parsed.verdict || 'محايد',
          personas,
          keyInsights: parsed.keyInsights || [],
          risks: parsed.risks || [],
          nextSteps: parsed.nextSteps || [],
        });
      }

      return NextResponse.json({
        id: 'temp-' + Date.now(),
        status: 'completed',
        resultSummary,
        personas,
      });
    }
  } catch (e) {
    console.error('[market-lab] AI error:', e);
  }

  return NextResponse.json({
    id: 'err-' + Date.now(),
    status: 'error',
    resultSummary: 'حدث خطأ أثناء التحليل، حاول مرة أخرى.',
  }, { status: 500 });
}
