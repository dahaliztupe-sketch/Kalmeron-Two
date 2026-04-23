// @ts-nocheck
  /**
   * Compliance & Monitoring Layer — مراقبة الأداء والتكلفة والامتثال
   * مستلهم من AgentMon: مراقبة مستمرة في الخلفية.
   */
  import { logger } from '@/src/lib/logger';
  import { EventEmitter } from 'events';

  export const monitorEvents = (globalThis as any).__kalmeronMonitorEvents
    || ((globalThis as any).__kalmeronMonitorEvents = new EventEmitter());
  monitorEvents.setMaxListeners(0);

  export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

  export interface Alert {
    severity: AlertSeverity;
    source: string;
    message: string;
    metadata?: Record<string, any>;
    timestamp?: Date;
  }

  interface AgentMetrics {
    invocations: number;
    failures: number;
    totalLatencyMs: number;
    totalCostUsd: number;
    lastError?: string;
  }

  const metrics = new Map<string, AgentMetrics>();
  const alerts: Alert[] = [];

  const COST_DAILY_LIMIT_USD = Number(process.env.COST_DAILY_LIMIT_USD || 50);
  let dailyCostUsd = 0;
  let dailyResetAt = startOfTomorrow();

  function startOfTomorrow() {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }

  export function recordInvocation(agentId: string, latencyMs: number, costUsd: number, error?: string) {
    if (Date.now() > dailyResetAt) {
      dailyCostUsd = 0;
      dailyResetAt = startOfTomorrow();
    }
    dailyCostUsd += costUsd;

    const m = metrics.get(agentId) || { invocations: 0, failures: 0, totalLatencyMs: 0, totalCostUsd: 0 };
    m.invocations++;
    m.totalLatencyMs += latencyMs;
    m.totalCostUsd += costUsd;
    if (error) { m.failures++; m.lastError = error; }
    metrics.set(agentId, m);

    monitorEvents.emit('invocation', {
      agentId,
      latencyMs,
      costUsd,
      error: error || null,
      timestamp: new Date().toISOString(),
      snapshot: {
        invocations: m.invocations,
        failures: m.failures,
        avgLatencyMs: Math.round(m.totalLatencyMs / m.invocations),
        successRate: +((1 - m.failures / m.invocations) * 100).toFixed(2),
        totalCostUsd: +m.totalCostUsd.toFixed(4),
      },
      dailyCostUsd,
    });

    // Cost alert at 80% of daily budget
    if (dailyCostUsd > COST_DAILY_LIMIT_USD * 0.8) {
      dispatchAlert({
        severity: dailyCostUsd > COST_DAILY_LIMIT_USD ? 'critical' : 'high',
        source: 'cost-tracker',
        message: `تجاوز التكلفة اليومية ${((dailyCostUsd / COST_DAILY_LIMIT_USD) * 100).toFixed(0)}%`,
        metadata: { dailyCostUsd, limit: COST_DAILY_LIMIT_USD },
      });
    }
  }

  export async function dispatchAlert(alert: Alert) {
    const enriched = { ...alert, timestamp: alert.timestamp || new Date() };
    alerts.push(enriched);
    if (alerts.length > 1000) alerts.shift();
    logger?.warn?.({ msg: 'AGENT_ALERT', ...enriched }) ?? console.warn('[ALERT]', enriched);
    monitorEvents.emit('alert', enriched);
  }

  export function getMetricsSnapshot() {
    const out: Record<string, any> = {};
    for (const [id, m] of metrics.entries()) {
      out[id] = {
        invocations: m.invocations,
        failures: m.failures,
        avgLatencyMs: m.invocations ? Math.round(m.totalLatencyMs / m.invocations) : 0,
        successRate: m.invocations ? +((1 - m.failures / m.invocations) * 100).toFixed(2) : 100,
        totalCostUsd: +m.totalCostUsd.toFixed(4),
        lastError: m.lastError,
      };
    }
    return { agents: out, dailyCostUsd, dailyLimit: COST_DAILY_LIMIT_USD, alertsRecent: alerts.slice(-50) };
  }

  export function getAlerts(limit = 50) { return alerts.slice(-limit); }
  