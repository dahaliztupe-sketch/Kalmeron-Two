// @ts-nocheck
/**
 * Helper: declare typed integration tools that gracefully report
 * "not configured" when their backing credentials are missing.
 * Once real credentials are added, replace the executors with live calls.
 */
import { z } from 'zod';
import { evaluatePolicy } from '@/src/lib/security/agent-governance';

export interface IntegrationToolDef<T extends z.ZodTypeAny = z.ZodTypeAny> {
  description: string;
  parameters: T;
  execute: (args: z.infer<T>, ctx?: { userId?: string; agentId?: string; autonomyLevel?: number }) => Promise<unknown>;
}

export function defineNotConfigured<T extends z.ZodTypeAny>(
  name: string,
  description: string,
  parameters: T,
  envHint: string,
): IntegrationToolDef<T> {
  return {
    description,
    parameters,
    execute: async (_args, ctx) => {
      const decision = await evaluatePolicy({
        userId: ctx?.userId || 'unknown',
        agentId: ctx?.agentId || 'unknown',
        toolName: name,
        args: _args,
        autonomyLevel: ctx?.autonomyLevel ?? 3,
      });
      return {
        ok: false,
        configured: false,
        approval: decision,
        message: `الأداة ${name} غير مفعّلة بعد. يلزم ضبط: ${envHint}.`,
      };
    },
  };
}
