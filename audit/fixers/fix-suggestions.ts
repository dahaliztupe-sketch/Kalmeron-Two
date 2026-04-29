import type { AuditFinding } from '../types';

export interface FixSuggestion {
  id: string;
  title: string;
  severity: string;
  category: string;
  steps: string[];
  references?: string[];
}

/**
 * يولّد قائمة بالإصلاحات اليدوية المقترحة، مرتبة حسب الخطورة.
 * مفيد للـ developers ولـ CI artifact يقرأه فريق التطوير.
 */
export function generateFixSuggestions(findings: AuditFinding[]): FixSuggestion[] {
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

  return findings
    .filter(f => !f.autoFixable && f.fix)
    .sort((a, b) => (order[a.severity] ?? 5) - (order[b.severity] ?? 5))
    .map(f => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      category: f.category,
      steps: (f.fix ?? '').split('\n').map(s => s.trim()).filter(Boolean),
      references: f.references,
    }));
}
