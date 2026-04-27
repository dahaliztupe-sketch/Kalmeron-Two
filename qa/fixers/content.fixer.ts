import type { CheckResult, FixStatus } from '../types';

export interface FixOutcome {
  resultId: string;
  status: FixStatus;
  recommendation: string;
}

/**
 * مُصلِّح المحتوى — توصيات نصية. لا يعدّل ملفات تلقائياً (يتطلب موافقة بشرية)
 * لتفادي تغيير نصوص واجهة المستخدم بشكل غير مقصود.
 */
export function fixContentIssues(results: CheckResult[]): FixOutcome[] {
  const out: FixOutcome[] = [];

  for (const r of results) {
    if (r.id.startsWith('content_placeholder')) {
      out.push({
        resultId: r.id,
        status: 'manual_required',
        recommendation:
          'استبدل النص الـ placeholder بمحتوى حقيقي قبل الإطلاق. ابحث في المصدر باستخدام ripgrep.',
      });
    } else if (r.id.startsWith('content_undefined')) {
      out.push({
        resultId: r.id,
        status: 'manual_required',
        recommendation:
          'كشف خطأ برمجي: قيمة undefined أو [object Object] تُعرض للمستخدم — راجع التحويلات والـ JSX bindings.',
      });
    } else if (r.id.startsWith('content_empty')) {
      out.push({
        resultId: r.id,
        status: 'manual_required',
        recommendation:
          'الصفحة فارغة — تحقق من loading state أو أخطاء SSR.',
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
