import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import type { AuditFinding } from '../types';

function safeExec(cmd: string, opts: { timeout?: number } = {}): string {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: opts.timeout ?? 60_000,
    });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditCodeQuality(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── 1. TypeScript strict check ──
  try {
    const out = execSync(
      'node --stack-size=32768 --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit 2>&1',
      { encoding: 'utf8', timeout: 180_000 }
    );
    void out;
  } catch (e: any) {
    const stdout = (e.stdout?.toString?.() ?? '') as string;
    const errorCount = (stdout.match(/error TS/g) || []).length;
    if (errorCount > 0) {
      findings.push({
        id: 'CQ-001',
        category: 'code-quality',
        severity: 'high',
        title: `${errorCount} خطأ TypeScript`,
        description: 'الكود لا يمر من فحص TypeScript الصارم',
        evidence: stdout.slice(0, 500),
        fix: 'شغّل: npm run typecheck وأصلح كل خطأ',
        autoFixable: false,
        references: ['https://www.typescriptlang.org/docs/handbook/2/types-from-types.html'],
      });
    }
  }

  // ── 2. ESLint errors ──
  const lintRaw = safeExec('npx eslint . --format json 2>/dev/null', { timeout: 120_000 });
  if (lintRaw) {
    try {
      const lintData = JSON.parse(lintRaw);
      const errors = lintData.flatMap((f: any) =>
        (f.messages ?? []).filter((m: any) => m.severity === 2)
      );
      if (errors.length > 0) {
        findings.push({
          id: 'CQ-002',
          category: 'code-quality',
          severity: 'medium',
          title: `${errors.length} خطأ ESLint`,
          description: 'مخالفات قواعد الكود',
          fix: 'شغّل: npx eslint . --fix لإصلاح التلقائي',
          autoFixable: true,
          references: ['https://eslint.org/docs/latest/'],
        });
      }
    } catch { /* ignore JSON parse */ }
  }

  // ── 3. Dependency vulnerabilities ──
  const auditRaw = safeExec('npm audit --json 2>/dev/null', { timeout: 90_000 });
  if (auditRaw) {
    try {
      const audit = JSON.parse(auditRaw);
      const high = audit.metadata?.vulnerabilities?.high ?? 0;
      const crit = audit.metadata?.vulnerabilities?.critical ?? 0;
      const total = high + crit;
      if (total > 0) {
        findings.push({
          id: 'CQ-003',
          category: 'code-quality',
          severity: total > 5 ? 'critical' : 'high',
          title: `${total} ثغرة في المكتبات (High/Critical)`,
          description: `مكتبات تحتوي على ${crit} حرجة و${high} عالية الخطورة`,
          fix: 'شغّل: npm audit fix أو حدّث المكتبات المتأثرة يدوياً',
          autoFixable: true,
          references: ['https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities'],
        });
      }
    } catch { /* */ }
  }

  // ── 4. Heavy dependency footprint ──
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const depCount = Object.keys(pkg.dependencies || {}).length;
    if (depCount > 80) {
      findings.push({
        id: 'CQ-004',
        category: 'code-quality',
        severity: 'low',
        title: `${depCount} dependency — قد تكون بعضها غير مستخدمة`,
        description: 'عدد كبير من المكتبات قد يزيد حجم الـ bundle ويُبطئ التثبيت',
        fix: 'راجع: npx depcheck لإيجاد المكتبات غير المستخدمة',
        autoFixable: false,
      });
    }
  } catch { /* */ }

  // ── 5. console.log in production code ──
  const consoleLogRaw = safeExec(
    'rg -n --type ts --type tsx "console\\.log" app src components -g "!*.test.*" -g "!*.spec.*" 2>/dev/null || grep -rn "console\\.log" app src components --include="*.ts" --include="*.tsx" 2>/dev/null'
  );
  const consoleCount = consoleLogRaw
    .split('\n')
    .filter(l => l && !l.includes('// eslint-disable') && !l.match(/^\s*\/\//))
    .length;
  if (consoleCount > 10) {
    findings.push({
      id: 'CQ-005',
      category: 'code-quality',
      severity: 'low',
      title: `${consoleCount} console.log في الكود الإنتاجي`,
      description: 'console.log تُبطئ الأداء وقد تكشف بيانات حساسة في الإنتاج',
      fix: 'استبدل بـ pino logger أو احذف console.log غير الضرورية',
      autoFixable: false,
    });
  }

  // ── 6. TODO/FIXME comments ──
  const todoRaw = safeExec(
    'rg -n "TODO:|FIXME:|HACK:|XXX:" app src components -g "*.ts" -g "*.tsx" 2>/dev/null || grep -rn "TODO:\\|FIXME:\\|HACK:\\|XXX:" app src components --include="*.ts" --include="*.tsx" 2>/dev/null'
  );
  const todoCount = todoRaw.split('\n').filter(Boolean).length;
  if (todoCount > 5) {
    findings.push({
      id: 'CQ-006',
      category: 'code-quality',
      severity: 'info',
      title: `${todoCount} تعليق TODO/FIXME في الكود`,
      description: 'توجد مهام معلقة في الكود قد تشير لمشاكل لم تُحل',
      fix: 'راجع وأكمل أو احذف التعليقات المعلقة قبل الإطلاق',
      autoFixable: false,
    });
  }

  return findings;
}
