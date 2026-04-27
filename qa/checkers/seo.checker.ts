import type { Page } from '@playwright/test';
import type { CheckResult, Device } from '../types';

/**
 * يفحص أساسيات الـ SEO على كل صفحة:
 * - وجود <title> غير فارغ وبطول مناسب (10-70)
 * - وجود meta description بطول مناسب (50-160)
 * - وجود <h1> واحد فقط
 * - وجود lang attribute على <html>
 * - وجود canonical link
 * - وجود Open Graph الأساسي (og:title, og:description)
 */
export async function checkSEO(
  page: Page,
  url: string,
  device: Device
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const start = Date.now();

  const seo = await page.evaluate(() => {
    const title = document.title || '';
    const description =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content') || '';
    const h1Count = document.querySelectorAll('h1').length;
    const lang = document.documentElement.getAttribute('lang') || '';
    const canonical =
      document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const ogTitle =
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content') || '';
    const ogDesc =
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content') || '';
    const viewport =
      document
        .querySelector('meta[name="viewport"]')
        ?.getAttribute('content') || '';

    return {
      title,
      description,
      h1Count,
      lang,
      canonical,
      ogTitle,
      ogDesc,
      viewport,
    };
  });

  // Title
  if (!seo.title || seo.title.trim().length === 0) {
    results.push({
      id: `seo_no_title_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'عنوان الصفحة (title) مفقود',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `الصفحة بدون <title>`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } else if (seo.title.length < 10 || seo.title.length > 70) {
    results.push({
      id: `seo_title_len_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'طول العنوان غير مثالي',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'low',
      message: `عنوان الصفحة بطول ${seo.title.length} حرف (الموصى به: 10-70)`,
      details: seo.title,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // Description
  if (!seo.description) {
    results.push({
      id: `seo_no_desc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'meta description مفقود',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'medium',
      message: `الصفحة بدون <meta name="description">`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } else if (seo.description.length < 50 || seo.description.length > 160) {
    results.push({
      id: `seo_desc_len_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'طول description غير مثالي',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'low',
      message: `description بطول ${seo.description.length} حرف (الموصى به: 50-160)`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // H1
  if (seo.h1Count === 0) {
    results.push({
      id: `seo_no_h1_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'لا يوجد <h1> في الصفحة',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'medium',
      message: `الصفحة بدون عنوان رئيسي <h1>`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } else if (seo.h1Count > 1) {
    results.push({
      id: `seo_multi_h1_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'أكثر من <h1> في الصفحة',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'low',
      message: `وُجد ${seo.h1Count} عنصر <h1> — الموصى به واحد فقط`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // lang
  if (!seo.lang) {
    results.push({
      id: `seo_no_lang_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'سمة lang مفقودة',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'medium',
      message: `<html> بدون lang attribute`,
      autoFixable: true,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // canonical
  if (!seo.canonical) {
    results.push({
      id: `seo_no_canonical_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'canonical URL مفقود',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'low',
      message: `الصفحة بدون <link rel="canonical">`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // Open Graph
  if (!seo.ogTitle || !seo.ogDesc) {
    results.push({
      id: `seo_no_og_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'Open Graph غير مكتمل',
      page: url,
      device: device.label,
      status: 'warning',
      severity: 'low',
      message: `og:title أو og:description مفقود — يؤثر على المشاركة في وسائل التواصل`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  // viewport (مهم للهاتف)
  if (!seo.viewport) {
    results.push({
      id: `seo_no_viewport_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: 'meta viewport مفقود',
      page: url,
      device: device.label,
      status: 'fail',
      severity: 'high',
      message: `الصفحة بدون viewport — لن تكون متجاوبة على الهاتف`,
      autoFixable: false,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
