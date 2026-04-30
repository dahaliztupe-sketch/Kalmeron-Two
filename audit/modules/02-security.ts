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

export async function auditSecurity(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── OWASP A02: Cryptographic Failures — Secrets in code ──
  const secretPatterns = [
    { pattern: 'sk_live_[A-Za-z0-9]{24}', name: 'Stripe Secret Key' },
    { pattern: 'sk_test_[A-Za-z0-9]{24}', name: 'Stripe Test Key' },
    { pattern: 'AIzaSy[A-Za-z0-9_-]{33}', name: 'Google API Key' },
    { pattern: 'ghp_[A-Za-z0-9]{36}', name: 'GitHub Token' },
    { pattern: '"private_key":\\s*"-----BEGIN', name: 'Private Key مُضمَّن' },
  ];

  const scanRoots = ['app', 'src', 'components'].filter(existsSync).join(' ');
  for (const { pattern, name } of secretPatterns) {
    if (!scanRoots) continue;
    const out = safeExec(
      `rg -l "${pattern}" ${scanRoots} -g "*.ts" -g "*.tsx" -g "*.js" 2>/dev/null | grep -v ".env" | grep -v "example"`
    );
    const hits = out.split('\n').filter(Boolean);
    if (hits.length > 0) {
      findings.push({
        id: `SEC-001-${name.replace(/\s/g, '')}`,
        category: 'security',
        severity: 'critical',
        title: `🔴 Secret محتمل في الكود: ${name}`,
        description: 'مفتاح سري مُضمَّن في الكود — خطر كبير جداً',
        evidence: hits.slice(0, 3).join('\n'),
        fix: 'انقل الـ secret لـ .env.local فوراً وأبلّغ عنه كـ compromised واطلب مفتاح جديد',
        autoFixable: false,
        references: ['https://owasp.org/Top10/A02_2021-Cryptographic_Failures/'],
      });
    }
  }

  // ── OWASP A05: Security Headers ──
  if (existsSync('next.config.ts')) {
    const nextConfig = readFileSync('next.config.ts', 'utf8');

    const requiredHeaders = [
      { header: 'Content-Security-Policy', id: 'SEC-CSP' },
      { header: 'X-Frame-Options', id: 'SEC-XFO' },
      { header: 'X-Content-Type-Options', id: 'SEC-CTO' },
      { header: 'Strict-Transport-Security', id: 'SEC-HSTS' },
      { header: 'Permissions-Policy', id: 'SEC-PP' },
    ];

    for (const { header, id } of requiredHeaders) {
      if (!nextConfig.includes(header)) {
        findings.push({
          id,
          category: 'security',
          severity: 'high',
          title: `Header أمني ناقص: ${header}`,
          description: `Security header ${header} غير موجود في next.config.ts`,
          location: 'next.config.ts',
          fix: `أضف ${header} في دالة headers() داخل next.config.ts`,
          autoFixable: true,
          references: ['https://owasp.org/www-project-secure-headers/'],
        });
      }
    }

    if (nextConfig.includes('Strict-Transport-Security')) {
      const hstsMatch = nextConfig.match(/max-age=(\d+)/);
      if (hstsMatch && parseInt(hstsMatch[1], 10) < 15_552_000) {
        findings.push({
          id: 'SEC-HSTS-WEAK',
          category: 'security',
          severity: 'medium',
          title: 'HSTS max-age قصير جداً',
          description: `max-age=${hstsMatch[1]} أقل من 180 يوم (15,552,000 ثانية)`,
          location: 'next.config.ts',
          fix: 'اضبط max-age=63072000 (سنتان) مع includeSubDomains; preload',
          autoFixable: true,
        });
      }
    }
  }

  // ── OWASP A03: XSS via dangerouslySetInnerHTML ──
  const dangerousRaw = safeExec(
    'rg -n "dangerouslySetInnerHTML" app src components -g "*.tsx" 2>/dev/null'
  );
  const dangerousUsages = dangerousRaw.split('\n').filter(Boolean);
  for (const usage of dangerousUsages) {
    if (
      !usage.includes('DOMPurify') &&
      !usage.includes('sanitize') &&
      !usage.includes('xss') &&
      !usage.includes('safeJsonLd') &&
      !usage.includes('sanitizeJsonLd') &&
      !usage.includes('sanitizeHtml')
    ) {
      findings.push({
        id: `SEC-XSS-${usage.split(':')[0]}`,
        category: 'security',
        severity: 'high',
        title: 'dangerouslySetInnerHTML بدون sanitization',
        description: 'استخدام dangerouslySetInnerHTML بدون تنظيف المحتوى — خطر XSS',
        location: usage.split(':')[0],
        evidence: usage.slice(0, 200),
        fix: 'استخدم DOMPurify.sanitize() أو xss(...) قبل تمرير المحتوى',
        autoFixable: false,
        references: ['https://owasp.org/www-community/attacks/xss/'],
      });
    }
  }

  // ── Rate limiting coverage ──
  const rateLimitOut = safeExec(
    'rg -l "rateLimit|rateLimiter|rate_limit" app/api 2>/dev/null'
  );
  const rateLimitRoutes = rateLimitOut.split('\n').filter(Boolean).length;
  const apiRoutesOut = safeExec('find app/api -name "route.ts" 2>/dev/null');
  const apiRoutes = apiRoutesOut.split('\n').filter(Boolean).length;

  if (apiRoutes > 0 && rateLimitRoutes < apiRoutes * 0.5) {
    findings.push({
      id: 'SEC-RATE-001',
      category: 'security',
      severity: 'high',
      title: `Rate limiting ناقص — ${apiRoutes} route و${rateLimitRoutes} فقط بها فحص`,
      description: 'أكثر من نصف API routes بدون rate limiting',
      fix: 'أضف middleware لـ rate limiting في proxy.ts أو على كل route حساس',
      autoFixable: false,
      references: ['https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/'],
    });
  }

  // ── CVE-2025-29927: Next.js Middleware Bypass ──
  if (existsSync('package.json')) {
    try {
      const pkgJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const nextVersion = (pkgJson.dependencies?.next ?? '').replace(/^[\^~]/, '');
      const versionMatch = nextVersion.match(/(\d+)\.(\d+)\.(\d+)/);
      if (versionMatch) {
        const [, majorS, minorS, patchS] = versionMatch;
        const major = Number(majorS), minor = Number(minorS), patch = Number(patchS);
        const isVulnerable =
          (major === 15 && (minor < 2 || (minor === 2 && patch < 3))) ||
          (major === 14 && (minor < 2 || (minor === 2 && patch < 25))) ||
          (major === 13 && (minor < 5 || (minor === 5 && patch < 9))) ||
          major < 13;

        if (isVulnerable) {
          findings.push({
            id: 'SEC-CVE-2025-29927',
            category: 'security',
            severity: 'critical',
            title: 'CVE-2025-29927: ثغرة تجاوز Middleware في Next.js',
            description: `إصدار Next.js (${nextVersion}) عُرضة لثغرة تجاوز المصادقة`,
            location: 'package.json',
            fix: 'حدّث Next.js لأحدث إصدار: npm install next@latest',
            autoFixable: true,
            references: ['https://nextjs.org/blog/cve-2025-29927'],
          });
        }
      }
    } catch { /* */ }
  }

  // ── CSRF / Origin checks for Server Actions ──
  const serverActionsOut = safeExec(
    'rg -l "use server" app -g "*.ts" -g "*.tsx" 2>/dev/null'
  );
  const serverActionFiles = serverActionsOut.split('\n').filter(Boolean).length;
  const csrfOut = safeExec(
    'rg -l "csrf|CSRF|x-csrf|originAllowList|verifyOrigin" app src -g "*.ts" 2>/dev/null'
  );
  const csrfFiles = csrfOut.split('\n').filter(Boolean).length;

  if (serverActionFiles > 0 && csrfFiles === 0) {
    findings.push({
      id: 'SEC-CSRF-001',
      category: 'security',
      severity: 'medium',
      title: 'Server Actions بدون CSRF / Origin protection صريح',
      description: 'Next.js يوفر حماية ضمنية، لكن يُنصح بـ custom origin validation',
      fix: 'تحقق من Origin header في كل Server Action حساس',
      autoFixable: false,
      references: ['https://owasp.org/www-community/attacks/csrf'],
    });
  }

  return findings;
}
