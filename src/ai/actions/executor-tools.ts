// @ts-nocheck
/**
 * Helper: convert any registry action into a Mastra tool that enqueues
 * via `requestAction(...)`.
 *
 * Usage in an agent:
 *   tools: {
 *     ...executorTools([
 *       'crm_add_lead',
 *       'sales_send_outreach_email',
 *     ]),
 *   }
 *
 * The agent calls e.g. `enqueue_sales_send_outreach_email({ to, subject, body, rationale })`
 * and the system either:
 *   - executes immediately (if the action does not require approval), or
 *   - puts a pending row in the founder's approval inbox.
 */
import { z } from 'zod';
import { requestAction, getAction } from './registry';

interface ToolDef {
  description: string;
  parameters: z.ZodTypeAny;
  execute: (args: unknown, ctx?: { userId?: string; agentId?: string }) => Promise<unknown>;
}

export function executorTools(actionIds: string[]): Record<string, ToolDef> {
  const tools: Record<string, ToolDef> = {};
  for (const actionId of actionIds) {
    const def = getAction(actionId);
    if (!def) continue;
    const toolName = `enqueue_${actionId}`;
    // Wrap the action's schema to also require a `rationale` from the agent.
    // We can't introspect arbitrary z schemas safely, so we accept any input
    // and let the registry's own zod schema validate it on enqueue.
    tools[toolName] = {
      description: `${def.label}${def.requiresApproval ? ' (يتطلّب موافقة المؤسّس)' : ' (تنفيذ مباشر)'} — ${def.description}`,
      parameters: z.object({
        input: z.any(),
        rationale: z.string().min(10).describe('سبب طلب هذا الإجراء — يساعد المؤسّس على القرار.'),
      }),
      execute: async (args, ctx) => {
        const userId = ctx?.userId;
        if (!userId) {
          return { ok: false, error: 'no_user_context', message: 'سياق المستخدم مفقود.' };
        }
        try {
          const r = await requestAction({
            userId,
            actionId,
            input: (args as { input: unknown }).input,
            rationale: (args as { rationale: string }).rationale,
            requestedBy: ctx?.agentId || 'agent',
          });
          return {
            ok: true,
            actionDocId: r.id,
            status: r.status,
            message:
              r.status === 'pending'
                ? 'وُضع الطلب في صندوق موافقات المؤسّس. لن يُنفَّذ قبل الموافقة.'
                : `تم التنفيذ مباشرةً (${r.status}).`,
          };
        } catch (e: unknown) {
          return { ok: false, error: (e as Error)?.message || 'enqueue_failed' };
        }
      },
    };
  }
  return tools;
}
