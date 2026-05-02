/**
 * Daily Brief generator — shared by GET /api/daily-brief and POST /send.
 * Pulls real signals from Firestore (operations, approvals, recipes) when
 * available, falls back to a deterministic stub when not.
 */
import { z } from 'zod';
import { generateText } from 'ai';
import { routeModel } from '@/src/lib/model-router';
import { redactPii } from '@/src/lib/security/pii-redactor';
import { adminDb } from '@/src/lib/firebase-admin';

export interface BriefBlock {
  type: 'anomaly' | 'decision' | 'message';
  title: string;
  body: string;
  ctaLabel?: string;
}
export interface DailyBrief {
  generatedAt: string;
  greeting: string;
  blocks: BriefBlock[];
  source: 'generated' | 'fallback';
  signals?: {
    pendingApprovals: number;
    actionsLast24h: number;
    failedActions: number;
    activeRecipes: number;
    topPriority?: string;
  };
}

const STUB_LIBRARY: BriefBlock[][] = [
  [
    { type: 'anomaly', title: 'مبيعات الأمس انخفضت 12 % عن متوسط الأسبوع',
      body: 'الانخفاض مركّز في فئة المنتج "B" — بقية الفئات مستقرة. السبب الأرجح: تأخّر شحنة المورد X.' },
    { type: 'decision', title: 'حدّد بديلاً مؤقتاً للمورد X خلال 24 ساعة',
      body: 'المورد Y لديه نفس العنصر بسعر أعلى 6 % لكنه يضمن توصيل خلال 36 ساعة.' },
    { type: 'message', title: 'رسالة جاهزة للمورد Y',
      body: 'السلام عليكم، نحتاج 200 وحدة من المنتج B خلال 36 ساعة. السعر مقبول. هل يمكن التأكيد قبل 4 عصراً اليوم؟ شكراً.',
      ctaLabel: 'افتح المحادثة لتحرير الرسالة' },
  ],
  [
    { type: 'anomaly', title: 'تذاكر الدعم ارتفعت 28 % خلال 48 ساعة',
      body: 'معظم التذاكر الجديدة عن "مشكلة تحميل صفحة المنتج" على المتصفحات القديمة.' },
    { type: 'decision', title: 'انشر إعلاناً مؤقتاً + أصلح خلال 72 ساعة',
      body: 'شريط أعلى الموقع يطلب من المستخدمين تحديث المتصفح، مع تكليف مهندس بمراجعة polyfills.' },
    { type: 'message', title: 'إعلان مقترح للمستخدمين',
      body: 'نلاحظ أن بعض العملاء يواجهون مشكلة في التحميل بمتصفحات قديمة. نُصلح الأمر خلال 3 أيام. شكراً لصبركم.',
      ctaLabel: 'استخدم الإعلان كما هو' },
  ],
];

const GREETINGS = [
  'صباح الخير. قرار واحد، رسالة واحدة، خمس دقائق.',
  'يوم جديد. لا تفوّت ما يستحق انتباهك اليوم.',
  'إيجاز اليوم جاهز — افعل أهم شيء قبل أن يُسرَق وقتك.',
];

const BlockSchema = z.object({
  type: z.enum(['anomaly', 'decision', 'message']),
  title: z.string().min(8).max(200),
  body: z.string().min(20).max(900),
  ctaLabel: z.string().max(60).optional(),
});
const GeneratedSchema = z.object({ blocks: z.array(BlockSchema).length(3) });

async function pullWorkspaceSignals(userId: string): Promise<{ text: string; meta: DailyBrief['signals'] }> {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  let pendingApprovals = 0, actionsLast24h = 0, failedActions = 0, activeRecipes = 0;
  let topPending: string | undefined;
  let recentActions: string[] = [];

  try {
    const reqsCol = adminDb.collection('action_requests').where('userId', '==', userId);
    const recentSnap = await reqsCol.orderBy('createdAt', 'desc').limit(40).get().catch(() => null);
    if (recentSnap) {
      for (const d of recentSnap.docs) {
        const data = d.data() || {};
        const createdMs = data.createdAt?._seconds ? data.createdAt._seconds * 1000 : 0;
        if (createdMs >= since) actionsLast24h++;
        if (data.status === 'pending_approval') {
          pendingApprovals++;
          if (!topPending) topPending = data.actionId || data.title;
        }
        if (data.status === 'failed') failedActions++;
        if (data.recipeRunId) activeRecipes++;
        if (recentActions.length < 6 && data.actionId) {
          recentActions.push(`${data.actionId} → ${data.status}`);
        }
      }
    }
  } catch {}

  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    `التاريخ: ${today}`,
    `طلبات الموافقة المعلّقة: ${pendingApprovals}`,
    `إجراءات نُفّذت آخر 24 ساعة: ${actionsLast24h}`,
    `إجراءات فشلت: ${failedActions}`,
    `وصفات نشطة: ${activeRecipes}`,
    topPending ? `أهم طلب معلّق: ${topPending}` : '',
    recentActions.length ? `أحدث الإجراءات:\n- ${recentActions.join('\n- ')}` : '',
  ].filter(Boolean);

  return {
    text: redactPii(lines.join('\n')).redacted,
    meta: { pendingApprovals, actionsLast24h, failedActions, activeRecipes, topPriority: topPending },
  };
}

