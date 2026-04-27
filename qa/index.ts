import { runQA } from './runner';
import { generateReport } from './reporter';

async function main() {
  try {
    const report = await runQA();
    generateReport(report);

    if (report.criticalIssues.length > 0) {
      console.error(
        `\n🔴 ${report.criticalIssues.length} مشكلة حرجة — يجب الإصلاح قبل النشر\n`
      );
      process.exit(1);
    }

    if (report.score < 75) {
      console.warn(`\n⚠️  النقاط ${report.score}/100 — يُنصح بالمراجعة قبل النشر\n`);
      process.exit(0);
    }

    console.log(`\n✅ اجتاز QA بنجاح — النقاط: ${report.score}/100\n`);
    process.exit(0);
  } catch (error) {
    console.error('خطأ في تشغيل QA:', error);
    process.exit(1);
  }
}

main();
