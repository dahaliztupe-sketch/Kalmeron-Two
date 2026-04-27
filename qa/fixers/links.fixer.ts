import type { CheckResult, FixStatus } from '../types';

export interface FixOutcome {
  resultId: string;
  status: FixStatus;
  recommendation: string;
}

export function fixLinkIssues(results: CheckResult[]): FixOutcome[] {
  const out: FixOutcome[] = [];

  for (const r of results) {
    if (r.id.startsWith('link_empty')) {
      out.push({
        resultId: r.id,
        status: 'manual_required',
        recommendation:
          'حدّد href أو حوّل العنصر إلى <button> إذا كان يستخدم onClick فقط لأغراض تفاعلية.',
      });
    } else if (r.id.startsWith('link_404')) {
      out.push({
        resultId: r.id,
        status: 'manual_required',
        recommendation:
          'الرابط مكسور — حدِّث الـ URL أو احذف الرابط من المصدر.',
      });
    } else if (r.id.startsWith('link_5xx')) {
      out.push({
        resultId: r.id,
        status: 'manual_required',
        recommendation:
          'الصفحة المستهدفة تُعطي خطأ خادم — راجع server logs.',
      });
    } else {
      out.push({
        resultId: r.id,
        status: 'manual_required',
        recommendation: r.message,
      });
    }
  }

  return out;
}
