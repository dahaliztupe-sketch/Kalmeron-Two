import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import type { AuditFinding } from '../types';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30_000 });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditFrontend(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── RTL & lang ──
  const layoutFile = 'app/layout.tsx';
  if (existsSync(layoutFile)) {
    const layout = readFileSync(layoutFile, 'utf8');
    if (!layout.includes('dir="rtl"') && !layout.includes("dir='rtl'")) {
      findings.push({
        id: 'FE-001',
        category: 'frontend',
        severity: 'critical',
        title: 'dir="rtl" مفقود في Root Layout',
        description: 'اتجاه RTL غير محدد على مستوى التطبيق كاملاً',
        location: layoutFile,
        fix: 'أضف dir="rtl" lang="ar" لـ <html> tag في app/layout.tsx',
        autoFixable: true,
      });
    }
    if (!layout.includes('lang="ar"') && !layout.includes("lang='ar'")) {
      findings.push({
        id: 'FE-002',
        category: 'frontend',
        severity: 'medium',
        title: 'lang="ar" مفقود في Root Layout',
        description: 'بدون lang attribute: SEO + accessibility يتأثران',
        location: layoutFile,
        fix: 'أضف lang="ar" لـ <html> في app/layout.tsx',
        autoFixable: true,
      });
    }
  }

  // ── <img> instead of next/image ──
  const imgRaw = safeExec(
    'rg -n "<img " app components -g "*.tsx" 2>/dev/null'
  );
  const imgTags = imgRaw
    .split('\n')
    .filter(line => line && !line.includes('next/image'))
    .length;
  if (imgTags > 0) {
    findings.push({
      id: 'FE-003',
      category: 'frontend',
      severity: 'medium',
      title: `${imgTags} صورة تستخدم <img> بدلاً من next/image`,
      description: 'next/image يحسن الأداء بـ lazy loading + WebP + size optimization',
      fix: 'استبدل <img> بـ <Image> من next/image',
      autoFixable: false,
    });
  }

  // ── loading.tsx files in dashboard groups ──
  const dashboardDirsRaw = safeExec(
    'find app -type d \\( -name "(dashboard)" -o -name "dashboard" \\) 2>/dev/null'
  );
  const dashboardDirs = dashboardDirsRaw.split('\n').filter(Boolean);
  for (const dir of dashboardDirs) {
    if (!existsSync(`${dir}/loading.tsx`)) {
      findings.push({
        id: `FE-004-${dir.replace(/[/()]/g, '-')}`,
        category: 'frontend',
        severity: 'low',
        title: `loading.tsx مفقود في ${dir}`,
        description: 'بدون loading.tsx: المستخدم يرى شاشة بيضاء أثناء التحميل',
        location: dir,
        fix: `أنشئ ${dir}/loading.tsx مع skeleton مناسب`,
        autoFixable: true,
      });
    }
  }

  // ── error.tsx files ──
  const mainDirs = ['app/(dashboard)', 'app/dashboard', 'app/api'];
  for (const dir of mainDirs) {
    if (existsSync(dir) && !existsSync(`${dir}/error.tsx`)) {
      findings.push({
        id: `FE-005-${dir.replace(/[/()]/g, '-')}`,
        category: 'frontend',
        severity: 'medium',
        title: `error.tsx مفقود في ${dir}`,
        description: 'بدون error.tsx: الأخطاء تُعطي صفحة Next.js الافتراضية',
        location: dir,
        fix: `أنشئ ${dir}/error.tsx برسالة خطأ بالعربية وزر "حاول مجدداً"`,
        autoFixable: true,
      });
    }
  }

  // ── Missing alt text ──
  const altRaw = safeExec(
    'rg -n "<Image|<img" app components -g "*.tsx" 2>/dev/null'
  );
  const missingAlt = altRaw
    .split('\n')
    .filter(line => line && !line.includes('alt='))
    .length;
  if (missingAlt > 0) {
    findings.push({
      id: 'FE-006',
      category: 'frontend',
      severity: 'medium',
      title: `${missingAlt} صورة بدون alt text`,
      description: 'يؤثر على accessibility وSEO',
      fix: 'أضف alt="" للصور الزخرفية، وalt="وصف واضح" لصور المحتوى',
      autoFixable: false,
      references: ['https://www.w3.org/WAI/tutorials/images/'],
    });
  }

  // ── Public pages missing metadata ──
  const publicPagesRaw = safeExec(
    'find app -name "page.tsx" -not -path "*/(dashboard)/*" -not -path "*/api/*" 2>/dev/null'
  );
  const publicPages = publicPagesRaw.split('\n').filter(Boolean);
  let missingMeta = 0;
  for (const page of publicPages) {
    if (existsSync(page)) {
      const content = readFileSync(page, 'utf8');
      if (
        !content.includes('export const metadata') &&
        !content.includes('export async function generateMetadata')
      ) {
        missingMeta++;
      }
    }
  }
  if (missingMeta > 0) {
    findings.push({
      id: 'FE-007',
      category: 'frontend',
      severity: 'high',
      title: `${missingMeta} صفحة عامة بدون metadata`,
      description: 'بدون metadata: SEO ضعيف وصور المشاركة مفقودة',
      fix: 'أضف export const metadata: Metadata لكل صفحة عامة',
      autoFixable: false,
    });
  }

  // ── Cookie consent banner ──
  const bannerRaw = safeExec(
    'rg -n "CookieBanner|cookie.*consent|cookiesAccepted" app components -g "*.tsx" 2>/dev/null'
  );
  if (bannerRaw.split('\n').filter(Boolean).length === 0) {
    findings.push({
      id: 'FE-008',
      category: 'frontend',
      severity: 'high',
      title: 'Cookie Consent Banner مفقود',
      description: 'مطلوب قانوناً بموجب GDPR وقانون 151 المصري لحماية البيانات الشخصية',
      fix: 'أنشئ components/ui/CookieBanner.tsx وأضفه في app/layout.tsx',
      autoFixable: false,
      references: ['https://gdpr.eu/cookies/'],
    });
  }

  return findings;
}
