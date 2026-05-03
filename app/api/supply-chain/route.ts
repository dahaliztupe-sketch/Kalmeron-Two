import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

const SupplySchema = z.object({
  product: z.string().min(3).max(500),
  context: z.string().max(2000).optional(),
  analysisType: z.enum(['demand', 'inventory', 'logistics', 'full']).default('full'),
  industry: z.string().max(200).optional(),
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

  const parsed = SupplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
  }

  const { product, context, analysisType, industry } = parsed.data;

  const typeMap = {
    demand: 'تحليل الطلب والتنبؤ',
    inventory: 'تحسين المخزون',
    logistics: 'تحسين اللوجستيات',
    full: 'تحليل شامل لسلسلة الإمداد',
  };

  try {
    const { text } = await generateText({
      model: MODEL,
      maxOutputTokens: 4096,
      prompt: `أنت خبير في سلاسل الإمداد والعمليات في السوق المصري.

المنتج/الخدمة: ${product}
${industry ? `القطاع: ${industry}` : ''}
${context ? `معلومات إضافية: ${context}` : ''}

المطلوب: ${typeMap[analysisType]}

## 1. تحليل الطلب والتنبؤ
- الأنماط الموسمية المتوقعة
- عوامل التذبذب في الطلب (Ramadan، الصيف، العودة للمدارس...)
- توصيات مستويات المخزون الأمثل

## 2. تحسين المخزون
- معادلة حساب نقطة إعادة الطلب (Reorder Point)
- الحد الأدنى والأقصى للمخزون
- مقاييس الأداء (Inventory Turnover، Days Sales Outstanding)

## 3. تحسين سلسلة التوريد
- أفضل موردين أو قنوات توريد في مصر
- نصائح لتقليل تكلفة النقل والتخزين
- خطة الطوارئ عند الاضطرابات

## 4. توصيات وخطوات عملية
أهم 5 إجراءات يمكن تطبيقها فوراً`,
    });

    return NextResponse.json({ analysis: text, generatedAt: new Date().toISOString() });
  } catch (e) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ event: 'supply_chain_ai_error', error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: 'ai_error' }, { status: 500 });
  }
}
