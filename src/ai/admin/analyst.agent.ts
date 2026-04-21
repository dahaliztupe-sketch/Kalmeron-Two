/**
 * Analyst Agent — Admin Governance Layer
 * يحلل تقارير المراقب ويصنّف المخاطر.
 */
import type { ObservationReport } from './observer.agent';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFinding {
  id: string;
  level: RiskLevel;
  category: 'cost' | 'reliability' | 'performance';
  title: string;
  evidence: any;
}

export function analyze(report: ObservationReport): RiskFinding[] {
  const findings: RiskFinding[] = [];

  if (report.costPct >= 100) {
    findings.push({
      id: `risk-cost-${Date.now()}`,
      level: 'critical',
      category: 'cost',
      title: 'تجاوز سقف التكلفة اليومي',
      evidence: { costPct: report.costPct },
    });
  } else if (report.costPct >= 80) {
    findings.push({
      id: `risk-cost-${Date.now()}`,
      level: 'high',
      category: 'cost',
      title: 'اقتراب من سقف التكلفة اليومي',
      evidence: { costPct: report.costPct },
    });
  }

  if (report.totalInvocations >= 20) {
    const failureRate = (report.totalFailures / report.totalInvocations) * 100;
    if (failureRate > 10) {
      findings.push({
        id: `risk-rel-${Date.now()}`,
        level: failureRate > 25 ? 'critical' : 'high',
        category: 'reliability',
        title: `نسبة فشل عامة مرتفعة: ${failureRate.toFixed(1)}%`,
        evidence: { failureRate, totalFailures: report.totalFailures },
      });
    }
  }

  for (const a of report.lowSuccessAgents) {
    findings.push({
      id: `risk-rel-${a.id}`,
      level: a.successRate < 70 ? 'critical' : 'high',
      category: 'reliability',
      title: `وكيل غير موثوق: ${a.id} (${a.successRate}% نجاح)`,
      evidence: a,
    });
  }

  for (const a of report.highLatencyAgents) {
    findings.push({
      id: `risk-perf-${a.id}`,
      level: 'medium',
      category: 'performance',
      title: `بطء وكيل: ${a.id} (${a.avgLatencyMs}ms متوسط)`,
      evidence: a,
    });
  }

  return findings;
}
