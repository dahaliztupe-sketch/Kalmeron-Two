import type { Page } from '@playwright/test';
import type { CheckResult, Device } from '../types';
import { PERFORMANCE_THRESHOLDS as THRESHOLDS } from '../config';

export async function checkPerformance(
  page: Page,
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming | undefined;
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime ?? 0;

    return {
      ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
      totalLoad: nav ? Math.round(nav.loadEventEnd) : 0,
      fcp: Math.round(fcp),
      resourceCount: performance.getEntriesByType('resource').length,
      totalTransferSize: performance
        .getEntriesByType('resource')
        .reduce((sum, r) => sum + ((r as PerformanceResourceTiming).transferSize || 0), 0),
    };
  });

  if (metrics.ttfb > THRESHOLDS.ttfb.acceptable) {
    results.push({
      id: `perf_ttfb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'TTFB بطيء',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `Time to First Byte: ${metrics.ttfb}ms (الحد المقبول: ${THRESHOLDS.ttfb.acceptable}ms)`,
      details: 'قد يكون بسبب بطء Vercel Edge Function أو Firebase queries',
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  if (metrics.fcp > THRESHOLDS.fcp.acceptable) {
    results.push({
      id: `perf_fcp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'FCP بطيء — تحميل أولي ثقيل',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `First Contentful Paint: ${metrics.fcp}ms`,
      details: `الهدف: < ${THRESHOLDS.fcp.good}ms. تحقق من: حجم الـ bundle، الصور غير المُحسَّنة، JavaScript blocking`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  if (metrics.totalLoad > THRESHOLDS.totalLoad.good) {
    results.push({
      id: `perf_load_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'تحميل الصفحة بطيء',
      page: url,
      device: device.label,
      status: metrics.totalLoad > THRESHOLDS.totalLoad.acceptable ? 'fail' : 'warning',
      severity: metrics.totalLoad > THRESHOLDS.totalLoad.acceptable ? 'high' : 'medium',
      message: `وقت التحميل الكامل: ${metrics.totalLoad}ms`,
      details: `الهدف: < ${THRESHOLDS.totalLoad.good}ms. الموارد المحمَّلة: ${metrics.resourceCount}`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  const transferMB = (metrics.totalTransferSize / 1024 / 1024).toFixed(2);
  if (metrics.totalTransferSize > 3 * 1024 * 1024) {
    results.push({
      id: `perf_size_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'حجم الصفحة كبير جداً',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'medium',
      message: `إجمالي حجم التحميل: ${transferMB}MB (الموصى به: < 1MB)`,
      details: 'تحقق من الصور وحجم الـ JavaScript bundle',
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  const slowResources = await page.evaluate(() => {
    return performance
      .getEntriesByType('resource')
      .filter((r) => r.duration > 3000)
      .map((r) => ({
        url: r.name.replace(location.origin, ''),
        duration: Math.round(r.duration),
      }))
      .slice(0, 5);
  });

  for (const resource of slowResources) {
    results.push({
      id: `perf_slow_resource_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'مورد بطيء جداً',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'medium',
      message: `"${resource.url}" استغرق ${resource.duration}ms`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
