import { runQA } from './runner';
import { generateReport } from './reporter';

// تفريغ مخرجات stdout/stderr فوراً حتى تظهر السجلّات في الملفات/الأنابيب
const stdoutHandle = (process.stdout as unknown as { _handle?: { setBlocking?: (b: boolean) => void } })._handle;
const stderrHandle = (process.stderr as unknown as { _handle?: { setBlocking?: (b: boolean) => void } })._handle;
stdoutHandle?.setBlocking?.(true);
stderrHandle?.setBlocking?.(true);

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
