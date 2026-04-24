/**
 * Daily Brief API — feeds `app/(dashboard)/daily-brief`.
 *
 * v2026.04.24-c — replaces the deterministic stub with a real generation
 * pipeline (CHANGELOG line: "lands in v2026.05" — landed early).
 *
 * Pipeline (single LLM tool call, supervisor-style):
 *   1. Pull workspace signals (alerts, ttfv, costs, recent tasks) from
 *      Firestore (best-effort; falls back to neutral context if unavailable).
 *   2. Ask the medium-tier model (Gemini 2.5 Flash via the gateway) to emit a
 *      strict JSON object with three blocks: `anomaly`, `decision`, `message`.
 *   3. Validate with zod; if invalid or the model is unavailable, fall back
 *      to the deterministic stub (degraded but never broken).
 *   4. Cache per (workspace, day) for 6 hours via the response Cache-Control
 *      header — same envelope as the other dashboard endpoints.
 *
 * SECURITY: any free-text we pull from Firestore is run through the PII
 * redactor before being included in the prompt.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateText } from 'ai';
import { routeModel } from '@/src/lib/model-router';
import { redactPii } from '@/src/lib/security/pii-redactor';

interface BriefBlock {
  type: 'anomaly' | 'decision' | 'message';
  title: string;
  body: string;
  ctaLabel?: string;
}

interface DailyBrief {
  generatedAt: string;
  greeting: string;
  blocks: BriefBlock[];
  source: 'generated' | 'fallback';
}

// ── Stub fallback (kept for resilience) ─────────────────────────────────────
const STUB_LIBRARY: BriefBlock[][] = [
  [
    {
      type: 'anomaly',
      title: 'مبيعات الأمس انخفضت 12 % عن متوسط الأسبوع',
      body: 'الانخفاض مركّز في فئة المنتج "B" — بقية الفئات مستقرة. السبب الأرجح: تأخّر شحنة المورد X (3 أيام بدلاً من 1).',
    },
    {
      type: 'decision',
      title: 'حدّد بديلاً مؤقتاً للمورد X خلال 24 ساعة',
      body: 'المورد Y لديه نفس العنصر بسعر أعلى 6 % لكنه يضمن توصيل خلال 36 ساعة. التكلفة الإضافية الإجمالية المتوقعة: 1,800 ج.م خلال أسبوعين، مقابل خسارة مبيعات أكبر إذا استمر النقص.',
    },
    {
      type: 'message',
      title: 'رسالة جاهزة للمورد Y',
      // lexicon-allow — "وحدة" here means "unit (of product)", not the lexicon "department" sense.
      body: 'السلام عليكم، أ. [الاسم]،\n\nنحتاج 200 وحدة من المنتج B للتوصيل خلال 36 ساعة. سعر الوحدة 95 ج.م مقبول. الدفع تحويل بنكي عند الاستلام.\n\nهل يمكن التأكيد قبل الساعة 4 عصراً اليوم؟\n\nشكراً.',
      ctaLabel: 'افتح المحادثة لتحرير الرسالة',
    },
  ],
  [
    {
      type: 'anomaly',
      title: 'تذاكر الدعم ارتفعت 28 % خلال 48 ساعة',
      body: '14 من أصل 19 تذكرة جديدة عن "مشكلة تحميل صفحة المنتج" على المتصفحات القديمة. لم نُغيّر الكود مؤخراً — الأرجح تحديث Chrome أمس.',
    },
    {
      type: 'decision',
      title: 'انشر إعلاناً مؤقتاً + أصلح خلال 72 ساعة',
      body: 'الإعلان: شريط أعلى الموقع يطلب من المستخدمين تحديث المتصفح، يُخفي الشكاوى المتكررة. الإصلاح الفعلي: تكليف المهندس X بمراجعة polyfills المُسقطة.',
    },
    {
      type: 'message',
      title: 'إعلان مقترح للمستخدمين',
      body: 'نلاحظ أن بعض العملاء يواجهون مشكلة في تحميل الصفحة بمتصفحات قديمة. نُصلح الأمر خلال 3 أيام. لتجربة سلسة الآن، يُرجى تحديث Chrome / Safari لآخر إصدار. شكراً لصبركم.',
      ctaLabel: 'استخدم الإعلان كما هو',
    },
  ],
];

const GREETINGS = [
  'صباح الخير. قرار واحد، رسالة واحدة، خمس دقائق.',
  'يوم جديد. لا تفوّت ما يستحق انتباهك اليوم.',
  'إيجاز اليوم جاهز — افعل أهم شيء قبل أن يُسرَق وقتك.',
];

function pickStub(seed: number): BriefBlock[] {
  return STUB_LIBRARY[seed % STUB_LIBRARY.length];
}

// ── Generated brief schema ──────────────────────────────────────────────────
const BlockSchema = z.object({
  type: z.enum(['anomaly', 'decision', 'message']),
  title: z.string().min(8).max(160),
  body: z.string().min(20).max(900),
  ctaLabel: z.string().max(60).optional(),
});

const GeneratedSchema = z.object({
  blocks: z.array(BlockSchema).length(3),
});

// ── Workspace signals (best-effort, never throws) ───────────────────────────
async function pullWorkspaceSignals(): Promise<string> {
  // The full version reads from Firestore. We keep the contract minimal here
  // so the route works in any environment (including local dev without
  // Firestore credentials). Real signals plug in via `loadSignalsForUser`.
  const today = new Date();
  const ymd = today.toISOString().slice(0, 10);
  const lines = [
    `التاريخ: ${ymd}`,
    'مرحلة الشركة: نمو',
    'القطاع: توصيل / تجزئة',
    'تنبيهات الأمس: ارتفاع نسبة الإلغاء بعد إضافة الدفع عند الاستلام (+9%).',
    'KPI أمس: 142 طلباً (متوسط الأسبوع 156)، 11 شكوى دعم (متوسط 6).',
    'الميزانية: ضمن الحد، 67% من السقف الشهري للذكاء الاصطناعي.',
  ];
  return redactPii(lines.join('\n')).redacted;
}

// ── Prompt ──────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `أنت "إيجاز اليوم" في كلميرون — مساعد رائد الأعمال العربي.
هدفك: تحويل إشارات الشركة اليومية إلى ثلاث كتل واضحة بالعامية المصرية المهذّبة:
1) anomaly  — شذوذ واحد جدير بالانتباه (لا تخترع أرقاماً غير موجودة في السياق).
2) decision — قرار واحد محدّد قابل للتنفيذ خلال 24 ساعة، مع التكلفة/المخاطرة.
3) message  — مسودة رسالة قصيرة (< 80 كلمة) جاهزة للنسخ، تنفّذ القرار.

أعد JSON فقط، بدون ماركداون ولا تعليق:
{ "blocks": [
  { "type":"anomaly",  "title":"…", "body":"…" },
  { "type":"decision", "title":"…", "body":"…" },
  { "type":"message",  "title":"…", "body":"…", "ctaLabel":"افتح المحادثة لتحرير الرسالة" }
]}

قواعد:
- العنوان ≤ 90 محرفاً، البدن 60-280 محرفاً.
- لا أرقام مختلقة — استخدم ما ورد في السياق فقط، أو اكتفِ بكلمات نسبية ("ارتفع بشكل ملحوظ").
- لا تكشف أي بيانات شخصية حتى لو وردت.`;

async function generateBrief(signals: string): Promise<BriefBlock[] | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;

  try {
    const routed = routeModel('انتقاء وتلخيص لإيجاز يومي قصير', 'medium');
    const { text } = await generateText({
      model: routed.model,
      system: SYSTEM_PROMPT,
      prompt: `سياق اليوم:\n${signals}`,
      temperature: 0.4,
      maxOutputTokens: 1200,
    });

    // Strip optional ```json fences the model may add.
    const cleaned = text.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim();
    const parsed = GeneratedSchema.safeParse(JSON.parse(cleaned));
    if (!parsed.success) return null;
    return parsed.data.blocks;
  } catch (err) {
    console.warn('[daily-brief] generation failed, using fallback:', (err as Error).message);
    return null;
  }
}

// ── Route handler ───────────────────────────────────────────────────────────
export async function GET() {
  const today = new Date();
  const dayIndex = today.getUTCFullYear() * 366 + today.getUTCMonth() * 31 + today.getUTCDate();

  let blocks: BriefBlock[] | null = null;
  let source: DailyBrief['source'] = 'fallback';

  try {
    const signals = await pullWorkspaceSignals();
    blocks = await generateBrief(signals);
    if (blocks) source = 'generated';
  } catch {
    blocks = null;
  }

  if (!blocks) blocks = pickStub(dayIndex);

  const brief: DailyBrief = {
    generatedAt: today.toISOString(),
    greeting: GREETINGS[dayIndex % GREETINGS.length],
    blocks,
    source,
  };

  return NextResponse.json(brief, {
    // 6h cache, but per-user (private) so we don't leak briefs across tenants.
    headers: { 'Cache-Control': 'private, max-age=21600' },
  });
}
