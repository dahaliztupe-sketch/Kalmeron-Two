import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import type { AuditFinding } from '../types';
import { config } from '../config';

export async function auditPerformance(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const BASE_URL = config.baseUrl;

  // ── Bundle analyzer hint ──
  if (existsSync('.next/analyze')) {
    findings.push({
      id: 'PERF-001',
      category: 'performance',
      severity: 'info',
      title: 'Bundle analyzer نتائج موجودة',
      description: 'راجع .next/analyze لتحسين الـ bundle',
      fix: 'شغّل: ANALYZE=true npm run build لرؤية التقرير',
      autoFixable: false,
    });
  }

  // ── Lighthouse (إذا كان متاحاً) ──
  try {
    const lighthouseResult = execSync(
      `npx --no-install lighthouse ${BASE_URL} --only-categories=performance,accessibility,seo,best-practices --output=json --quiet --chrome-flags="--headless --no-sandbox" 2>/dev/null`,
      { encoding: 'utf8', timeout: config.lighthouseTimeout, stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const report = JSON.parse(lighthouseResult);
    const categories = report.categories;

    const checks = [
      { key: 'performance', name: 'الأداء', threshold: 0.7 },
      { key: 'accessibility', name: 'إمكانية الوصول', threshold: 0.8 },
      { key: 'seo', name: 'SEO', threshold: 0.8 },
      { key: 'best-practices', name: 'أفضل الممارسات', threshold: 0.8 },
    ];

    for (const check of checks) {
      const score = categories[check.key]?.score ?? 0;
      if (score < check.threshold) {
        findings.push({
          id: `PERF-LH-${check.key.toUpperCase()}`,
          category: 'performance',
          severity: score < 0.5 ? 'high' : 'medium',
          title: `Lighthouse ${check.name}: ${Math.round(score * 100)}/100`,
          description: `نقاط Lighthouse ${check.name} أقل من ${check.threshold * 100}`,
          evidence: `Score: ${Math.round(score * 100)}/100 (الهدف: ${check.threshold * 100})`,
          fix: 'راجع تقرير Lighthouse للتحسينات المحددة',
          autoFixable: false,
          references: ['https://developer.chrome.com/docs/lighthouse/'],
        });
      }
    }

    const audits = report.audits;
    if (audits['largest-contentful-paint']?.numericValue > 2500) {
      findings.push({
        id: 'PERF-LCP',
        category: 'performance',
        severity: 'high',
        title: `LCP بطيء: ${Math.round(audits['largest-contentful-paint'].numericValue)}ms`,
        description: 'Largest Contentful Paint يجب أن يكون < 2500ms',
        fix: 'حسّن: الصور الكبيرة، الخطوط، الـ render-blocking resources',
        autoFixable: false,
        references: ['https://web.dev/lcp/'],
      });
    }

    if (audits['cumulative-layout-shift']?.numericValue > 0.1) {
      findings.push({
        id: 'PERF-CLS',
        category: 'performance',
        severity: 'medium',
        title: `CLS مرتفع: ${audits['cumulative-layout-shift'].numericValue.toFixed(3)}`,
        description: 'Cumulative Layout Shift يجب أن يكون < 0.1',
        fix: 'أضف أبعاد صريحة للصور والـ dynamic content',
        autoFixable: false,
        references: ['https://web.dev/cls/'],
      });
    }
  } catch {
    findings.push({
      id: 'PERF-LH-UNAVAILABLE',
      category: 'performance',
      severity: 'info',
      title: 'Lighthouse غير متاح في هذه البيئة',
      description: 'تحقق من Lighthouse يدوياً أو في CI/CD',
      fix: 'شغّل: npx lighthouse https://kalmeron-two.vercel.app --view',
      autoFixable: false,
    });
  }

  // ── Image optimization formats ──
  if (existsSync('next.config.ts')) {
    const nextConfig = readFileSync('next.config.ts', 'utf8');
    if (
      !nextConfig.includes("'image/avif'") &&
      !nextConfig.includes('"image/avif"') &&
      !nextConfig.includes("'image/webp'") &&
      !nextConfig.includes('"image/webp"')
    ) {
      findings.push({
        id: 'PERF-IMG-FORMAT',
        category: 'performance',
        severity: 'medium',
        title: 'تحسين صيغ الصور (AVIF/WebP) غير مفعّل',
        description: 'AVIF يوفر 50% من حجم الصور مقارنة بـ JPEG',
        location: 'next.config.ts',
        fix: "أضف في next.config.ts: images: { formats: ['image/avif', 'image/webp'] }",
        autoFixable: true,
      });
    }
  }

  return findings;
}
