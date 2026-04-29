import { readFileSync, existsSync, statSync } from 'fs';
import type { AuditFinding } from '../types';

export async function auditDocumentation(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── README ──
  if (!existsSync('README.md')) {
    findings.push({
      id: 'DOC-001',
      category: 'documentation',
      severity: 'high',
      title: 'README.md مفقود',
      description: 'بدون README: المساهمون والمستخدمون لا يعرفون من أين يبدؤون',
      fix: 'أنشئ README.md بـ: ما هو المشروع، التثبيت، التشغيل، الـ scripts',
      autoFixable: false,
    });
  } else {
    const readme = readFileSync('README.md', 'utf8');
    const required = [
      { key: 'install', terms: ['install', 'تثبيت', 'getting started', 'البداية'] },
      { key: 'usage', terms: ['usage', 'الاستخدام', 'how to', 'كيف'] },
      { key: 'env', terms: ['environment', '.env', 'env vars', 'بيئة'] },
      { key: 'license', terms: ['license', 'الترخيص'] },
    ];
    const lower = readme.toLowerCase();
    for (const r of required) {
      if (!r.terms.some(t => lower.includes(t.toLowerCase()))) {
        findings.push({
          id: `DOC-README-${r.key.toUpperCase()}`,
          category: 'documentation',
          severity: 'low',
          title: `README لا يغطي قسم: ${r.key}`,
          description: `يُنصح بإضافة قسم ${r.key} في README`,
          location: 'README.md',
          fix: `أضف قسم ${r.key} في README.md`,
          autoFixable: false,
        });
      }
    }
    if (readme.length < 1000) {
      findings.push({
        id: 'DOC-002',
        category: 'documentation',
        severity: 'medium',
        title: `README قصير جداً (${readme.length} حرف)`,
        description: 'README أقل من 1000 حرف لا يُعطي صورة كافية للمشروع',
        fix: 'وسّع README بـ: لقطات شاشة، architecture diagram، روابط للوثائق',
        autoFixable: false,
      });
    }
  }

  // ── CONTRIBUTING ──
  if (!existsSync('CONTRIBUTING.md') && !existsSync('.github/CONTRIBUTING.md')) {
    findings.push({
      id: 'DOC-003',
      category: 'documentation',
      severity: 'medium',
      title: 'CONTRIBUTING.md مفقود',
      description: 'المساهمون الجدد لا يعرفون قواعد الـ PR والـ branching',
      fix: 'أنشئ CONTRIBUTING.md بالـ workflow وقواعد الـ commit',
      autoFixable: false,
    });
  }

  // ── LICENSE ──
  if (!existsSync('LICENSE') && !existsSync('LICENSE.md') && !existsSync('LICENSE.txt')) {
    findings.push({
      id: 'DOC-004',
      category: 'documentation',
      severity: 'high',
      title: 'LICENSE مفقود',
      description: 'بدون license صريح: قانونياً لا يحق لأحد استخدام الكود',
      fix: 'أضف ملف LICENSE (MIT / Apache-2.0 / Proprietary)',
      autoFixable: false,
      references: ['https://choosealicense.com/'],
    });
  }

  // ── SECURITY.md ──
  if (!existsSync('SECURITY.md') && !existsSync('.github/SECURITY.md')) {
    findings.push({
      id: 'DOC-005',
      category: 'documentation',
      severity: 'medium',
      title: 'SECURITY.md مفقود',
      description: 'الباحثون الأمنيون لا يعرفون كيفية الإبلاغ عن الثغرات',
      fix: 'أنشئ SECURITY.md بـ: contact email + supported versions + reporting policy',
      autoFixable: false,
      references: ['https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository'],
    });
  }

  // ── CHANGELOG ──
  if (!existsSync('CHANGELOG.md')) {
    findings.push({
      id: 'DOC-006',
      category: 'documentation',
      severity: 'low',
      title: 'CHANGELOG.md مفقود',
      description: 'المستخدمون والمستثمرون لا يرون تطور المنصة عبر الإصدارات',
      fix: 'استخدم Keep a Changelog format، أو أتمته بـ release-please',
      autoFixable: false,
      references: ['https://keepachangelog.com/'],
    });
  }

  // ── ADRs (Architectural Decision Records) ──
  if (!existsSync('docs/adr') && !existsSync('docs/adrs') && !existsSync('docs/decisions')) {
    findings.push({
      id: 'DOC-007',
      category: 'documentation',
      severity: 'low',
      title: 'لا يوجد ADRs (قرارات معمارية موثقة)',
      description: 'القرارات الكبرى (لماذا Firebase؟ لماذا next-intl؟) ليست موثقة',
      fix: 'أنشئ docs/adr/0001-record-architecture-decisions.md',
      autoFixable: false,
      references: ['https://adr.github.io/'],
    });
  }

  // ── API documentation ──
  const hasApiDocs = existsSync('public/api-docs') || existsSync('docs/api') ||
    existsSync('openapi.yaml') || existsSync('openapi.json');
  if (!hasApiDocs) {
    findings.push({
      id: 'DOC-008',
      category: 'documentation',
      severity: 'medium',
      title: 'لا يوجد توثيق API (OpenAPI/Swagger)',
      description: 'بدون OpenAPI: العملاء الخارجيون لا يستطيعون التكامل مع API',
      fix: 'استخدم zod-to-openapi أو أنشئ openapi.yaml يدوياً',
      autoFixable: false,
    });
  }

  // ── Code of conduct ──
  if (!existsSync('CODE_OF_CONDUCT.md') && !existsSync('.github/CODE_OF_CONDUCT.md')) {
    findings.push({
      id: 'DOC-009',
      category: 'documentation',
      severity: 'info',
      title: 'CODE_OF_CONDUCT.md مفقود',
      description: 'المجتمعات المفتوحة بحاجة لميثاق سلوك',
      fix: 'انسخ Contributor Covenant',
      autoFixable: false,
      references: ['https://www.contributor-covenant.org/'],
    });
  }

  // ── docs folder existence ──
  if (!existsSync('docs') || (existsSync('docs') && statSync('docs').isDirectory())) {
    if (!existsSync('docs')) {
      findings.push({
        id: 'DOC-010',
        category: 'documentation',
        severity: 'low',
        title: 'مجلد docs/ مفقود',
        description: 'الوثائق التفصيلية يجب أن تكون في docs/ منفصلة عن README',
        fix: 'أنشئ docs/ بـ: architecture.md, deployment.md, api.md',
        autoFixable: false,
      });
    }
  }

  return findings;
}
