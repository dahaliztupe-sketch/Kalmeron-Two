import type { Page } from '@playwright/test';
import type { CheckResult, Device } from '../types';
import { PROTECTED_PAGES, PUBLIC_PAGES } from '../config';

export async function checkAuth(
  page: Page,
  baseUrl: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  // 1. الصفحات المحمية يجب أن تُعيد redirect لـ login
  for (const path of PROTECTED_PAGES) {
    await page
      .goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .catch(() => null);

    const finalUrl = page.url();
    const isRedirectedToLogin =
      finalUrl.includes('/auth/login') ||
      finalUrl.includes('/signin') ||
      finalUrl.includes('/login');

    if (!isRedirectedToLogin) {
      results.push({
        id: `auth_unprotected_${path.replace(/\//g, '_')}`,
        name: 'صفحة محمية غير مؤمَّنة',
        page: path,
        device: device.label,
        status: 'fail',
        severity: 'critical',
        message: `الصفحة "${path}" لا تُعيد redirect للمستخدم غير المسجّل`,
        details: `URL النهائي: ${finalUrl}`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 2. الصفحات العامة يجب أن تعمل (لا 404 ولا 500)
  for (const path of PUBLIC_PAGES) {
    const response = await page
      .goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .catch(() => null);

    const status = response?.status() ?? 0;

    if (status === 404) {
      results.push({
        id: `auth_404_${path.replace(/\//g, '_')}`,
        name: 'صفحة عامة تُعطي 404',
        page: path,
        device: device.label,
        status: 'fail',
        severity: 'critical',
        message: `الصفحة العامة "${path}" تُعطي خطأ 404`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    } else if (status >= 500) {
      results.push({
        id: `auth_500_${path.replace(/\//g, '_')}`,
        name: 'خطأ server في صفحة عامة',
        page: path,
        device: device.label,
        status: 'fail',
        severity: 'critical',
        message: `الصفحة "${path}" تُعطي خطأ server: ${status}`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. زر Google موجود في صفحة الدخول
  await page
    .goto(`${baseUrl}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 15000 })
    .catch(() => null);

  const hasGoogleButton = await page
    .locator('button:has-text("Google"), [data-provider="google"]')
    .count()
    .catch(() => 0);

  if (hasGoogleButton === 0) {
    results.push({
      id: `auth_no_google`,
      name: 'زر Google غير موجود في صفحة الدخول',
      page: '/auth/login',
      device: device.label,
      status: 'fail',
      severity: 'critical',
      message: `لم يُعثر على زر "تسجيل الدخول بـ Google" في /auth/login`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
