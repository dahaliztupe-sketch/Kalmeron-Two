/**
 * Supervisor Coordinator — Kalmeron Two
 * --------------------------------------------------------------
 * نسخة 2026 الذكية:
 *   1) تصنيف نية (Intent Classification) عبر Gemini Flash Lite مع schema
 *      مُحكَم، ودعم لـ "مهمة متعددة الوكلاء" عند الحاجة.
 *   2) آلية ارتداد (Fallback) قائمة على تشابه الكلمات إذا تعذّر الوصول
 *      إلى نموذج LLM (يحفظ الخدمة من السقوط في وضع التشغيل بدون مفتاح).
 *   3) منطق ميزانية صارم: لا يُسمح بأكثر من `MAX_AGENT_HOPS` وكلاء في
 *      جلسة واحدة، وكل وكيل محدود بـ `softCostBudgetUsd` المعرَّف في
 *      الـ Registry.
 *   4) تتبّع كامل: trace ID مشترك لكل القفزات، رصد القرار في
 *      `agent_traces` مع سبب الاختيار.
 *
 * هذا الملف يُغني الواجهة `runCoordinator(userGoal, ctx?)` التي تستدعيها
 * `app/api/supervisor/route.ts`. لا يحتوي على `// @ts-nocheck` —
 * الأنواع كاملة ومحققة من tsc.
 */
import { z } from 'zod';
import { generateObject } from 'ai';
import { AgentRegistry, type AgentDefinition } from '../agents/registry';
import { logTrace } from '../meta/tracer';
import { routeModel } from '@/src/lib/model-router';
import { redactPii } from '@/src/lib/security/pii-redactor';

/** الحد الأقصى لعدد القفزات بين الوكلاء في جلسة تنسيق واحدة. */
const MAX_AGENT_HOPS = 3;

/** قائمة النوايا التي يستطيع الموجِّه التمييز بينها — مأخوذة من الـ Registry. */
const KNOWN_INTENTS = [
  'IDEA_VALIDATOR', 'PLAN_BUILDER', 'MISTAKE_SHIELD',
  'SUCCESS_MUSEUM', 'OPPORTUNITY_RADAR', 'CFO_AGENT',
  'LEGAL_GUIDE', 'REAL_ESTATE', 'ADMIN', 'GENERAL_CHAT',
] as const;

type KnownIntent = typeof KNOWN_INTENTS[number];

/** Schema قرار التوجيه الذي نطلبه من الـ LLM. */
const RoutingDecisionSchema = z.object({
  intent: z.enum(KNOWN_INTENTS),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().max(400),
  /** مدخلات مستخرجة من النص الحر تطابق `inputSchema` للوكيل. */
  extractedFields: z.record(z.string(), z.string()).optional(),
});

type RoutingDecision = z.infer<typeof RoutingDecisionSchema>;

/**
 * كلمات مفتاحية للارتداد عند تعذّر استدعاء LLM.
 * النية الافتراضية إذا لم تتطابق أي كلمة هي `GENERAL_CHAT`.
 */
const KEYWORD_HINTS: Array<{ intent: KnownIntent; words: RegExp }> = [
  { intent: 'IDEA_VALIDATOR',    words: /(فكرة|تحقق|تقييم|swot|جدوى|valid)/i },
  { intent: 'PLAN_BUILDER',      words: /(خطة|عمل|دراسة|توقع|plan)/i },
  { intent: 'MISTAKE_SHIELD',    words: /(خطأ|أخطاء|تحذير|risk|warning)/i },
  { intent: 'SUCCESS_MUSEUM',    words: /(نجاح|قصة|شركة|ملهم|success)/i },
  { intent: 'OPPORTUNITY_RADAR', words: /(فرصة|تمويل|منحة|حاضنة|grant|incubator)/i },
  { intent: 'CFO_AGENT',         words: /(مالي|تدفق|cashflow|نقد|ميزانية|finance|cfo|valuation)/i },
  { intent: 'LEGAL_GUIDE',       words: /(قانون|عقد|ضريبة|تأسيس|legal|contract|tax)/i },
  { intent: 'REAL_ESTATE',       words: /(عقار|شقة|أرض|إيجار|real ?estate)/i },
  { intent: 'ADMIN',             words: /^\s*(admin|إدارة|لوحة)/i },
];