const SYSTEM_PROMPT = `أنت "إيجاز اليوم" في كلميرون — مساعد رائد الأعمال العربي.
هدفك: تحويل إشارات الشركة اليومية إلى ثلاث كتل واضحة بالعامية المصرية المهذّبة:
1) anomaly  — شذوذ واحد جدير بالانتباه (لا تخترع أرقاماً غير موجودة في السياق).
2) decision — قرار واحد محدّد قابل للتنفيذ خلال 24 ساعة، مع التكلفة/المخاطرة.
3) message  — مسودة رسالة قصيرة (< 80 كلمة) جاهزة للنسخ، تنفّذ القرار.

أعد JSON فقط:
{ "blocks": [
  { "type":"anomaly",  "title":"…", "body":"…" },
  { "type":"decision", "title":"…", "body":"…" },
  { "type":"message",  "title":"…", "body":"…", "ctaLabel":"افتح المحادثة لتحرير الرسالة" }
]}

قواعد: العنوان ≤ 90 محرفاً، البدن 60-280 محرفاً، لا أرقام مختلقة، لا بيانات شخصية.`;

async function generateBlocks(signals: string): Promise<BriefBlock[] | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;
  try {
    const routed = routeModel('انتقاء وتلخيص لإيجاز يومي قصير', 'medium');
    const { text } = await generateText({
      model: routed.model,
      system: SYSTEM_PROMPT,
      prompt: `سياق اليوم:\n${signals}`,
      temperature: 0.4,
      maxOutputTokens: 1200,
      abortSignal: AbortSignal.timeout(20_000),
    });
    const cleaned = text.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim();
    const parsed = GeneratedSchema.safeParse(JSON.parse(cleaned));
    if (!parsed.success) return null;
    return parsed.data.blocks;
  } catch (err) {
    // generation failed — caller will use fallback stub
    return null;
  }
}

export async function generateDailyBrief(userId: string): Promise<DailyBrief> {
  const today = new Date();
  const dayIndex = today.getUTCFullYear() * 366 + today.getUTCMonth() * 31 + today.getUTCDate();

  let blocks: BriefBlock[] | null = null;
  let source: DailyBrief['source'] = 'fallback';
  let signalsMeta: DailyBrief['signals'] | undefined;

  try {
    const { text, meta } = await pullWorkspaceSignals(userId);
    signalsMeta = meta;
    blocks = await generateBlocks(text);
    if (blocks) source = 'generated';
  } catch {}

  if (!blocks) blocks = STUB_LIBRARY[dayIndex % STUB_LIBRARY.length];

  return {
    generatedAt: today.toISOString(),
    greeting: GREETINGS[dayIndex % GREETINGS.length],
    blocks,
    source,
    signals: signalsMeta,
  };
}

/** Format brief as plain Arabic text for WhatsApp / SMS / email body */
export function formatBriefForChannel(brief: DailyBrief, channel: 'whatsapp' | 'email' | 'sms'): string {
  const date = new Date(brief.generatedAt).toLocaleDateString('ar-EG', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const sep = channel === 'email' ? '\n\n' : '\n\n';
  const header = channel === 'whatsapp'
    ? `🌅 *إيجاز كلميرون — ${date}*\n${brief.greeting}`
    : `إيجاز كلميرون — ${date}\n${brief.greeting}`;

  const sigLines = brief.signals
    ? `\n📊 ${brief.signals.pendingApprovals} موافقة معلّقة · ${brief.signals.actionsLast24h} إجراء آخر 24س · ${brief.signals.activeRecipes} وصفة نشطة`
    : '';

  const labels: Record<BriefBlock['type'], string> = {
    anomaly: channel === 'whatsapp' ? '⚠️ *شذوذ يستحق الانتباه*' : '⚠️ شذوذ يستحق الانتباه',
    decision: channel === 'whatsapp' ? '🎯 *قرار اليوم*' : '🎯 قرار اليوم',
    message: channel === 'whatsapp' ? '✉️ *رسالة جاهزة للنسخ*' : '✉️ رسالة جاهزة للنسخ',
  };

  const body = brief.blocks.map((b) => {
    const titleLine = channel === 'whatsapp' ? `${labels[b.type]}\n*${b.title}*` : `${labels[b.type]}\n${b.title}`;
    return `${titleLine}\n${b.body}`;
  }).join(sep);

  const footer = channel === 'whatsapp'
    ? '\n\n— كلميرون | https://kalmeron.app/daily-brief'
    : '\n\nافتح الإيجاز كاملاً: https://kalmeron.app/daily-brief';

  return `${header}${sigLines}${sep}${body}${footer}`;
}
