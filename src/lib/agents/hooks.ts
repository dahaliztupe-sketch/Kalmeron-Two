/**
 * Post-run side-effects for major agent entry points: metering, notifications, webhooks.
 * All helpers are best-effort — they log & swallow errors so they never break the agent.
 */
import { recordUsage } from '@/src/lib/billing/metering';
import { notify } from '@/src/lib/notifications/center';
import { dispatchEvent, type WebhookEvent } from '@/src/lib/webhooks/dispatcher';
import { writeAudit } from '@/src/lib/audit/log';
import { logger } from '@/src/lib/logger';

const hookLogger = logger.child({ component: 'agent-hooks' });

export async function afterAgentRun(args: {
  workspaceId: string;
  userId?: string;
  agent: string;
  event?: WebhookEvent;
  notification?: { title: string; body: string; href?: string; type: string };
  payload?: unknown;
  estimatedTokens?: number;
  estimatedCostUSD?: number;
}) {
  const { workspaceId, agent } = args;
  const tokens = args.estimatedTokens ?? 2000; // safe default per-run estimate
  const cost = args.estimatedCostUSD ?? tokens * 0.000_0015; // rough gemini-flash rate
  try {
    await recordUsage({
      workspaceId,
      userId: args.userId,
      agent,
      outputTokens: tokens,
      costUSD: cost,
    });
  } catch (e) {
    hookLogger.error(
      { event: 'record_usage_failed', err: e instanceof Error ? e.message : String(e), agent, workspaceId },
      'record_usage_failed',
    );
  }
  if (args.userId && args.notification) {
    try {
      await notify({
        userId: args.userId,
        workspaceId,
        type: args.notification.type,
        title: args.notification.title,
        body: args.notification.body,
        href: args.notification.href,
      });
    } catch (e) {
      hookLogger.error(
        { event: 'notify_failed', err: e instanceof Error ? e.message : String(e), agent, workspaceId },
        'notify_failed',
      );
    }
  }
  if (args.event && args.payload) {
    try {
      await dispatchEvent(workspaceId, args.event, args.payload);
    } catch (e) {
      hookLogger.error(
        {
          event: 'dispatch_event_failed',
          err: e instanceof Error ? e.message : String(e),
          agent,
          workspaceId,
          webhookEvent: args.event,
        },
        'dispatch_event_failed',
      );
    }
  }
  try {
    await writeAudit({
      actorId: args.userId || null,
      actorType: 'system',
      action: 'agent_run',
      resource: agent,
      workspaceId,
      success: true,
      metadata: { event: args.event, tokensEstimated: tokens, costEstimated: cost },
    });
  } catch {}
}
