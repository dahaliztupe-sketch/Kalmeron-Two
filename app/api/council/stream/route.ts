import { NextRequest } from 'next/server';
import { z } from 'zod';
import { runCouncilSafe } from '@/src/ai/panel';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { adminAuth } from '@/src/lib/firebase-admin';
import { logger } from '@/src/lib/logger';

export const runtime = 'nodejs';

/**
 * Server-side whitelist of allowed council agents.
 * `agentName` must match a key in AgentRegistry (src/ai/agents/registry.ts).
 * `agentRoleAr` is derived here — never trusted from the client.
 */
const COUNCIL_AGENT_REGISTRY: Record<
  string,
  { labelAr: string; agentRoleAr: string }
> = {
  'ceo-agent': {
    labelAr: 'المدير التنفيذي',
    agentRoleAr: 'المدير التنفيذي الاستراتيجي المتخصص في قيادة الشركات الناشئة المصرية',
  },
  'cfo-agent': {
    labelAr: 'المالية',
    agentRoleAr: 'المدير المالي المتخصص في النمذجة المالية والتدفق النقدي للسوق المصري',
  },
  'marketing-strategist': {
    labelAr: 'التسويق',
    agentRoleAr: 'استراتيجي التسويق الرقمي المتخصص في الأسواق العربية وبناء العلامة التجارية',
  },
  'legal-guide': {
    labelAr: 'القانوني',
    agentRoleAr: 'المستشار القانوني المتخصص في قانون الشركات والملكية الفكرية في مصر',
  },
  'operations-manager': {
    labelAr: 'العمليات',
    agentRoleAr: 'مدير العمليات المتخصص في بناء الأنظمة والعمليات القابلة للتوسع',
  },
  'idea-validator': {
    labelAr: 'محلّل الأفكار',
    agentRoleAr: 'محلل الأفكار الريادية المتخصص في تقييم الجدوى وتحليل SWOT للسوق المصري',
  },
  'plan-builder': {
    labelAr: 'بنّاء خطة العمل',
    agentRoleAr: 'خبير بناء خطط الأعمال الاحترافية مع التوقعات المالية للسوق المصري',
  },
  'general-chat': {
    labelAr: 'المستشار العام',
    agentRoleAr: 'المستشار الاستراتيجي العام لرواد الأعمال المصريين',
  },
};

async function softAuth(req: NextRequest): Promise<{ userId: string; isGuest: boolean }> {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
      return { userId: dec.uid, isGuest: false };
    } catch {
      /* fall through */
    }
  }
  return { userId: 'guest', isGuest: true };
}

const bodySchema = z.object({
  question: z.string().min(2).max(4000),
  /** Client sends agent IDs (must be whitelisted keys in COUNCIL_AGENT_REGISTRY). */
  agentIds: z
    .array(z.string().min(1).max(64))
    .min(1)
    .max(8)
    .default(['ceo-agent', 'cfo-agent', 'marketing-strategist', 'legal-guide', 'operations-manager']),
  mode: z.enum(['fast', 'deep']).default('fast'),
});

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * POST /api/council/stream
 * Streams per-agent council responses as Server-Sent Events.
 * Each agent fires in parallel; as each completes, an `agent_done` event
 * is emitted immediately — the client renders agents as they arrive.
 *
 * SSE event types:
 *   agent_start  { agentId, labelAr }
 *   agent_done   { agentId, labelAr, markdown, error? }
 *   done         {}
 *
 * Security: agentName and agentRoleAr are derived server-side from the
 * whitelist above — client input is only the agentId key, which is
 * validated against the whitelist before use.
 */
export async function POST(req: NextRequest) {
  const { userId, isGuest } = await softAuth(req);
  const rl = rateLimit(req, {
    limit: isGuest ? 2 : 8,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();
  if (isGuest) {
    logger.warn({ event: 'council_stream_guest', path: '/api/council/stream' }, 'council_stream_guest');
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid body', details: parsed.error.flatten() }),
      { status: 400 },
    );
  }

  const { question, agentIds, mode } = parsed.data;

  // Validate every agentId against the server-side whitelist
  const resolvedAgents = agentIds
    .filter((id) => id in COUNCIL_AGENT_REGISTRY)
    .map((id) => ({ id, ...COUNCIL_AGENT_REGISTRY[id] }));

  if (resolvedAgents.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid agent IDs provided' }), { status: 400 });
  }

  // Track client disconnect so we don't continue after the connection closes
  const abort = new AbortController();
  req.signal.addEventListener('abort', () => abort.abort());

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const cancelled = () => abort.signal.aborted;

      const send = (event: string, data: unknown): boolean => {
        if (cancelled()) return false;
        try {
          controller.enqueue(enc.encode(sseEvent(event, data)));
          return true;
        } catch {
          return false;
        }
      };

      // Announce all agents as starting
      for (const agent of resolvedAgents) {
        if (!send('agent_start', { agentId: agent.id, labelAr: agent.labelAr })) return;
      }

      // Fire all agents in parallel; emit each result the moment it resolves
      await Promise.all(
        resolvedAgents.map(async (agent) => {
          if (cancelled()) return;
          try {
            const { markdown, error } = await runCouncilSafe({
              agentName: agent.id,
              agentDisplayNameAr: agent.labelAr,
              agentRoleAr: agent.agentRoleAr,
              userMessage: question,
              mode,
            });
            send('agent_done', { agentId: agent.id, labelAr: agent.labelAr, markdown, error });
          } catch (err) {
            const msg = (err as Error)?.message || 'unknown';
            send('agent_done', {
              agentId: agent.id,
              labelAr: agent.labelAr,
              markdown: `تعذّر الحصول على رأي هذا الوكيل.`,
              error: msg,
            });
          }
        }),
      );

      if (!cancelled()) {
        send('done', {});
        controller.close();
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
