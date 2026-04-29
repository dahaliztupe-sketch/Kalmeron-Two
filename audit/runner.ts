import { auditCodeQuality } from './modules/01-code-quality';
import { auditSecurity } from './modules/02-security';
import { auditAuthentication } from './modules/03-authentication';
import { auditFrontend } from './modules/04-frontend';
import { auditBackend } from './modules/05-backend';
import { auditStorage } from './modules/06-storage';
import { auditPerformance } from './modules/07-performance';
import { auditSEO } from './modules/08-seo';
import { auditAIAgents } from './modules/09-ai-agents';
import { auditBusiness } from './modules/10-business';
import { calculateScore, getGrade } from './scorer';
import { generateHTMLReport } from './reporter';
import { config } from './config';
import type { AuditFinding, AuditReport, Category, ModuleResult } from './types';

interface ModuleSpec {
  fn: () => Promise<AuditFinding[]>;
  name: string;
  category: Category;
}

const ALL_MODULES: ModuleSpec[] = [
  { fn: auditCodeQuality,    name: 'جودة الكود',           category: 'code-quality' },
  { fn: auditSecurity,       name: 'الأمان (OWASP)',       category: 'security' },
  { fn: auditAuthentication, name: 'المصادقة',              category: 'authentication' },
  { fn: auditFrontend,       name: 'الواجهة الأمامية',     category: 'frontend' },
  { fn: auditBackend,        name: 'الخادم والـ API',       category: 'backend' },
  { fn: auditStorage,        name: 'التخزين (Firestore)',  category: 'storage' },
  { fn: auditPerformance,    name: 'الأداء (Lighthouse)',  category: 'performance' },
  { fn: auditSEO,            name: 'SEO والتسويق',          category: 'seo' },
  { fn: auditAIAgents,       name: 'وكلاء AI (16)',         category: 'ai-agents' },
  { fn: auditBusiness,       name: 'الأعمال والـ UX',       category: 'business' },
];

export async function runFullAudit(): Promise<AuditReport> {
  const runId = `audit_${Date.now()}`;
  const modules: ModuleResult[] = [];

  const selected = config.modules && config.modules.length > 0
    ? ALL_MODULES.filter(m => config.modules!.includes(m.category))
    : ALL_MODULES;

  console.log('\n' + '═'.repeat(60));
  console.log('  🔍 KALMERON — نظام الفحص الشامل الذاتي');
  console.log(`  🌐 Base URL: ${config.baseUrl}`);
  console.log(`  📦 Modules: ${selected.length}/${ALL_MODULES.length}`);
  console.log('═'.repeat(60) + '\n');

  for (const mod of selected) {
    const start = Date.now();
    process.stdout.write(`  ⏳ ${mod.name.padEnd(28)}`);

    const findings = await mod.fn().catch((err: any) => {
      console.error(`\n  ❌ خطأ في ${mod.name}:`, err?.message ?? err);
      return [] as AuditFinding[];
    });

    const duration = Date.now() - start;
    const failed = findings.filter(f =>
      ['critical', 'high', 'medium', 'low'].includes(f.severity),
    ).length;
    const passed = Math.max(0, 10 - failed);
    const score = calculateScore(findings);

    modules.push({
      module: mod.name,
      category: mod.category,
      score,
      findings,
      duration,
      passed,
      failed,
    });

    const indicator = score >= 80 ? '✅' : score >= 60 ? '⚠️ ' : '❌';
    console.log(` ${indicator} ${String(score).padStart(3)}/100  (${findings.length} نتيجة) — ${duration}ms`);
  }

  const allFindings = modules.flatMap(m => m.findings);
  const overallScore = modules.length === 0
    ? 0
    : Math.round(modules.reduce((s, m) => s + m.score, 0) / modules.length);
  const criticalFindings = allFindings.filter(f => f.severity === 'critical');

  const report: AuditReport = {
    id: runId,
    timestamp: new Date().toISOString(),
    projectName: 'Kalmeron AI',
    overallScore,
    grade: getGrade(overallScore),
    modules,
    criticalCount: criticalFindings.length,
    autoFixCount: allFindings.filter(f => f.autoFixable).length,
    manualFixCount: allFindings.filter(f => !f.autoFixable).length,
    topPriorities: allFindings
      .filter(f => ['critical', 'high'].includes(f.severity))
      .slice(0, 10),
    summary:
      criticalFindings.length > 0
        ? `⚠️ ${criticalFindings.length} مشكلة حرجة — النقاط: ${overallScore}/100`
        : overallScore >= 80
          ? `✅ المنصة في حالة ممتازة — النقاط: ${overallScore}/100`
          : `📋 تحتاج تحسينات — النقاط: ${overallScore}/100`,
  };

  const reportPath = generateHTMLReport(report);

  console.log('\n' + '═'.repeat(60));
  console.log(`  📊 النتيجة النهائية: ${overallScore}/100 (${report.grade})`);
  console.log(`  🔴 حرجة: ${report.criticalCount}  |  🔧 إصلاح تلقائي: ${report.autoFixCount}  |  ✋ يدوي: ${report.manualFixCount}`);
  console.log(`  📄 التقرير: ${reportPath}`);
  console.log(`  📄 JSON:    ${reportPath.replace('.html', '.json')}`);
  console.log('═'.repeat(60) + '\n');

  return report;
}

// نقطة الدخول
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('runner.ts') ||
  process.argv[1]?.endsWith('runner.js')
) {
  runFullAudit()
    .then(report => {
      if (config.failOnCritical && report.criticalCount > 0) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('فشل نظام الفحص:', err);
      process.exit(1);
    });
}
