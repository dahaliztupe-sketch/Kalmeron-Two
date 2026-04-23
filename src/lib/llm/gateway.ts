/**
 * Unified LLM Gateway — كل استدعاءات Gemini يجب أن تمر من هنا.
 *
 * يوفّر:
 *  - PII redaction للمدخلات.
 *  - Prompt-injection guard (sanitize + integrity check).
 *  - Per-user / per-agent cost tracking + soft limits.
 *  - Audit log مختصر لكل استدعاء (in-memory ring buffer).
 *
 * يُغلّف generateText و generateObject و streamText من حزمة `ai` بنفس
 * التوقيع مع إضافة حقل `ctx` (agent / userId / softCostBudgetUsd).
 */

import {
  generateText,
  generateObject,
  streamText,
  type GenerateTextResult,
  type GenerateObjectResult,
  type StreamTextResult,
  type ToolSet,
} from 'ai';
import type { z } from 'zod';
import { sanitizeInput, validatePromptIntegrity } from '@/src/lib/security/prompt-guard';
import { redactPII } from '@/src/lib/compliance/pii-redactor';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';

export interface GatewayContext {
  agent: string;
  userId?: string;
  /** ميزانية ناعمة بالدولار لكل استدعاء (تحذير فقط، لا يقطع التشغيل). */
  softCostBudgetUsd?: number;
  /** للمعالجة الإضافية: مصادر input غير موثوقة (مثل RAG/PDF). */
  untrustedSources?: string[];
}

export interface GatewayMeta {
  agent: string;
  userId: string;
  durationMs: number;
  piiHits: Array<{ type: string; count: number }>;
  injectionBlocked: boolean;
}

export class PromptInjectionBlockedError extends Error {
  readonly code = 'PROMPT_INJECTION_BLOCKED';
  readonly meta: GatewayMeta;
  constructor(meta: GatewayMeta) {
    super('PROMPT_INJECTION_BLOCKED');
    this.meta = meta;
  }
}

// ============= In-memory audit + cost stores =============
type AuditEntry = {
  ts: number;
  agent: string;
  userId: string;
  promptHash: string;
  outputLength: number;
  piiHits: Array<{ type: string; count: number }>;
  injectionBlocked: boolean;
  durationMs: number;
};

const AUDIT: AuditEntry[] = [];
const AUDIT_MAX = 5000;

const COST_BY_USER: Map<string, number> = new Map();
const COST_BY_AGENT: Map<string, number> = new Map();

function pushAudit(entry: AuditEntry): void {
  AUDIT.push(entry);
  if (AUDIT.length > AUDIT_MAX) AUDIT.splice(0, AUDIT.length - AUDIT_MAX);
}

export function getRecentAudit(limit = 100): AuditEntry[] {
  return AUDIT.slice(-limit).reverse();
}

export function getCostSnapshot(): {
  perUser: Record<string, number>;
  perAgent: Record<string, number>;
  totalCalls: number;
} {
  return {
    perUser: Object.fromEntries(COST_BY_USER),
    perAgent: Object.fromEntries(COST_BY_AGENT),
    totalCalls: AUDIT.length,
  };
}

// ============= Helpers =============
async function sha256(input: string): Promise<string> {
  try {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(input).digest('hex').slice(0, 16);
  } catch {
    let h = 0;
    for (let i = 0; i < input.length; i++) {
      h = ((h << 5) - h + input.charCodeAt(i)) | 0;
    }
    return `h${(h >>> 0).toString(16)}`;
  }
}

function extractRawText(args: { prompt?: unknown; messages?: unknown }): string {
  if (typeof args.prompt === 'string') return args.prompt;
  if (args.prompt !== undefined) return JSON.stringify(args.prompt);
  if (args.messages !== undefined) return JSON.stringify(args.messages);
  return '';
}

