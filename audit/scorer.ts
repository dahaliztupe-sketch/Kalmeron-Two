import type { AuditFinding } from './types';

export function calculateScore(findings: AuditFinding[]): number {
  const weights = { critical: 25, high: 12, medium: 5, low: 2, info: 0 } as const;
  const maxPenalty = 100;

  const penalty = findings
    .filter(f => ['critical', 'high', 'medium', 'low'].includes(f.severity))
    .reduce((sum, f) => sum + (weights[f.severity as keyof typeof weights] ?? 0), 0);

  return Math.max(0, Math.round(100 - Math.min(penalty, maxPenalty)));
}

export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
