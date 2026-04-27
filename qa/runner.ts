import { chromium, type Page } from '@playwright/test';
import { getEnabledDevices } from './config';
import { BASE_URL, AUTH_TOKEN, PUBLIC_PAGES_TO_CHECK } from './config';
import { DEVICES } from './devices';
import { checkLayout } from './checkers/layout.checker';
import { checkContent } from './checkers/content.checker';
import { checkPerformance } from './checkers/performance.checker';
import { checkAuth } from './checkers/auth.checker';
import { checkRTL } from './checkers/rtl.checker';
import { checkAgents } from './checkers/agents.checker';
import { checkLinks } from './checkers/links.checker';
import { checkSEO } from './checkers/seo.checker';
import type { QAReport, CheckResult, PageReport } from './types';

function generateSummary(
  score: number,
  criticalCount: number,
  failed: number
): string {
  if (criticalCount > 0)
    return `المنصة تحتاج إصلاحات عاجلة — ${criticalCount} مشكلة حرجة`;
  if (score >= 90) return `المنصة في حالة ممتازة — جاهزة للإطلاق`;
  if (score >= 75) return `المنصة في حالة جيدة — ${failed} مشكلة تحتاج مراجعة`;
  return `المنصة تحتاج تحسينات — نقاط: ${score}/100`;
}

export async function runQA(): Promise<QAReport> {
  const runId = `qa_${Date.now()}`;
  const allResults: CheckResult[] = [];
  const pageReports: PageReport[] = [];
  const enabledDevices = getEnabledDevices();

  console.log(`\n🔍 بدء فحص QA — ${new Date().toLocaleString('ar-EG')}`);
  console.log(`📍 BASE_URL: ${BASE_URL}`);
  console.log(`📱 الأجهزة المُفعّلة: ${Object.keys(enabledDevices).join(', ')}\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. فحص المصادقة (مرة واحدة)
    console.log('📋 فحص المصادقة والتوجيه...');
    const authContext = await browser.newContext({
      viewport: { width: DEVICES.desktop_std.width, height: DEVICES.desktop_std.height },
    });
    const authPage = await authContext.newPage();
    try {
      const authResults = await checkAuth(authPage, BASE_URL, DEVICES.desktop_std);
      allResults.push(...authResults);
    } catch (err) {
      console.warn('  ⚠️ فحص المصادقة فشل:', err instanceof Error ? err.message : err);
    } finally {
      await authContext.close();
    }

    // 2. فحص الوكلاء
    console.log('🤖 فحص الـ 16 وكيل...');
    if (AUTH_TOKEN) {
      try {
        const agentResults = await checkAgents(BASE_URL, AUTH_TOKEN);
        allResults.push(...agentResults);
      } catch (err) {
        console.warn('  ⚠️ فحص الوكلاء فشل:', err instanceof Error ? err.message : err);
      }
    } else {
      console.warn('  ⚠️ QA_AUTH_TOKEN غير محدد — تخطّي فحص الوكلاء');
    }

    // 3. فحص كل صفحة على كل جهاز
    for (const [deviceKey, device] of Object.entries(enabledDevices)) {
      console.log(
        `\n📱 فحص على ${device.label} (${device.width}×${device.height}) [${deviceKey}]...`
      );

      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        userAgent: device.ua,
        locale: 'ar-EG',
        timezoneId: 'Africa/Cairo',
      });

      for (const pagePath of PUBLIC_PAGES_TO_CHECK) {
        const pageUrl = `${BASE_URL}${pagePath}`;
        console.log(`  → ${pagePath}`);

        const p: Page = await context.newPage();
        const pageResults: CheckResult[] = [];
        let loadTimeMs = 0;

        try {
          const startLoad = Date.now();
          // domcontentloaded أكثر موثوقية في وضع Next.js التطويري حيث يبقى HMR نشطاً
          await p.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          // انتظار قصير للسماح بإكمال التهيئة الديناميكية
          await p.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
          loadTimeMs = Date.now() - startLoad;

          const [layoutRes, contentRes, perfRes, rtlRes, seoRes] = await Promise.all([
            checkLayout(p, pagePath, device),
            checkContent(p, pagePath, device),
            checkPerformance(p, pagePath, device),
            checkRTL(p, pagePath, device),
            checkSEO(p, pagePath, device),
          ]);

          pageResults.push(...layoutRes, ...contentRes, ...perfRes, ...rtlRes, ...seoRes);

          // فحص الروابط مرة واحدة فقط لكل صفحة على جهاز ديسكتوب لتجنّب التكرار
          if (deviceKey === 'desktop_std') {
            try {
              const linkRes = await checkLinks(p, pagePath, device, BASE_URL);
              pageResults.push(...linkRes);
            } catch (err) {
              console.warn(
                '    ⚠️ فحص الروابط فشل:',
                err instanceof Error ? err.message : err
              );
            }
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          pageResults.push({
            id: `nav_error_${pagePath.replace(/\//g, '_')}_${deviceKey}`,
            name: 'خطأ في تحميل الصفحة',
            page: pagePath,
            device: device.label,
            status: 'fail',
            severity: 'critical',
            message: `فشل تحميل "${pagePath}": ${message}`,
            autoFixable: false,
            duration: 0,
            timestamp: new Date().toISOString(),
          });
        } finally {
          await p.close();
        }

        allResults.push(...pageResults);

        const failed = pageResults.filter((r) => r.status === 'fail').length;
        const warnings = pageResults.filter((r) => r.status === 'warning').length;
        const passed = pageResults.filter((r) => r.status === 'pass').length;

        pageReports.push({
          url: pagePath,
          device: device.label,
          loadTimeMs,
          checks: pageResults,
          passed,
          failed,
          warnings,
          criticalCount: pageResults.filter((r) => r.severity === 'critical').length,
        });
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // حساب النتائج النهائية
  const critical = allResults.filter(
    (r) => r.severity === 'critical' && r.status === 'fail'
  );
  const failed = allResults.filter((r) => r.status === 'fail').length;
  const warnings = allResults.filter((r) => r.status === 'warning').length;
  const passed = allResults.filter((r) => r.status === 'pass').length;
  const total = allResults.length;

  const deductions = allResults
    .filter((r) => r.status === 'fail')
    .reduce((sum, r) => {
      const weights = { critical: 20, high: 10, medium: 5, low: 2, info: 0 };
      return sum + (weights[r.severity] ?? 0);
    }, 0);
  const score = Math.max(
    0,
    Math.round(100 - (deductions / Math.max(total, 1)) * 100)
  );

  const report: QAReport = {
    runId,
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: PUBLIC_PAGES_TO_CHECK.length,
    totalChecks: total,
    passed,
    failed,
    warnings,
    criticalIssues: critical,
    autoFixed: 0,
    manualRequired: allResults.filter((r) => r.status === 'fail' && !r.autoFixable),
    pageReports,
    summary: generateSummary(score, critical.length, failed),
    score,
  };

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`📊 نتائج QA — النقاط: ${score}/100`);
  console.log(`✅ نجح: ${passed} | ❌ فشل: ${failed} | ⚠️ تحذيرات: ${warnings}`);
  console.log(`🔴 حرجة: ${critical.length}`);
  if (critical.length > 0) {
    console.log('\nالمشاكل الحرجة:');
    critical.slice(0, 5).forEach((r) => console.log(`  • ${r.message}`));
  }
  console.log(`${'═'.repeat(50)}\n`);

  return report;
}