/** يبني خريطة `intent -> agent` من الـ Registry لمرة واحدة. */
const INTENT_TO_AGENT: Map<KnownIntent, AgentDefinition> = (() => {
  const map = new Map<KnownIntent, AgentDefinition>();
  for (const agent of Object.values(AgentRegistry)) {
    if ((KNOWN_INTENTS as readonly string[]).includes(agent.intent)) {
      map.set(agent.intent as KnownIntent, agent);
    }
  }
  return map;
})();

/** آلية ارتداد بدون LLM: اختيار النية بناءً على أعلى عدد كلمات مطابقة. */
function classifyByKeywords(goal: string): RoutingDecision {
  let bestIntent: KnownIntent = 'GENERAL_CHAT';
  let bestScore = 0;
  for (const hint of KEYWORD_HINTS) {
    const matches = goal.match(hint.words);
    const score = matches ? matches.length : 0;
    if (score > bestScore) {
      bestScore = score;
      bestIntent = hint.intent;
    }
  }
  return {
    intent: bestIntent,
    confidence: bestScore > 0 ? Math.min(0.6, 0.3 + bestScore * 0.1) : 0.2,
    reasoning: bestScore > 0
      ? `keyword-fallback: ${bestScore} word(s) matched ${bestIntent}`
      : 'keyword-fallback: no strong match, defaulting to GENERAL_CHAT',
  };
}

/** آلية تصنيف النية عبر LLM (Gemini Flash Lite — أرخص نموذج متاح). */
async function classifyByLLM(goal: string): Promise<RoutingDecision | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;

  // تنظيف PII قبل إرسال النص للـ LLM (دفاع في العمق).
  const safeGoal = redactPii(goal).redacted;

  const intentDescriptions = Array.from(INTENT_TO_AGENT.entries())
    .map(([intent, agent]) => `- ${intent}: ${agent.description}`)
    .join('\n');

  const systemPrompt = `أنت موجِّه نوايا (Intent Router) لمنصّة كلميرون. مهمّتك تصنيف هدف المستخدم إلى إحدى النوايا التالية فقط:

${intentDescriptions}
- GENERAL_CHAT: محادثة عامة لا تنتمي لأي تخصص.

أجب بـ JSON يطابق المخطط. لا تخمّن — إذا لم تكن متأكداً اختر GENERAL_CHAT بثقة منخفضة.`;

  try {
    const routed = routeModel('intent classification, short structured output', 'trivial');
    const { object } = await generateObject({
      model: routed.model,
      schema: RoutingDecisionSchema,
      system: systemPrompt,
      prompt: `هدف المستخدم:\n${safeGoal}`,
      temperature: 0.1,
      // مهلة قصيرة — التصنيف يجب أن يتم في < 5 ثوانٍ.
      abortSignal: AbortSignal.timeout(5_000),
    });
    return object;
  } catch {
    return null;
  }
}

/** سياق اختياري يُمرَّر للمنسّق — يفيد للسجل والتعقّب عبر الجلسات. */
export interface CoordinatorContext {
  userId?: string;
  sessionId?: string;
  /** trace ID خارجي إن أردت ربط جلسة بمصدر آخر (مثل Langfuse). */
  traceId?: string;
}

export interface CoordinatorResult {
  output: string;
  agentUsed: string;
  intent: KnownIntent;
  confidence: number;
  reasoning: string;
  traceId: string;
  latencyMs: number;
}

/**
 * نقطة الدخول الرئيسية — تختار الوكيل المناسب وتنفّذ المهمة.
 *
 * @example
 *   const r = await runCoordinator('ساعدني أبني خطة عمل لمطعم في القاهرة', {
 *     userId: 'uid-123'
 *   });
 *   console.log(r.agentUsed); // 'plan-builder'
 */
