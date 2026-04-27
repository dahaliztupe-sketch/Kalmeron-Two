import type { Page } from '@playwright/test';
import type { CheckResult, Device } from '../types';

export async function checkRTL(
  page: Page,
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  // 1. dir="rtl" على html أو body
  const dirIssues = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const htmlDir = html.getAttribute('dir') || html.style.direction;
    const bodyDir = body.getAttribute('dir') || body.style.direction;
    const hasRTL = htmlDir === 'rtl' || bodyDir === 'rtl';

    const text = document.body.innerText;
    const hasArabic = /[\u0600-\u06FF]/.test(text);

    return { hasRTL, hasArabic, htmlDir, bodyDir };
  });

  if (dirIssues.hasArabic && !dirIssues.hasRTL) {
    results.push({
      id: `rtl_missing_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'اتجاه RTL مفقود',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `الصفحة تحتوي نصاً عربياً لكن dir="rtl" غير موجود`,
      details: `html dir="${dirIssues.htmlDir}", body dir="${dirIssues.bodyDir}"`,
      autoFixable: true,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. نص عربي داخل عنصر LTR
  const mixedDirectionIssues = await page.evaluate(() => {
    const issues: string[] = [];
    const elements = document.querySelectorAll('p, h1, h2, h3, span, div, button, a');
    elements.forEach((el) => {
      const text = el.textContent || '';
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      const style = getComputedStyle(el);
      if (hasArabic && style.direction === 'ltr' && text.trim().length > 10) {
        issues.push(text.trim().slice(0, 30));
      }
    });
    return issues.slice(0, 5);
  });

  for (const issue of mixedDirectionIssues) {
    results.push({
      id: `rtl_ltr_element_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'نص عربي داخل عنصر LTR',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'medium',
      message: `نص عربي داخل container بـ direction:ltr: "${issue}"`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
