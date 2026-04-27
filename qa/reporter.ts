import { writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import type { QAReport } from './types';

const REPORTS_DIR = join(process.cwd(), 'qa', 'reports');
const MAX_REPORTS = 30;

function ensureReportsDir() {
  try {
    mkdirSync(REPORTS_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

/**
 * يحتفظ بآخر 30 تقريراً فقط ويحذف الأقدم.
 */
function rotateReports() {
  try {
    const files = readdirSync(REPORTS_DIR)
      .filter((f) => f.startsWith('report_') && (f.endsWith('.html') || f.endsWith('.json')))
      .map((f) => ({ f, full: join(REPORTS_DIR, f), mtime: statSync(join(REPORTS_DIR, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    // نحتفظ بـ MAX_REPORTS من كل صنف (html / json)
    const htmls = files.filter((x) => x.f.endsWith('.html'));
    const jsons = files.filter((x) => x.f.endsWith('.json'));

    [...htmls.slice(MAX_REPORTS), ...jsons.slice(MAX_REPORTS)].forEach((x) => {
      try {
        unlinkSync(x.full);
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

export function generateReport(report: QAReport): string {
  ensureReportsDir();

  const criticalHTML = report.criticalIssues
    .map(
      (r) => `<tr class="critical">
      <td>${escapeHtml(r.page)}</td>
      <td>${escapeHtml(r.device)}</td>
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.message)}</td>
      <td>${r.autoFixable ? '🔧 تلقائي' : '👤 يدوي'}</td>
    </tr>`
    )
    .join('');

  const deviceSummary = Object.entries(
    report.pageReports.reduce(
      (acc, r) => {
        if (!acc[r.device]) acc[r.device] = { pass: 0, fail: 0, warn: 0 };
        acc[r.device].pass += r.passed;
        acc[r.device].fail += r.failed;
        acc[r.device].warn += r.warnings;
        return acc;
      },
      {} as Record<string, { pass: number; fail: number; warn: number }>
    )
  )
    .map(
      ([device, stats]) =>
        `<div class="device-card ${stats.fail > 0 ? 'has-issues' : 'clean'}">
      <b>${escapeHtml(device)}</b>
      <span class="pass">✅ ${stats.pass}</span>
      <span class="fail">❌ ${stats.fail}</span>
      <span class="warn">⚠️ ${stats.warn}</span>
    </div>`
    )
    .join('');

  const scoreColor =
    report.score >= 90 ? '#3B6D11' : report.score >= 75 ? '#854F0B' : '#A32D2D';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>تقرير QA — كلميرون — ${new Date(report.timestamp).toLocaleDateString('ar-EG')}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f5f0; color: #2c2c2a; padding: 2rem; }
  .header { background: white; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; border: 0.5px solid #e0e0d8; }
  .score { font-size: 64px; font-weight: 500; color: ${scoreColor}; }
  .score-label { font-size: 14px; color: #888; }
  .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.5rem; }
  .card { background: white; border-radius: 8px; padding: 1rem; border: 0.5px solid #e0e0d8; text-align: center; }
  .card-num { font-size: 28px; font-weight: 500; }
  .card-label { font-size: 12px; color: #888; margin-top: 4px; }
  .devices { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; }
  .device-card { background: white; border-radius: 8px; padding: 12px 16px; border: 0.5px solid #e0e0d8; }
  .device-card.has-issues { border-color: #E24B4A; }
  .device-card.clean { border-color: #639922; }
  .device-card b { display: block; margin-bottom: 6px; }
  .pass { color: #3B6D11; margin-left: 8px; }
  .fail { color: #A32D2D; margin-left: 8px; }
  .warn { color: #854F0B; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 1.5rem; }
  th { background: #f5f5f0; padding: 10px 12px; font-size: 12px; text-align: right; font-weight: 500; }
  td { padding: 10px 12px; font-size: 13px; border-top: 0.5px solid #e0e0d8; }
  tr.critical td { background: #FCEBEB; }
  h2 { font-size: 16px; font-weight: 500; margin-bottom: 12px; }
  .section { margin-bottom: 2rem; }
</style>
</head>
<body>

<div class="header">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <h1 style="font-size:24px;font-weight:500;margin-bottom:4px">تقرير QA — كلميرون AI</h1>
      <p style="font-size:14px;color:#888">${new Date(report.timestamp).toLocaleString('ar-EG')} — ${escapeHtml(report.baseUrl)}</p>
      <p style="font-size:14px;margin-top:8px">${escapeHtml(report.summary)}</p>
    </div>
    <div style="text-align:center">
      <div class="score">${report.score}</div>
      <div class="score-label">/ 100</div>
    </div>
  </div>
</div>

<div class="grid4">
  <div class="card"><div class="card-num" style="color:#3B6D11">${report.passed}</div><div class="card-label">اختبار نجح</div></div>
  <div class="card"><div class="card-num" style="color:#A32D2D">${report.failed}</div><div class="card-label">اختبار فشل</div></div>
  <div class="card"><div class="card-num" style="color:#854F0B">${report.warnings}</div><div class="card-label">تحذيرات</div></div>
  <div class="card"><div class="card-num" style="color:#A32D2D">${report.criticalIssues.length}</div><div class="card-label">مشاكل حرجة</div></div>
</div>

<div class="section">
  <h2>النتائج حسب الجهاز</h2>
  <div class="devices">${deviceSummary}</div>
</div>

${
  report.criticalIssues.length > 0
    ? `
<div class="section">
  <h2>المشاكل الحرجة — يجب الإصلاح الفوري</h2>
  <table>
    <tr><th>الصفحة</th><th>الجهاز</th><th>نوع المشكلة</th><th>التفاصيل</th><th>الإصلاح</th></tr>
    ${criticalHTML}
  </table>
</div>`
    : '<div class="section" style="background:white;border-radius:8px;padding:1.5rem;border:0.5px solid #639922;color:#3B6D11;text-align:center">لا توجد مشاكل حرجة 🎉</div>'
}

</body>
</html>`;

  const reportPath = join(REPORTS_DIR, `report_${report.runId}.html`);
  writeFileSync(reportPath, html, 'utf-8');

  writeFileSync(
    join(REPORTS_DIR, `report_${report.runId}.json`),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  rotateReports();

  console.log(`📄 التقرير محفوظ: ${reportPath}`);
  return reportPath;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
