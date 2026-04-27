import type { Page } from '@playwright/test';
import type { CheckResult, Device } from '../types';

/**
 * يفحص كل الروابط <a href> في الصفحة.
 * - يكتشف الروابط الفارغة (href="" أو href="#" بدون onclick)
 * - يفحص الروابط الداخلية باستخدام HEAD/GET ويبلِّغ عن 404/500
 * - يتجاهل الروابط الخارجية (مختلفة في الـ host) تجنباً للبطء و rate-limit
 */
export async function checkLinks(
  page: Page,
  url: string,
  device: Device,
  baseUrl: string
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.map((a) => ({
      href: a.getAttribute('href') || '',
      text: (a.textContent || '').trim().slice(0, 40),
      hasOnClick: !!a.getAttribute('onclick') || !!a.hasAttribute('data-onclick'),
    }));
  });

  // 1. روابط فارغة أو محطّمة بصرياً
  for (const link of links) {
    if (!link.href || link.href === '#' || link.href === 'javascript:void(0)') {
      if (!link.hasOnClick) {
        results.push({
          id: `link_empty_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: 'رابط فارغ بدون href',
          page: url,
          device: device.label,
          status: 'warning',
          severity: 'low',
          message: `رابط نصّه "${link.text || '(بدون نص)'}" لا يؤدي لأي مكان`,
          autoFixable: true,
          duration: Date.now() - start,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // 2. فحص الروابط الداخلية فقط (لتجنّب rate-limit الخارجي)
  const baseHost = (() => {
    try {
      return new URL(baseUrl).host;
    } catch {
      return '';
    }
  })();

  const internalUrls = new Set<string>();
  for (const link of links) {
    if (!link.href) continue;
    if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) continue;
    if (link.href === '#' || link.href.startsWith('#')) continue;

    let absolute: string;
    try {
      absolute = new URL(link.href, baseUrl).toString();
    } catch {
      continue;
    }

    try {
      const u = new URL(absolute);
      if (u.host === baseHost) internalUrls.add(absolute);
    } catch {
      // ignore
    }
  }

  // أقصى 30 رابط لكل صفحة لتجنب طول الفحص
  const toCheck = Array.from(internalUrls).slice(0, 30);

  for (const target of toCheck) {
    try {
      let res = await fetch(target, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
      });
      // بعض الـ frameworks لا تدعم HEAD — جرّب GET
      if (res.status === 405 || res.status === 501) {
        res = await fetch(target, {
          method: 'GET',
          redirect: 'manual',
          signal: AbortSignal.timeout(5000),
        });
      }

      if (res.status === 404) {
        results.push({
          id: `link_404_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: 'رابط داخلي مكسور (404)',
          page: url,
          device: device.label,
          status: 'fail',
          severity: 'high',
          message: `الرابط "${target}" يُعطي 404`,
          autoFixable: true,
          duration: Date.now() - start,
          timestamp: new Date().toISOString(),
        });
      } else if (res.status >= 500) {
        results.push({
          id: `link_5xx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: 'رابط داخلي يُعطي خطأ خادم',
          page: url,
          device: device.label,
          status: 'fail',
          severity: 'critical',
          message: `الرابط "${target}" يُعطي ${res.status}`,
          autoFixable: false,
          duration: Date.now() - start,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({
        id: `link_err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: 'فشل الاتصال برابط داخلي',
        page: url,
        device: device.label,
        status: 'warning',
        severity: 'medium',
        message: `لم يتم الوصول لـ "${target}": ${msg}`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
}
