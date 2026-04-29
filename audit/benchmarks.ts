import type { AuditFinding, BenchmarkSummary } from './types';

/**
 * يلخّص نتائج Benchmarks Module حسب كل منصة (competitor)
 * النتيجة: لكل منصة، كم ميزة عندنا منها وكم مفقودة + نسبة التطابق.
 *
 * هذه الإحصائيات تُعرض في قسم "المقارنة بالمنصات النموذجية" في التقرير.
 */
export function summarizeBenchmarks(findings: AuditFinding[]): BenchmarkSummary[] {
  const benchFindings = findings.filter(f => f.category === 'benchmarks' && f.benchmark);

  const byCompetitor = new Map<string, {
    url?: string;
    missing: number;
    notes: string[];
  }>();

  for (const f of benchFindings) {
    const b = f.benchmark!;
    const cur = byCompetitor.get(b.competitor) ?? { url: b.competitorUrl, missing: 0, notes: [] };
    cur.missing += 1;
    cur.notes.push(b.theyHave);
    byCompetitor.set(b.competitor, cur);
  }

  // ملاحظة: العدد الكلي للـ checks لكل منصة يُحسب من ذاكرة ثابتة
  // (نُحدّثها عند إضافة benchmark check جديد)
  const TOTAL_PER_COMPETITOR: Record<string, number> = {
    'Vercel':            5,
    'Linear':            5,
    'Stripe':            5,
    'Notion':            2,
    'Anthropic':         4,
    'OpenAI ChatGPT':    2,
    'OpenAI':            1,
    'Cursor':            1,
    'Resend':            1,
  };

  const summaries: BenchmarkSummary[] = [];

  // أضف كل المنافسين الذين لديهم checks (سواء لدينا أو ينقصنا)
  const allCompetitors = new Set([
    ...Object.keys(TOTAL_PER_COMPETITOR),
    ...byCompetitor.keys(),
  ]);

  for (const competitor of allCompetitors) {
    const total = TOTAL_PER_COMPETITOR[competitor] ?? 1;
    const data = byCompetitor.get(competitor);
    const missing = data?.missing ?? 0;
    const have = Math.max(0, total - missing);
    const parity = total > 0 ? Math.round((have / total) * 100) : 100;

    summaries.push({
      competitor,
      competitorUrl: data?.url,
      totalChecks: total,
      weHave: have,
      weMiss: missing,
      parityPct: parity,
      notes: data && data.notes.length > 0
        ? `ينقصنا: ${data.notes.slice(0, 3).join(' · ')}${data.notes.length > 3 ? ` (+${data.notes.length - 3})` : ''}`
        : 'تطابق كامل ✓',
    });
  }

  // رتّب: الأقل تطابقاً أولاً (الأكثر إلحاحاً)
  return summaries.sort((a, b) => a.parityPct - b.parityPct);
}