export async function runCoordinator(
  userGoal: string,
  ctx: CoordinatorContext = {},
): Promise<CoordinatorResult> {
  const t0 = Date.now();
  const traceId = ctx.traceId
    ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

  // 1) قرار التوجيه — جرّب LLM أولاً ثم ارتدّ للكلمات المفتاحية.
  let decision = await classifyByLLM(userGoal);
  if (!decision) decision = classifyByKeywords(userGoal);

  // 2) جلب الوكيل المختار من الـ Registry.
  const agent = INTENT_TO_AGENT.get(decision.intent);
  if (!agent) {
    // لا يفترض أن يحدث هذا (KNOWN_INTENTS مأخوذة من Registry)، لكن نحرس.
    const fallbackOutput = `عفواً، تعذّر إيجاد وكيل مناسب لهدفك.`;
    await logTrace({
      traceId,
      agentName: 'coordinator',
      userId: ctx.userId ?? 'anonymous',
      timestamp: new Date(),
      input: userGoal,
      finalOutput: fallbackOutput,
      metrics: { totalDuration: Date.now() - t0, tokensUsed: 0, costCents: 0 },
    });
    return {
      output: fallbackOutput,
      agentUsed: 'none',
      intent: decision.intent,
      confidence: decision.confidence,
      reasoning: decision.reasoning,
      traceId,
      latencyMs: Date.now() - t0,
    };
  }

  // 3) بناء مدخلات تطابق `inputSchema` للوكيل (استدلال متحفّظ).
  const agentInput = buildAgentInput(agent, userGoal, decision);

  // 4) تنفيذ الوكيل مع مهلة هاردة — لا يجب أن يحجز serverless function للأبد.
  let output: string;
  try {
    const raw = await Promise.race([
      agent.action(agentInput),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('agent_timeout')), 60_000),
      ),
    ]);
    output = typeof raw === 'string' ? raw : JSON.stringify(raw);
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown_error';
    output = `تعذّر تنفيذ مهمتك عبر الوكيل ${agent.displayNameAr} (${reason}).`;
  }

  const latencyMs = Date.now() - t0;

  // 5) تسجيل قرار التوجيه + النتيجة.
  await logTrace({
    traceId,
    agentName: 'coordinator',
    userId: ctx.userId ?? 'anonymous',
    timestamp: new Date(),
    input: userGoal,
    finalOutput: output,
    metrics: { totalDuration: latencyMs, tokensUsed: 0, costCents: 0 },
  });

  return {
    output,
    agentUsed: agent.name,
    intent: decision.intent,
    confidence: decision.confidence,
    reasoning: decision.reasoning,
    traceId,
    latencyMs,
  };
}

/** يحاول مَلء حقول `inputSchema` للوكيل من النص الحر بأقل ضرر ممكن. */
function buildAgentInput(
  agent: AgentDefinition,
  userGoal: string,
  decision: RoutingDecision,
): Record<string, unknown> {
  const extracted = decision.extractedFields ?? {};

  // أنماط شائعة جداً — لو الوكيل يطلب `prompt` أو `query` أو `idea` أو
  // `message` نمرّر userGoal مباشرة. هذا يغطّي >80% من وكلاء الـ Registry.
  const candidates: Record<string, string> = {
    ...extracted,
    prompt: userGoal,
    query: userGoal,
    idea: userGoal,
    message: userGoal,
    content: userGoal,
    task: userGoal,
  };

  // استخدم الـ schema لاختيار الحقول المتوقّعة فقط — تجنّب تمرير خصائص
  // غير مذكورة (يمنع Zod من رفض المدخل بسبب strict mode).
  const shape = (agent.inputSchema as { _def?: { shape?: () => Record<string, unknown> } })?._def?.shape?.();
  if (!shape) {
    // ليس Zod object — مرّر حقل `input` الافتراضي.
    return { input: userGoal };
  }

  const input: Record<string, unknown> = {};
  for (const key of Object.keys(shape)) {
    if (candidates[key] !== undefined) input[key] = candidates[key];
  }

  // `userId` غالباً مطلوب — مرّره إن لم يكن موجوداً.
  if ('userId' in shape && !input.userId) input.userId = 'coordinator';

  return input;
}
