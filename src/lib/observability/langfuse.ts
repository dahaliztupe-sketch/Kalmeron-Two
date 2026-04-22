/**
 * Langfuse client — حقيقي، يستخدم حزمة `langfuse` الرسمية.
 * يعمل فقط إذا ضُبطت متغيرات البيئة LANGFUSE_PUBLIC_KEY و LANGFUSE_SECRET_KEY،
 * وإلا يسقط إلى وضع No-Op آمن دون كسر التطبيق.
 */
import { Langfuse } from 'langfuse';

const PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY;
const SECRET_KEY = process.env.LANGFUSE_SECRET_KEY;
const BASE_URL = process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com';

const isConfigured = Boolean(PUBLIC_KEY && SECRET_KEY);

interface NoOpTrace {
  id: string;
  span: (params: any) => { end: (data?: any) => void };
  generation: (params: any) => { end: (data?: any) => void };
  update: (data: any) => void;
}

const noopTrace = (): NoOpTrace => ({
  id: 'noop-' + Date.now().toString(36),
  span: () => ({ end: () => {} }),
  generation: () => ({ end: () => {} }),
  update: () => {},
});

const noopClient = {
  trace: () => noopTrace(),
  score: () => {},
  flushAsync: async () => {},
  shutdownAsync: async () => {},
};

export const langfuse: any = isConfigured
  ? new Langfuse({ publicKey: PUBLIC_KEY!, secretKey: SECRET_KEY!, baseUrl: BASE_URL })
  : noopClient;

export const isLangfuseEnabled = isConfigured;

/**
 * Helper مبسّط: يبدأ تتبّعاً لمحادثة كاملة ويُرجع كائن trace.
 */
export function startConversationTrace(opts: {
  userId?: string;
  threadId?: string;
  input: string;
  metadata?: Record<string, any>;
}) {
  return langfuse.trace({
    name: 'conversation',
    userId: opts.userId,
    sessionId: opts.threadId,
    input: opts.input,
    metadata: opts.metadata,
  });
}

/**
 * تسجيل استدعاء وكيل واحد كـ generation داخل trace أو منفصلاً.
 */
export function logAgentGeneration(params: {
  trace?: any;
  agent: string;
  model: string;
  input: any;
  output: any;
  latencyMs: number;
  success: boolean;
  totalTokens?: number;
}) {
  const target = params.trace || langfuse.trace({ name: params.agent });
  const gen = target.generation({
    name: params.agent,
    model: params.model,
    input: params.input,
    metadata: { latencyMs: params.latencyMs, success: params.success },
    usage: params.totalTokens ? { totalTokens: params.totalTokens } : undefined,
  });
  gen.end({ output: params.output });
  return gen;
}