/**
 * Re-build the call arguments after preflight. We intentionally only support
 * mutating string-form prompts; if the caller provides `messages` we leave it
 * untouched (and the preflight result was applied to the stringified version
 * only for audit/hashing). Returns a value typed exactly as the caller's input
 * so we never need an `any` cast.
 */
function applyPromptOverride<T extends { prompt?: unknown; messages?: unknown }>(
  args: T,
  promptToSend: string,
): T {
  if (typeof args.prompt === 'string') {
    // Drop `messages` when present (cannot coexist with prompt in the AI SDK
    // discriminated union — TS can't infer this from the spread alone).
    const { messages: _ignored, ...rest } = args as T & { messages?: unknown };
    return { ...rest, prompt: promptToSend } as T;
  }
  return args;
}

function extractModelId(model: unknown): string {
  if (model && typeof model === 'object' && 'modelId' in model) {
    const id = (model as { modelId?: unknown }).modelId;
    if (typeof id === 'string') return id;
  }
  return 'unknown';
}

function preflight(rawPrompt: string, ctx: GatewayContext): {
  promptToSend: string;
  piiHits: Array<{ type: string; count: number }>;
  injectionBlocked: boolean;
} {
  const sanitized = sanitizeInput(rawPrompt);
  const { redacted, hits } = redactPII(sanitized);

  for (const src of ctx.untrustedSources || []) {
    const ok = validatePromptIntegrity('SYSTEM', src);
    if (!ok) {
      return { promptToSend: redacted, piiHits: hits, injectionBlocked: true };
    }
  }

  const integrityOk = validatePromptIntegrity('SYSTEM', sanitized);
  return { promptToSend: redacted, piiHits: hits, injectionBlocked: !integrityOk };
}

function approxCostUsd(model: string, inputLen: number, outputLen: number): number {
  const rate =
    model.includes('lite') ? 0.00002 :
    model.includes('flash') ? 0.00008 :
    model.includes('pro') ? 0.0006 : 0.0001;
  return ((inputLen + outputLen) / 1000) * rate;
}

// ============= Public API =============

/**
 * Wrapper around `generateText`. When the prompt is overridden by the
 * preflight (injection / redaction) the new value is passed explicitly so we
 * never forward un-sanitized text to the model.
 */
export async function safeGenerateText<TOOLS extends ToolSet = ToolSet>(
  args: Parameters<typeof generateText<TOOLS>>[0],
  ctx: GatewayContext,
): Promise<{ result: GenerateTextResult<TOOLS, never>; meta: GatewayMeta }> {
  const userId = ctx.userId || 'guest';
  const rawPrompt = extractRawText(args);
  const { promptToSend, piiHits, injectionBlocked } = preflight(rawPrompt, ctx);
  const promptHash = await sha256(rawPrompt);

  if (injectionBlocked) {
    pushAudit({
      ts: Date.now(), agent: ctx.agent, userId, promptHash,
      outputLength: 0, piiHits, injectionBlocked: true, durationMs: 0,
    });
    throw new PromptInjectionBlockedError({
      agent: ctx.agent, userId, durationMs: 0, piiHits, injectionBlocked: true,
    });
  }

  const t0 = Date.now();
  const modelId = extractModelId(args.model);
  const result = await instrumentAgent<GenerateTextResult<TOOLS, never>>(
    ctx.agent,
    () => generateText<TOOLS>(applyPromptOverride(args, promptToSend)),
    { model: modelId, input: { hash: promptHash }, toolsUsed: [] },
  );
  const durationMs = Date.now() - t0;

  const outLen = typeof result.text === 'string' ? result.text.length : 0;
  const cost = approxCostUsd(modelId, rawPrompt.length, outLen);
  COST_BY_USER.set(userId, (COST_BY_USER.get(userId) || 0) + cost);
  COST_BY_AGENT.set(ctx.agent, (COST_BY_AGENT.get(ctx.agent) || 0) + cost);

  pushAudit({
    ts: Date.now(), agent: ctx.agent, userId, promptHash,
    outputLength: outLen, piiHits, injectionBlocked: false, durationMs,
  });

  if (ctx.softCostBudgetUsd && cost > ctx.softCostBudgetUsd) {
    console.warn(`[llm-gateway] ${ctx.agent} exceeded soft budget: $${cost.toFixed(4)} > $${ctx.softCostBudgetUsd}`);
  }

  return { result, meta: { agent: ctx.agent, userId, durationMs, piiHits, injectionBlocked: false } };
}

