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

export async function auditTesting(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  const pkg = existsSync('package.json')
    ? JSON.parse(readFileSync('package.json', 'utf8'))
    : { dependencies: {}, devDependencies: {} };
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const scripts = pkg.scripts ?? {};

  // ── Unit testing framework ──
  const hasUnit = !!deps['vitest'] || !!deps['jest'] || !!deps['mocha'];
  if (!hasUnit) {
    findings.push({
      id: 'TEST-001',
      category: 'testing',
      severity: 'critical',
      title: 'لا يوجد إطار اختبار وحدات (vitest / jest)',
      description: 'بدون unit tests: كل تغيير قد يكسر شيئاً صامتاً',
      fix: 'npm i -D vitest @testing-library/react @testing-library/jest-dom',
      autoFixable: false,
    });
  }

  // ── E2E testing ──
  const hasE2E = !!deps['@playwright/test'] || !!deps['cypress'];
  if (!hasE2E) {
    findings.push({
      id: 'TEST-002',
      category: 'testing',
      severity: 'high',
      title: 'لا يوجد إطار E2E (Playwright / Cypress)',
      description: 'بدون E2E: لا تعرف أن flows الأساسية (signup, payment) تعمل',
      fix: 'npm i -D @playwright/test ثم npx playwright install',
      autoFixable: false,
    });
  }

  // ── Test count vs source files ──
  const srcFiles = Number(safeExec(
    'find app components src -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v "\\.test\\." | grep -v "\\.spec\\." | wc -l'
  ).trim() || '0');
  const testFiles = Number(safeExec(
    'find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | grep -v node_modules | wc -l'
  ).trim() || '0');

  if (srcFiles > 0) {
    const ratio = testFiles / srcFiles;
    if (ratio < 0.05) {
      findings.push({
        id: 'TEST-003',
        category: 'testing',
        severity: 'high',
        title: `نسبة اختبار منخفضة جداً: ${testFiles} اختبار لـ ${srcFiles} ملف مصدر (${(ratio * 100).toFixed(1)}%)`,
        description: 'المعيار الصناعي: ≥20% ملفات اختبار، ≥80% تغطية على الكود الحرج',
        fix: 'ابدأ باختبار: API routes (auth, billing)، logic functions، forms',
        autoFixable: false,
        references: ['https://martinfowler.com/articles/practical-test-pyramid.html'],
      });
    } else if (ratio < 0.15) {
      findings.push({
        id: 'TEST-004',
        category: 'testing',
        severity: 'medium',
        title: `نسبة اختبار متوسطة: ${(ratio * 100).toFixed(1)}%`,
        description: 'يمكن تحسينها — استهدف ≥20% للملفات الحرجة',
        fix: 'أضف اختبارات للـ API routes الحساسة (auth, payments, agents)',
        autoFixable: false,
      });
    }
  }

  // ── Coverage script ──
  if (!scripts['test:coverage'] && !scripts['coverage']) {
    findings.push({
      id: 'TEST-005',
      category: 'testing',
      severity: 'medium',
      title: 'لا يوجد script لقياس test coverage',
      description: 'بدون قياس التغطية لا تعرف أي أجزاء من الكود غير محمية',
      fix: 'أضف "test:coverage": "vitest run --coverage" في package.json',
      autoFixable: true,
    });
  }

  // ── Coverage threshold in CI ──
  const ciFiles = safeExec(
    'find .github/workflows -name "*.yml" 2>/dev/null'
  ).split('\n').filter(Boolean);
  const hasCoverageGate = ciFiles.some(f => {
    try {
      const content = readFileSync(f, 'utf8');
      return /coverage|codecov|coveralls/i.test(content);
    } catch { return false; }
  });
  if (!hasCoverageGate && ciFiles.length > 0) {
    findings.push({
      id: 'TEST-006',
      category: 'testing',
      severity: 'low',
      title: 'CI لا يفرض حد أدنى لـ test coverage',
      description: 'بدون threshold: التغطية قد تنخفض مع كل PR',
      fix: 'أضف Codecov action مع coverage threshold (مثلاً 70%)',
      autoFixable: false,
    });
  }

  // ── Visual regression ──
  const hasVisualRegression = !!deps['@playwright/test'] && safeExec(
    `rg -l "toHaveScreenshot|toMatchSnapshot" e2e tests test 2>/dev/null`
  ).split('\n').filter(Boolean).length > 0;
  if (!hasVisualRegression) {
    findings.push({
      id: 'TEST-007',
      category: 'testing',
      severity: 'low',
      title: 'لا يوجد visual regression tests',
      description: 'تغييرات CSS قد تكسر الشكل دون أن يلاحظ أحد',
      fix: 'أضف toHaveScreenshot() في playwright tests للصفحات الأساسية',
      autoFixable: false,
    });
  }

  // ── AI evals ──
  const hasEval = !!scripts['eval'] || !!scripts['eval:report'];
  if (!hasEval && (deps['ai'] || deps['@ai-sdk/google'])) {
    findings.push({
      id: 'TEST-008',
      category: 'testing',
      severity: 'high',
      title: 'لا يوجد AI evals/benchmarks',
      description: 'بدون evals: لا تعرف أن إجابات الـ LLM تحسنت أم تراجعت',
      fix: 'استخدم promptfoo أو langfuse-evals أو golden-set + LLM-judge',
      autoFixable: false,
      references: ['https://www.promptfoo.dev/'],
    });
  }

  // ── Mutation testing ──
  if (!deps['stryker-mutator'] && !deps['@stryker-mutator/core']) {
    findings.push({
      id: 'TEST-009',
      category: 'testing',
      severity: 'info',
      title: 'لا يوجد mutation testing (Stryker)',
      description: 'mutation testing يكشف أن اختباراتك تختبر السلوك الفعلي وليس فقط coverage',
      fix: 'إذا كانت التغطية ≥70%: أضف Stryker لقياس جودة الاختبارات',
      autoFixable: false,
      references: ['https://stryker-mutator.io/'],
    });
  }

  // ── Firestore rules tests ──
  const rulesTest = existsSync('test/firestore-rules.test.ts');
  if (!rulesTest && existsSync('firestore.rules')) {
    findings.push({
      id: 'TEST-010',
      category: 'testing',
      severity: 'high',
      title: 'firestore.rules بدون اختبارات',
      description: 'تعديل قواعد Firestore بدون اختبار قد يكشف بيانات حساسة',
      fix: 'استخدم @firebase/rules-unit-testing لكتابة test/firestore-rules.test.ts',
      autoFixable: false,
      references: ['https://firebase.google.com/docs/rules/unit-tests'],
    });
  }

  return findings;
}
