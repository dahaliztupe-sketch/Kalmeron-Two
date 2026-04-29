import { execSync } from 'child_process';
import { existsSync } from 'fs';
import type { AuditFinding } from '../types';
import { config } from '../config';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 15_000 });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditBusiness(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const BASE_URL = config.baseUrl;

  // ── Required investor / user pages ──
  const requiredPages = [
    { path: '/about', name: 'عن كلميرون', priority: 'high' as const },
    { path: '/faq', name: 'الأسئلة الشائعة', priority: 'high' as const },
    { path: '/contact', name: 'تواصل معنا', priority: 'high' as const },
    { path: '/investors', name: 'صفحة المستثمرين', priority: 'high' as const },
    { path: '/demo', name: 'Demo تفاعلي', priority: 'high' as const },
    { path: '/security', name: 'صفحة الأمان', priority: 'medium' as const },
    { path: '/cookies', name: 'سياسة Cookies', priority: 'high' as const },
    { path: '/affiliate-terms', name: 'شروط الشركاء', priority: 'high' as const },
    { path: '/legal-templates', name: 'نماذج قانونية', priority: 'medium' as const },
  ];

  for (const page of requiredPages) {
    try {
      const status = execSync(
        `curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${page.path}" --max-time 8`,
        { encoding: 'utf8', timeout: 12_000, stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim();

      if (status === '404') {
        findings.push({
          id: `BIZ-PAGE-${page.path.replace(/\//g, '').toUpperCase()}`,
          category: 'business',
          severity: page.priority === 'high' ? 'high' : 'medium',
          title: `صفحة "${page.name}" غير موجودة (404)`,
          description: `${page.path} تُعطي 404 — تؤثر على ثقة المستثمرين والمستخدمين`,
          fix: `أنشئ app${page.path}/page.tsx بمحتوى مناسب`,
          autoFixable: false,
        });
      }
    } catch { /* */ }
  }

  // ── Onboarding wizard ──
  const onboardingHits = parseInt(
    safeExec(
      'rg -l "onboarding|OnboardingWizard" components 2>/dev/null | wc -l'
    ).trim() || '0',
    10,
  );
  const hasOnboarding =
    existsSync('app/onboarding') ||
    existsSync('app/(dashboard)/onboarding') ||
    onboardingHits > 2;

  if (!hasOnboarding) {
    findings.push({
      id: 'BIZ-ONBOARD-001',
      category: 'business',
      severity: 'high',
      title: 'Onboarding Wizard غير موجود',
      description: '75% من المستخدمين يتركون في أسبوع بدون onboarding فعّال (SaaS benchmark 2025)',
      fix: 'أنشئ wizard من 5 خطوات: مرحباً → نوع الشركة → المشكلة → أول وكيل → Quick Win',
      autoFixable: false,
      references: ['https://www.chameleon.io/blog/saas-onboarding-benchmarks'],
    });
  }

  // ── Inconsistency: عدد الوكلاء (16 vs 50) ──
  const agent16 = safeExec(
    'rg -n "16" app components -g "*.tsx" 2>/dev/null'
  )
    .split('\n')
    .filter(line => /وكيل|agent|مساعد/i.test(line)).length;

  const agent50 = safeExec(
    'rg -n "50" app components -g "*.tsx" 2>/dev/null'
  )
    .split('\n')
    .filter(line => /وكيل|agent|مساعد/i.test(line)).length;

  if (agent50 > 0 && agent16 > 0) {
    findings.push({
      id: 'BIZ-CONSISTENCY-001',
      category: 'business',
      severity: 'high',
      title: 'تناقض: "16 وكيل" و"50+ وكيل" في نفس الموقع',
      description: 'المستخدمون والمستثمرون سيلاحظون هذا التناقض',
      fix: 'وحّد العدد — استخدم "16+" في كل مكان أو حدّد عدداً دقيقاً',
      autoFixable: false,
    });
  }

  // ── Email / domain consistency ──
  const dotComHits = safeExec(
    'rg -l "kalmeron\\.com" app components 2>/dev/null'
  )
    .split('\n')
    .filter(Boolean).length;

  if (dotComHits > 0) {
    findings.push({
      id: 'BIZ-EMAIL-001',
      category: 'business',
      severity: 'medium',
      title: `${dotComHits} ملف يستخدم kalmeron.com بدلاً من kalmeron.ai`,
      description: 'تناقض في الدومين يربك المستخدمين والمستثمرين',
      fix: 'استبدل كل kalmeron.com بـ kalmeron.ai',
      autoFixable: true,
    });
  }

  return findings;
}
