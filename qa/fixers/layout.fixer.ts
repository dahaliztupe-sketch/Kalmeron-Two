import type { CheckResult, FixStatus } from '../types';

/**
 * مُصلِّح مشاكل التخطيط — يقترح إصلاحات نصية أو يعدّل ملفات CSS عند الإمكان.
 * في النسخة الحالية: يُرجع توصيات إصلاح نصية فقط (manual_required) لكل مشكلة،
 * مع الإشارة إلى المشاكل القابلة للإصلاح التلقائي مستقبلاً.
 */
export interface FixOutcome {
  resultId: string;
  status: FixStatus;
  recommendation: string;
}

export function fixLayoutIssues(results: CheckResult[]): FixOutcome[] {
  const out: FixOutcome[] = [];

  for (const r of results) {
    if (!r.autoFixable) {
      out.push({
        resultId: r.id,
        status: 'manual_required',
        recommendation: `${r.message} — يحتاج مراجعة يدوية`,
      });
      continue;
    }

    if (r.id.startsWith('layout_overflow')) {
      out.push({
        resultId: r.id,
        status: 'partial',
        recommendation:
          'أضف overflow-x:hidden على body أو استخدم max-width:100% على الحاوية المسببة.',
      });
    } else if (r.id.startsWith('layout_hscroll')) {
      out.push({
        resultId: r.id,
        status: 'partial',
        recommendation:
          'افحص العناصر ذات width الثابت والأصول التي تتجاوز عرض الـ viewport. استخدم max-w-screen / overflow-x-clip.',
      });
    } else if (r.id.startsWith('layout_touch')) {
      out.push({
        resultId: r.id,
        status: 'partial',
        recommendation:
          'كبّر الزر إلى min-h-[44px] min-w-[44px] لمطابقة WCAG 2.5.5 على الهاتف.',
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