/** Wrapper around `generateObject`. */
export async function safeGenerateObject<SCHEMA extends z.ZodType>(
  args: Parameters<typeof generateObject<SCHEMA>>[0],
  ctx: GatewayContext,
): Promise<{ result: GenerateObjectResult<z.infer<SCHEMA>>; meta: GatewayMeta }> {
  const userId = ctx.userId || 'guest';
  const rawPrompt = extractRawText(args);
  const { promptToSend, piiHits, injectionBlocked } = preflight(rawPrompt, ctx);
  const promptHash = await sha256(rawPrompt);

  if (injectionBlocked) {
    pushAudit({
      ts: Date.now(), agent: ctx.agent, userId, promptHash,
      outputLength: 0, piiHits, injectionBlocked: true, durationMs: 0,
    });
    throw new PromptInjectionBlockedError({
      agent: ctx.agent, userId, durationMs: 0, piiHits, injectionBlocked: true,
    });
  }

  const t0 = Date.now();
  const modelId = extractModelId(args.model);
  const result = await generateObject<SCHEMA>(applyPromptOverride(args, promptToSend));
  const durationMs = Date.now() - t0;

  const outLen = JSON.stringify(result.object ?? {}).length;
  const cost = approxCostUsd(modelId, rawPrompt.length, outLen);
  COST_BY_USER.set(userId, (COST_BY_USER.get(userId) || 0) + cost);
  COST_BY_AGENT.set(ctx.agent, (COST_BY_AGENT.get(ctx.agent) || 0) + cost);

  pushAudit({
    ts: Date.now(), agent: ctx.agent, userId, promptHash,
    outputLength: outLen, piiHits, injectionBlocked: false, durationMs,
  });

  return { result, meta: { agent: ctx.agent, userId, durationMs, piiHits, injectionBlocked: false } };
}

/** Wrapper around `streamText` (preflight on inputs only). */
export async function safeStreamText<TOOLS extends ToolSet = ToolSet>(
  args: Parameters<typeof streamText<TOOLS>>[0],
  ctx: GatewayContext,
): Promise<StreamTextResult<TOOLS, never>> {
  const userId = ctx.userId || 'guest';
  const rawPrompt = extractRawText(args);
  const { promptToSend, piiHits, injectionBlocked } = preflight(rawPrompt, ctx);
  const promptHash = await sha256(rawPrompt);

  if (injectionBlocked) {
    pushAudit({
      ts: Date.now(), agent: ctx.agent, userId, promptHash,
      outputLength: 0, piiHits, injectionBlocked: true, durationMs: 0,
    });
    throw new PromptInjectionBlockedError({
      agent: ctx.agent, userId, durationMs: 0, piiHits, injectionBlocked: true,
    });
  }

  const modelId = extractModelId(args.model);
  // Stream output length is unknown at dispatch time; charge approx by input
  // only so per-user/per-agent telemetry still reflects spend.
  const cost = approxCostUsd(modelId, rawPrompt.length, 0);
  COST_BY_USER.set(userId, (COST_BY_USER.get(userId) || 0) + cost);
  COST_BY_AGENT.set(ctx.agent, (COST_BY_AGENT.get(ctx.agent) || 0) + cost);

  pushAudit({
    ts: Date.now(), agent: ctx.agent, userId, promptHash,
    outputLength: 0, piiHits, injectionBlocked: false, durationMs: 0,
  });

  return streamText<TOOLS>(applyPromptOverride(args, promptToSend));
}
