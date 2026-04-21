/**
 * Observer Agent — Admin Governance Layer
 * يراقب أداء الوكلاء، التكاليف، والأمان في الخلفية بشكل استباقي.
 * يعتمد على بيانات monitor.ts الحقيقية (recordInvocation/dispatchAlert).
 */
import { getMetricsSnapshot, dispatchAlert } from '@/src/ai/organization/compliance/monitor';
import { logger } from '@/src/lib/logger';

export interface ObservationReport {
  timestamp: string;
  agentCount: number;
  totalInvocations: number;
  totalFailures: number;
  highLatencyAgents: Array<{ id: string; avgLatencyMs: number }>;
  lowSuccessAgents: Array<{ id: string; successRate: number }>;
  costPct: number;
}

const HIGH_LATENCY_MS = Number(process.env.HIGH_LATENCY_MS || 8000);
const LOW_SUCCESS_PCT = Number(process.env.LOW_SUCCESS_PCT || 90);

export async function observe(): Promise<ObservationReport> {
  const snap = getMetricsSnapshot();
  const entries = Object.entries(snap.agents) as Array<[string, any]>;

  const totalInvocations = entries.reduce((s, [, m]) => s + m.invocations, 0);
  const totalFailures = entries.reduce((s, [, m]) => s + m.failures, 0);

  const highLatencyAgents = entries
    .filter(([, m]) => m.avgLatencyMs > HIGH_LATENCY_MS)
    .map(([id, m]) => ({ id, avgLatencyMs: m.avgLatencyMs }));

  const lowSuccessAgents = entries
    .filter(([, m]) => m.invocations >= 5 && m.successRate < LOW_SUCCESS_PCT)
    .map(([id, m]) => ({ id, successRate: m.successRate }));

  const costPct = (snap.dailyCostUsd / Math.max(1, snap.dailyLimit)) * 100;

  // Auto-dispatch alerts for anomalies
  for (const a of highLatencyAgents) {
    await dispatchAlert({
      severity: 'medium',
      source: 'observer-agent',
      message: `زمن استجابة مرتفع لـ ${a.id}: ${a.avgLatencyMs}ms`,
      metadata: a,
    });
  }
  for (const a of lowSuccessAgents) {
    await dispatchAlert({
      severity: 'high',
      source: 'observer-agent',
      message: `نسبة نجاح منخفضة لـ ${a.id}: ${a.successRate}%`,
      metadata: a,
    });
  }

  const report: ObservationReport = {
    timestamp: new Date().toISOString(),
    agentCount: entries.length,
    totalInvocations,
    totalFailures,
    highLatencyAgents,
    lowSuccessAgents,
    costPct,
  };

  logger?.info?.({ msg: 'OBSERVER_REPORT', ...report });
  return report;
}
