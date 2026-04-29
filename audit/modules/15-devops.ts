import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { AuditFinding } from '../types';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30_000 });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditDevOps(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── CI workflows present ──
  const wfDir = '.github/workflows';
  if (!existsSync(wfDir)) {
    findings.push({
      id: 'OPS-001',
      category: 'devops',
      severity: 'critical',
      title: 'لا يوجد GitHub Actions workflows',
      description: 'بدون CI: لا يوجد فحص تلقائي لكل PR، الأخطاء تذهب للإنتاج',
      fix: 'أنشئ .github/workflows/ci.yml بـ typecheck + lint + test + build',
      autoFixable: false,
    });
    return findings;
  }

  const workflows = readdirSync(wfDir)
    .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map(f => join(wfDir, f));

  // ── Required CI jobs ──
  const requiredJobs = [
    { name: 'typecheck', kw: ['typecheck', 'tsc'], sev: 'high' as const },
    { name: 'lint', kw: ['lint', 'eslint'], sev: 'high' as const },
    { name: 'test', kw: ['vitest', 'jest', 'npm test', 'npm run test'], sev: 'high' as const },
    { name: 'build', kw: ['next build', 'npm run build'], sev: 'high' as const },
    { name: 'e2e', kw: ['playwright', 'cypress'], sev: 'medium' as const },
    { name: 'security-scan', kw: ['semgrep', 'codeql', 'snyk', 'trivy'], sev: 'medium' as const },
    { name: 'dependency-review', kw: ['dependency-review', 'npm audit', 'osv-scanner'], sev: 'medium' as const },
  ];

  const allWfContent = workflows.map(f => {
    try { return readFileSync(f, 'utf8'); } catch { return ''; }
  }).join('\n');

  for (const job of requiredJobs) {
    if (!job.kw.some(k => allWfContent.includes(k))) {
      findings.push({
        id: `OPS-CI-${job.name.toUpperCase()}`,
        category: 'devops',
        severity: job.sev,
        title: `CI لا يشغّل ${job.name}`,
        description: `لم يُعثر على job يشغّل ${job.name} في .github/workflows/`,
        fix: `أضف job في ci.yml يشغّل ${job.kw[0]}`,
        autoFixable: false,
      });
    }
  }

  // ── Branch protection hint ──
  if (!existsSync('.github/CODEOWNERS')) {
    findings.push({
      id: 'OPS-002',
      category: 'devops',
      severity: 'medium',
      title: 'CODEOWNERS مفقود',
      description: 'بدون CODEOWNERS: لا توجد مراجعة إجبارية للملفات الحرجة (firestore.rules, payments)',
      fix: 'أنشئ .github/CODEOWNERS وحدد ownership للمسارات الحساسة',
      autoFixable: false,
      references: ['https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners'],
    });
  }

  // ── Dependabot / Renovate ──
  const hasDependabot = existsSync('.github/dependabot.yml') || existsSync('.github/dependabot.yaml');
  const hasRenovate = existsSync('renovate.json') || existsSync('.renovaterc.json');
  if (!hasDependabot && !hasRenovate) {
    findings.push({
      id: 'OPS-003',
      category: 'devops',
      severity: 'medium',
      title: 'لا يوجد تحديث تلقائي للمكتبات (Dependabot/Renovate)',
      description: 'المكتبات تتقادم وتتراكم الثغرات الأمنية',
      fix: 'أنشئ .github/dependabot.yml لـ npm + github-actions',
      autoFixable: true,
    });
  }

  // ── PR/Issue templates ──
  const hasPRTemplate = existsSync('.github/PULL_REQUEST_TEMPLATE.md') ||
    existsSync('.github/pull_request_template.md');
  if (!hasPRTemplate) {
    findings.push({
      id: 'OPS-004',
      category: 'devops',
      severity: 'low',
      title: 'PR template مفقود',
      description: 'PRs بدون قالب موحد تُصعّب المراجعة',
      fix: 'أنشئ .github/PULL_REQUEST_TEMPLATE.md',
      autoFixable: true,
    });
  }

  // ── Pre-commit hooks ──
  const hasHusky = existsSync('.husky') || (existsSync('package.json') &&
    JSON.parse(readFileSync('package.json', 'utf8')).devDependencies?.husky);
  const hasLefthook = existsSync('lefthook.yml');
  if (!hasHusky && !hasLefthook) {
    findings.push({
      id: 'OPS-005',
      category: 'devops',
      severity: 'low',
      title: 'لا يوجد pre-commit hooks (Husky/Lefthook)',
      description: 'الأخطاء البسيطة (lint, typecheck) تصل للـ CI بدلاً من الكشف محلياً',
      fix: 'npm i -D husky lint-staged ثم npx husky init',
      autoFixable: false,
    });
  }

  // ── Conventional commits ──
  const hasCommitlint = (existsSync('package.json') &&
    JSON.parse(readFileSync('package.json', 'utf8')).devDependencies?.['@commitlint/cli']) ||
    existsSync('commitlint.config.js') || existsSync('.commitlintrc');
  if (!hasCommitlint) {
    findings.push({
      id: 'OPS-006',
      category: 'devops',
      severity: 'info',
      title: 'لا يوجد فرض لـ Conventional Commits',
      description: 'بدون commit format موحد: الـ changelog وتتبع التغييرات صعب',
      fix: 'npm i -D @commitlint/cli @commitlint/config-conventional',
      autoFixable: false,
      references: ['https://www.conventionalcommits.org/'],
    });
  }

  // ── Release automation ──
  const hasReleaseFlow = workflows.some(f => /release|changelog|semantic/i.test(f));
  if (!hasReleaseFlow) {
    findings.push({
      id: 'OPS-007',
      category: 'devops',
      severity: 'low',
      title: 'لا يوجد release automation',
      description: 'إصدار النسخ يدوياً يعرّض المشروع لأخطاء بشرية',
      fix: 'أضف release-please-action أو semantic-release',
      autoFixable: false,
    });
  }

  // ── Env example ──
  if (!existsSync('.env.example')) {
    findings.push({
      id: 'OPS-008',
      category: 'devops',
      severity: 'high',
      title: '.env.example مفقود',
      description: 'المساهمون الجدد لا يعرفون أي env vars يحتاجون',
      fix: 'أنشئ .env.example بكل المتغيرات المطلوبة (بدون قيم)',
      autoFixable: false,
    });
  }

  // ── Docker / containerization ──
  if (!existsSync('Dockerfile') && !existsSync('docker-compose.yml')) {
    findings.push({
      id: 'OPS-009',
      category: 'devops',
      severity: 'info',
      title: 'لا يوجد Dockerfile',
      description: 'النشر متعدد المنصات أصعب بدون container reproducible',
      fix: 'أنشئ Dockerfile أو اعتمد على Vercel/Cloud Run بدون Docker',
      autoFixable: false,
    });
  }

  // ── Secret scanning ──
  const hasGitleaks = workflows.some(f => /gitleaks|trufflehog/i.test(f));
  if (!hasGitleaks) {
    findings.push({
      id: 'OPS-010',
      category: 'devops',
      severity: 'high',
      title: 'لا يوجد secret scanning في CI (gitleaks/trufflehog)',
      description: 'مفاتيح API قد تتسرّب في commits دون كشف تلقائي',
      fix: 'أضف .github/workflows/gitleaks.yml',
      autoFixable: false,
      references: ['https://github.com/gitleaks/gitleaks'],
    });
  }

  return findings;
}
