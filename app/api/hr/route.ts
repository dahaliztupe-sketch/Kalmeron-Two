/**
 * POST /api/hr — HR & hiring strategy generator for Egyptian startups
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

const HRSchema = z.object({
  jobTitle: z.string().min(2).max(200),
  stage: z.string().max(100).default('Seed'),
  budget: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(500).optional(),
  department: z.string().max(100).default('general'),
  output: z.enum(['jd', 'interview', 'plan', 'full']).default('full'),
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

  const parsed = HRSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
  }

  const { jobTitle, stage, budget, teamSize, department, output } = parsed.data;

  const outputMap = {
    jd: 'وصف وظيفي احترافي فقط',
    interview: 'خطة مقابلة وأسئلة فقط',
    plan: 'خطة توظيف استراتيجية فقط',
    full: 'الوصف الوظيفي + خطة المقابلة + استراتيجية التوظيف',
  };

  try {
    const { text } = await generateText({
      model: MODEL,
      prompt: `أنت مدير موارد بشرية خبير في الشركات الناشئة المصرية.

المنصب: ${jobTitle}
مرحلة الشركة: ${stage}
${budget ? `الراتب المتاح: ${budget} جنيه شهرياً` : ''}
${teamSize ? `حجم الفريق الحالي: ${teamSize} شخص` : ''}
القسم: ${department}

المطلوب: ${outputMap[output]}

## الوصف الوظيفي (JD)
- المسمى الوظيفي الدقيق
- ملخص الدور (3-4 جمل)
- المسؤوليات الرئيسية (8-10 نقاط)
- المتطلبات الأساسية
- المتطلبات التفضيلية
- الراتب والمزايا المقترحة للسوق المصري

## خطة المقابلة
- مراحل الفرز (Resume → Phone → Technical → Culture Fit)
- 10 أسئلة مقابلة مهيكلة مع إجابات نموذجية
- اختبار تقني/عملي مقترح (خلال ساعة)

## استراتيجية التوظيف
- قنوات الإعلان الأمثل (LinkedIn، Wuzzuf، Forasna...)
- جدول زمني (Timeline من الإعلان للتوظيف)
- علامات التحذير التي تجنبها في المرشحين`,
    });

    return NextResponse.json({ plan: text, generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('[hr] AI error:', e);
    return NextResponse.json({ error: 'ai_error' }, { status: 500 });
  }
}
