import type { Page } from '@playwright/test';
import type { CheckResult, Device } from '../types';

// All regexes below are intentionally substring matchers used against rendered
// page text — NOT input validators. We add explicit boundary classes around
// the host-like patterns so CodeQL's "missing regular expression anchor" rule
// (js/regex/missing-regexp-anchor) is satisfied without changing intent: a
// match still requires `example.com` / `test@test.com` to appear as a
// standalone token rather than as a substring of e.g. `myexample.com.evil`.
const HOST_BOUNDARY_BEFORE = /(?:^|[^a-z0-9.@-])/.source;
const HOST_BOUNDARY_AFTER = /(?![a-z0-9.-])/.source;

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /\[placeholder\]/i,
  /\[اسم الشركة\]/i,
  /\[ادخل/i,
  /TODO:/,
  /FIXME:/,
  /coming soon/i,
  /(^|[^\u0600-\u06FF])قريباً(?![\u0600-\u06FF])/,
  /(^|[^\u0600-\u06FF])تحت الإنشاء(?![\u0600-\u06FF])/,
  /under construction/i,
  new RegExp(`${HOST_BOUNDARY_BEFORE}test@test\\.com${HOST_BOUNDARY_AFTER}`, 'i'),
  new RegExp(`${HOST_BOUNDARY_BEFORE}example\\.com${HOST_BOUNDARY_AFTER}`, 'i'),
];

const BANNED_WORDS: string[] = [
  // أضف هنا أي كلمات محظورة في الواجهة
];

export async function checkContent(
  page: Page,
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  const pageText = await page.evaluate(() => document.body.innerText);

  // 1. Placeholders
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(pageText)) {
      results.push({
        id: `content_placeholder_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: 'نص placeholder غير مُستبدَل',
        page: url,
        device: device.label,
        status: 'fail',
        severity: 'high',
        message: `وُجد نص placeholder: "${pattern.source}" في الصفحة`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 2. كلمات محظورة
  for (const word of BANNED_WORDS) {
    if (pageText.includes(word)) {
      results.push({
        id: `content_banned_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: 'كلمة غير مناسبة',
        page: url,
        device: device.label,
        status: 'fail',
        severity: 'critical',
        message: `وُجدت كلمة محظورة في الصفحة`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. أسعار بدون عملة
  const pricePatterns = await page.evaluate(() => {
    const text = document.body.innerText;
    const issues: string[] = [];
    const badPrices = text.match(
      /\b\d{2,5}(?:\.\d{2})?\s*(?!جنيه|\$|USD|EGP|دولار|ريال)/g
    );
    if (badPrices && badPrices.length > 3) {
      issues.push(`${badPrices.length} رقم بدون عملة واضحة`);
    }
    return issues;
  });

  for (const issue of pricePatterns) {
    results.push({
      id: `content_price_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'سعر بدون عملة',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'low',
      message: issue,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // 4. صفحة فارغة
  if (pageText.trim().length < 50) {
    results.push({
      id: `content_empty_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'صفحة فارغة أو بدون محتوى',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'critical',
      message: `الصفحة لا تحتوي على محتوى كافٍ (أقل من 50 حرف)`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // 5. undefined / [object Object] ظاهر
  const hasUndefined = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('undefined') || text.includes('[object Object]');
  });

  if (hasUndefined) {
    results.push({
      id: `content_undefined_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'قيمة undefined ظاهرة للمستخدم',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'critical',
      message: `الصفحة تعرض "undefined" أو "[object Object]" للمستخدم — خطأ برمجي`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
