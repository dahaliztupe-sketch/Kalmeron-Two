import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import type { AuditFinding } from '../types';
import { config } from '../config';

function safeFetch(url: string): { status: string; body: string } {
  try {
    const status = execSync(
      `curl -s -o /dev/null -w "%{http_code}" "${url}" --max-time 8`,
      { encoding: 'utf8', timeout: 12_000, stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    let body = '';
    if (status === '200') {
      body = execSync(`curl -s "${url}" --max-time 8`, {
        encoding: 'utf8', timeout: 12_000, stdio: ['pipe', 'pipe', 'pipe'],
      });
    }
    return { status, body };
  } catch {
    return { status: '000', body: '' };
  }
}

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30_000 });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditPwaMobile(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── Manifest ──
  const manifestPaths = ['public/manifest.json', 'public/manifest.webmanifest', 'app/manifest.ts'];
  const manifestPath = manifestPaths.find(existsSync);
  if (!manifestPath) {
    findings.push({
      id: 'PWA-001',
      category: 'pwa-mobile',
      severity: 'high',
      title: 'manifest.json مفقود',
      description: 'بدون manifest: التطبيق لا يمكن تثبيته كـ PWA',
      fix: 'أنشئ public/manifest.json أو app/manifest.ts بـ name, icons, theme_color, display',
      autoFixable: false,
      references: ['https://web.dev/articles/add-manifest'],
    });
  } else if (manifestPath.endsWith('.json')) {
    try {
      const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
      const required = ['name', 'short_name', 'icons', 'start_url', 'display', 'theme_color', 'background_color'];
      const missing = required.filter(k => !m[k]);
      if (missing.length > 0) {
        findings.push({
          id: 'PWA-002',
          category: 'pwa-mobile',
          severity: 'medium',
          title: `manifest.json ينقصه: ${missing.join(', ')}`,
          description: 'حقول ضرورية في manifest غير موجودة',
          location: manifestPath,
          fix: `أضف ${missing.join(', ')} في manifest.json`,
          autoFixable: false,
        });
      }
      if (m.icons && Array.isArray(m.icons)) {
        const has192 = m.icons.some((i: any) => i.sizes?.includes('192'));
        const has512 = m.icons.some((i: any) => i.sizes?.includes('512'));
        if (!has192 || !has512) {
          findings.push({
            id: 'PWA-003',
            category: 'pwa-mobile',
            severity: 'medium',
            title: 'أيقونات PWA الأساسية ناقصة',
            description: 'تحتاج أيقونتي 192×192 و 512×512 على الأقل',
            location: manifestPath,
            fix: 'أضف public/icon-192.png + public/icon-512.png + maskable variants',
            autoFixable: false,
          });
        }
        const hasMaskable = m.icons.some((i: any) =>
          (i.purpose ?? '').includes('maskable')
        );
        if (!hasMaskable) {
          findings.push({
            id: 'PWA-004',
            category: 'pwa-mobile',
            severity: 'low',
            title: 'لا يوجد maskable icon لـ Android adaptive',
            description: 'بدون maskable: أيقونة التطبيق تظهر داخل دائرة بيضاء على Android',
            fix: 'أضف icon بـ purpose: "maskable any"',
            autoFixable: false,
            references: ['https://web.dev/maskable-icon/'],
          });
        }
      }
    } catch {
      findings.push({
        id: 'PWA-005',
        category: 'pwa-mobile',
        severity: 'high',
        title: 'manifest.json غير صالح JSON',
        description: 'فشل تحليل manifest.json',
        location: manifestPath,
        fix: 'تحقق من تنسيق JSON',
        autoFixable: false,
      });
    }
  }

  // ── Service Worker ──
  const hasSW = existsSync('public/sw.js') || existsSync('public/service-worker.js') ||
    existsSync('app/sw.ts') || safeExec('rg -l "next-pwa|workbox" package.json 2>/dev/null').length > 0;
  if (!hasSW) {
    findings.push({
      id: 'PWA-006',
      category: 'pwa-mobile',
      severity: 'medium',
      title: 'لا يوجد Service Worker',
      description: 'بدون SW: لا offline support ولا push notifications ولا app install',
      fix: 'استخدم next-pwa أو @ducanh2912/next-pwa أو @serwist/next',
      autoFixable: false,
      references: ['https://serwist.pages.dev/'],
    });
  }

  // ── Apple meta tags ──
  if (config.baseUrl) {
    const home = safeFetch(`${config.baseUrl}/`);
    if (home.status === '200') {
      if (!/apple-touch-icon|apple-mobile-web-app/.test(home.body)) {
        findings.push({
          id: 'PWA-007',
          category: 'pwa-mobile',
          severity: 'low',
          title: 'Apple meta tags / touch icon مفقودة',
          description: 'iOS لن يعرف كيفية إضافة التطبيق للـ home screen',
          fix: 'أضف apple-touch-icon.png + apple-mobile-web-app-capable في metadata',
          autoFixable: false,
        });
      }
      if (!/<meta name="viewport"/i.test(home.body)) {
        findings.push({
          id: 'PWA-008',
          category: 'pwa-mobile',
          severity: 'critical',
          title: 'meta viewport مفقود — التطبيق سيبدو مكسوراً على الموبايل',
          description: 'بدون viewport: التطبيق يُعرض بحجم desktop على الموبايل',
          fix: 'أضف <meta name="viewport" content="width=device-width, initial-scale=1"> في layout',
          autoFixable: true,
        });
      }
      if (!/theme-color|theme_color/.test(home.body)) {
        findings.push({
          id: 'PWA-009',
          category: 'pwa-mobile',
          severity: 'low',
          title: 'theme-color meta مفقود',
          description: 'لون شريط المتصفح على الموبايل لن يطابق هوية المنصة',
          fix: 'أضف themeColor في metadata.viewport',
          autoFixable: true,
        });
      }
    }
  }

  // ── Responsive breakpoints / mobile-first ──
  const respUsage = Number(safeExec(
    `rg -n "sm:|md:|lg:|xl:|2xl:" app components -g "*.tsx" 2>/dev/null | wc -l`
  ).trim() || '0');
  const fixedSizes = Number(safeExec(
    `rg -n "w-\\[[0-9]+px\\]|h-\\[[0-9]+px\\]" app components -g "*.tsx" 2>/dev/null | wc -l`
  ).trim() || '0');
  if (respUsage < 50) {
    findings.push({
      id: 'PWA-010',
      category: 'pwa-mobile',
      severity: 'medium',
      title: `استخدام ضعيف لـ responsive breakpoints (${respUsage})`,
      description: 'التطبيق قد لا يتكيف بشكل جيد مع الموبايل والتابلت',
      fix: 'استخدم Tailwind responsive prefixes (sm:/md:/lg:) في كل layout',
      autoFixable: false,
    });
  }
  if (fixedSizes > 30) {
    findings.push({
      id: 'PWA-011',
      category: 'pwa-mobile',
      severity: 'low',
      title: `${fixedSizes} استخدام لأحجام pixel ثابتة`,
      description: 'الأحجام الثابتة تكسر التصميم على شاشات مختلفة',
      fix: 'استخدم rem/em أو نسب مئوية أو Tailwind size classes',
      autoFixable: false,
    });
  }

  // ── Touch targets ──
  const tinyButtons = Number(safeExec(
    `rg -n "h-4|h-5|h-6.*w-4|w-5|w-6" components/ui app -g "*.tsx" 2>/dev/null | grep -i "button\\|btn" | wc -l`
  ).trim() || '0');
  if (tinyButtons > 5) {
    findings.push({
      id: 'PWA-012',
      category: 'pwa-mobile',
      severity: 'low',
      title: 'أزرار قد تكون أصغر من 44×44px (touch target)',
      description: 'WCAG و Apple HIG يطلبان touch target ≥ 44×44px',
      fix: 'تأكد أن min-h-11 min-w-11 على الأزرار التفاعلية',
      autoFixable: false,
      references: ['https://www.w3.org/WAI/WCAG21/Understanding/target-size.html'],
    });
  }

  return findings;
}
