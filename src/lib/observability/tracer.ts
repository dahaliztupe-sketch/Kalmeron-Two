/**
 * Lightweight agent execution tracer.
 *
 * Wraps an `executeFn` with a structured-logging trace span so every agent
 * call produces a `agent_trace_*` log line carrying agent name, user id,
 * input shape, duration, and outcome. Errors are re-thrown after being
 * logged so callers can keep their own catch logic.
 *
 * For richer LLM observability (prompts, completions, scores, eval IDs),
 * use `src/lib/observability/langfuse.ts`. This tracer is the cheap, always-on
 * fallback that keeps a request-scoped trail even when Langfuse is absent.
 */
import { logger } from '@/src/lib/logger';
import { randomUUID } from 'crypto';

export interface TraceOptions {
  /** Optional parent span / request id; auto-generated when missing. */
  spanId?: string;
  /** Lightweight tags to attach to every emitted log line. */
  tags?: Record<string, string | number | boolean | undefined>;
}

function shapeOfInput(input: unknown): {
  type: string;
  size?: number;
  keys?: string[];
} {
  if (input === null || input === undefined) return { type: 'empty' };
  if (typeof input === 'string') return { type: 'string', size: input.length };
  if (Array.isArray(input)) return { type: 'array', size: input.length };
  if (typeof input === 'object') {
    return { type: 'object', keys: Object.keys(input as Record<string, unknown>).slice(0, 10) };
  }
  return { type: typeof input };
}

export async function traceAgentExecution<T>(
  agentName: string,
  userId: string,
  input: unknown,
  executeFn: () => Promise<T>,
  options: TraceOptions = {},
): Promise<T> {
  const spanId = options.spanId || randomUUID();
  const startedAt = Date.now();
  const log = logger.child({
    spanId,
    agent: agentName,
    userId: userId || 'anonymous',
    ...options.tags,
  });

  log.info({ event: 'agent_trace_start', input: shapeOfInput(input) }, 'agent_trace_start');

  try {
    const result = await executeFn();
    log.info(
      { event: 'agent_trace_finish', durationMs: Date.now() - startedAt, ok: true },
      'agent_trace_finish',
    );
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(
      {
        event: 'agent_trace_error',
        durationMs: Date.now() - startedAt,
        ok: false,
        err: message,
      },
      'agent_trace_error',
    );
    throw error;
  }
}
