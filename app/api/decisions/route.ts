/**
 * GET /api/decisions  — list journal entries
 * POST /api/decisions — create entry
 * PATCH /api/decisions — update/delete entry
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { ai } from '@/src/lib/gemini';

export const runtime = 'nodejs';

async function requireAuth(req: NextRequest) {
  const h = req.headers.get('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  try {
    return await adminAuth.verifyIdToken(h.slice(7).trim());
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();
  const decoded = await requireAuth(req);
  if (!decoded) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const snap = await adminDb
    .collection('users')
    .doc(decoded.uid)
    .collection('decisions')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  const decisions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ decisions });
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();
  const decoded = await requireAuth(req);
  if (!decoded) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, context, options, chosen, outcome, tags, action } = body;

  // AI analyze mode
  if (action === 'analyze' && context) {
    const prompt = `أنت مستشار استراتيجي خبير. حلّل هذا القرار التجاري وقدّم تحليلاً موجزاً:
    
القرار: ${title || 'قرار'}
السياق: ${context}
${options ? `الخيارات المتاحة: ${options}` : ''}

قدّم:
1. **التحليل السريع** — الجوانب الرئيسية لهذا القرار
2. **الخيار الموصى به** — وسبب ذلك
3. **المخاطر الرئيسية** — 3 مخاطر يجب الانتباه إليها
4. **الخطوة التالية** — إجراء عملي واحد فوري

أجب بالعربية الرسمية الموجزة في 200 كلمة كحد أقصى.`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return NextResponse.json({ analysis: response.text || '' });
  }

  // Save decision
  const ref = await adminDb
    .collection('users')
    .doc(decoded.uid)
    .collection('decisions')
    .add({
      title: title || 'قرار',
      context: context || '',
      options: options || '',
      chosen: chosen || '',
      outcome: outcome || '',
      tags: tags || [],
      createdAt: new Date(),
    });

  return NextResponse.json({ id: ref.id });
}

export async function PATCH(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();
  const decoded = await requireAuth(req);
  if (!decoded) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, outcome, delete: del } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const ref = adminDb.collection('users').doc(decoded.uid).collection('decisions').doc(id);
  if (del) {
    await ref.delete();
    return NextResponse.json({ deleted: true });
  }
  await ref.update({ outcome, updatedAt: new Date() });
  return NextResponse.json({ updated: true });
}
