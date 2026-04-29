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

export async function auditAccessibility(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── Skip-link / main landmark ──
  if (existsSync('app/layout.tsx')) {
    const layout = readFileSync('app/layout.tsx', 'utf8');
    if (!/skip[\s-]?(to|link)|تخطي/i.test(layout)) {
      findings.push({
        id: 'A11Y-001',
        category: 'accessibility',
        severity: 'medium',
        title: 'Skip-to-content link مفقود',
        description: 'مستخدمو لوحة المفاتيح يحتاجون رابط "تخطي إلى المحتوى" قبل القائمة الرئيسية',
        location: 'app/layout.tsx',
        fix: 'أضف <a href="#main" class="skip-link">تخطي إلى المحتوى</a> كأول عنصر في <body>',
        autoFixable: false,
        references: ['https://www.w3.org/WAI/WCAG21/Techniques/general/G1'],
      });
    }
    if (!/<main[\s>]/i.test(layout) && !safeExec('rg -l "<main" app -g "*.tsx" 2>/dev/null')) {
      findings.push({
        id: 'A11Y-002',
        category: 'accessibility',
        severity: 'medium',
        title: 'لا يوجد <main> landmark صريح',
        description: 'بدون <main>: قارئات الشاشة لا تعرف المحتوى الأساسي',
        fix: 'لُف المحتوى الأساسي في <main id="main"> داخل layout',
        autoFixable: false,
        references: ['https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/'],
      });
    }
  }

  // ── Buttons without aria-label / accessible name ──
  const iconButtons = safeExec(
    'rg -n "<button[^>]*>\\s*<(svg|Icon|.*Icon)" app components -g "*.tsx" 2>/dev/null'
  );
  const iconBtnLines = iconButtons
    .split('\n')
    .filter(line => line && !/aria-label|aria-labelledby/.test(line));
  if (iconBtnLines.length > 0) {
    findings.push({
      id: 'A11Y-003',
      category: 'accessibility',
      severity: 'high',
      title: `${iconBtnLines.length} زر أيقونة بدون aria-label`,
      description: 'الأزرار التي تحوي أيقونة فقط بدون نص لا تُعرف لقارئ الشاشة',
      evidence: iconBtnLines.slice(0, 3).join('\n'),
      fix: 'أضف aria-label="وصف الزر" لكل زر بدون نص مرئي',
      autoFixable: false,
      references: ['https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html'],
    });
  }

  // ── Form inputs without labels ──
  const inputsRaw = safeExec(
    'rg -n "<input " app components -g "*.tsx" 2>/dev/null'
  );
  const unlabeledInputs = inputsRaw
    .split('\n')
    .filter(line => line && !/aria-label|aria-labelledby|id=|type="hidden"/.test(line));
  if (unlabeledInputs.length > 5) {
    findings.push({
      id: 'A11Y-004',
      category: 'accessibility',
      severity: 'high',
      title: `${unlabeledInputs.length} حقل إدخال بدون label واضح`,
      description: 'حقول النموذج بدون <label htmlFor="..."> أو aria-label تُسبّب فشل WCAG 2.1 AA',
      fix: 'لكل <input>: استخدم <label htmlFor="x"> أو aria-label أو aria-labelledby',
      autoFixable: false,
    });
  }

  // ── Color-only meaning (text-red without icon/text) ──
  const colorOnly = safeExec(
    'rg -n "text-red-|text-green-|text-yellow-" app components -g "*.tsx" 2>/dev/null | wc -l'
  ).trim();
  if (Number(colorOnly) > 30) {
    findings.push({
      id: 'A11Y-005',
      category: 'accessibility',
      severity: 'low',
      title: 'استخدام كثيف للون كدليل وحيد',
      description: 'مستخدمو عمى الألوان لا يميزون الحالات اعتماداً على اللون فقط',
      fix: 'أضف أيقونة أو نص لكل حالة (✓ نجاح، ✗ فشل) بجوار اللون',
      autoFixable: false,
      references: ['https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html'],
    });
  }

  // ── Focus styles ──
  const focusVisible = safeExec(
    'rg -l "focus-visible|:focus-visible|focus:ring|focus:outline" app components -g "*.css" -g "*.tsx" 2>/dev/null'
  ).split('\n').filter(Boolean).length;
  if (focusVisible < 3) {
    findings.push({
      id: 'A11Y-006',
      category: 'accessibility',
      severity: 'medium',
      title: 'أنماط :focus-visible شبه غائبة',
      description: 'بدون focus ring واضح، مستخدم لوحة المفاتيح يضيع داخل التطبيق',
      fix: 'أضف focus:ring-2 focus:ring-primary لكل زر/رابط/حقل، واحترم prefers-reduced-motion',
      autoFixable: false,
      references: ['https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html'],
    });
  }

  // ── Images alt coverage (combine with FE module) ──
  const imageAlt = safeExec(
    'rg -n "<Image[^>]*alt=\\\"\\\"" app components -g "*.tsx" 2>/dev/null'
  ).split('\n').filter(Boolean).length;
  if (imageAlt > 10) {
    findings.push({
      id: 'A11Y-007',
      category: 'accessibility',
      severity: 'low',
      title: `${imageAlt} صورة معلوماتية تستخدم alt=""`,
      description: 'alt فارغ للصور الزخرفية فقط — تأكد أن صور المحتوى لها وصف',
      fix: 'راجع الصور: alt="" للزخرفية، alt="وصف" للمحتوى',
      autoFixable: false,
    });
  }

  // ── Heading hierarchy ──
  const h1Count = safeExec(
    'rg -n "<h1[\\s>]" app -g "page.tsx" 2>/dev/null | wc -l'
  ).trim();
  const pageCount = safeExec(
    'find app -name "page.tsx" 2>/dev/null | wc -l'
  ).trim();
  if (Number(pageCount) > 3 && Number(h1Count) < Number(pageCount) * 0.5) {
    findings.push({
      id: 'A11Y-008',
      category: 'accessibility',
      severity: 'medium',
      title: `أكثر من نصف الصفحات بدون <h1> ظاهر`,
      description: `${h1Count}/${pageCount} صفحة فقط بها <h1> — هرمية العناوين تُسهم في SEO + a11y`,
      fix: 'تأكد أن كل صفحة عامة تحتوي على <h1> فريد ومعبّر',
      autoFixable: false,
    });
  }

  // ── prefers-reduced-motion respect ──
  const reducedMotion = safeExec(
    'rg -l "prefers-reduced-motion|useReducedMotion" app components -g "*.tsx" -g "*.css" 2>/dev/null'
  ).split('\n').filter(Boolean).length;
  const motionUsage = safeExec(
    'rg -l "framer-motion|motion\\." app components -g "*.tsx" 2>/dev/null'
  ).split('\n').filter(Boolean).length;
  if (motionUsage > 3 && reducedMotion === 0) {
    findings.push({
      id: 'A11Y-009',
      category: 'accessibility',
      severity: 'medium',
      title: 'animations كثيرة بدون احترام prefers-reduced-motion',
      description: 'المستخدمون الذين يفعّلون "تقليل الحركة" قد يصيبهم دوار',
      fix: 'استخدم useReducedMotion من motion، أو @media (prefers-reduced-motion: reduce)',
      autoFixable: false,
      references: ['https://web.dev/prefers-reduced-motion/'],
    });
  }

  // ── @axe-core / eslint-plugin-jsx-a11y ──
  if (existsSync('package.json')) {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (!allDeps['eslint-plugin-jsx-a11y'] && !allDeps['@axe-core/playwright']) {
      findings.push({
        id: 'A11Y-010',
        category: 'accessibility',
        severity: 'medium',
        title: 'لا يوجد أداة فحص آلي لـ a11y (axe / jsx-a11y)',
        description: 'أدوات الفحص الآلي تكتشف ~57% من مشاكل WCAG قبل الإطلاق',
        fix: 'npm i -D eslint-plugin-jsx-a11y @axe-core/playwright وأضفهم للـ pipeline',
        autoFixable: true,
        references: ['https://github.com/dequelabs/axe-core'],
      });
    }
  }

  return findings;
}
