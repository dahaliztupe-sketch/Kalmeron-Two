/**
 * POST /api/real-estate — AI-powered Egyptian real estate deal analyzer
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { buildKey, hashInputs, withCache, TTL } from '@/src/lib/cache/firestore-cache';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

const AnalyzeSchema = z.object({
  location: z.string().min(3).max(500),
  price: z.string().max(100).optional(),
  size: z.string().max(100).optional(),
  purpose: z.enum(['investment', 'residence', 'commercial']).default('investment'),
  notes: z.string().max(1000).optional(),
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

  const parsed = AnalyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
  }

  const { location, price, size, purpose, notes } = parsed.data;

  const purposeMap = {
    investment: 'استثمار عقاري',
    residence: 'سكن شخصي',
    commercial: 'نشاط تجاري',
  };

  const cacheKey = buildKey(
    'real-estate',
    hashInputs(location, price ?? '', size ?? '', purpose, notes ?? ''),
  );

  const promptText = `أنت خبير عقاري مصري محترف مع خبرة 15 عاماً في السوق المصري.

الموقع: ${location}
${price ? `السعر المطلوب: ${price} جنيه` : ''}
${size ? `المساحة: ${size}` : ''}
الغرض: ${purposeMap[purpose]}
${notes ? `ملاحظات إضافية: ${notes}` : ''}

قدّم تحليلاً عقارياً شاملاً بالعربية يشمل:

## 1. تقييم الموقع
جودة الحي، البنية التحتية، مستقبل المنطقة، القرب من المرافق

## 2. التحليل المالي
${price ? `- سعر المتر المربع: احسب وقارن بالسوق
- معدل العائد السنوي المتوقع (Cap Rate)
- مدة استرداد رأس المال
- قاعدة الـ 1% (هل يحقق 1% شهرياً؟)` : '- تقدير سعري مقارن بالسوق\n- معدل العائد المتوقع'}

## 3. مقارنة السوق
أسعار مماثلة في المنطقة وأرقام واقعية

## 4. مخاطر الاستثمار
العوامل السلبية والتحديات المحتملة

## 5. توصية نهائية ⭐
هل الصفقة تستحق؟ التقييم من 10 وخطوات العمل التالية`;

  try {
    const { value: analysis, hit } = await withCache<string>(
      cacheKey,
      TTL.TWELVE_HOURS,
      async () => {
        const { text } = await generateText({ model: MODEL, prompt: promptText });
        return text;
      },
    );

    return NextResponse.json({ analysis, generatedAt: new Date().toISOString(), cached: hit });
  } catch (e) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ event: 'real_estate_ai_error', error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: 'ai_error' }, { status: 500 });
  }
}
