import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import type { AuditReport } from './types';
import { config } from './config';

function ensureDir(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function escapeHtml(value: string | undefined | null): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateHTMLReport(report: AuditReport): string {
  const severityColors: Record<string, string> = {
    critical: '#A32D2D',
    high: '#854F0B',
    medium: '#185FA5',
    low: '#27500A',
    info: '#666',
  };

  const allFindings = report.modules.flatMap(m => m.findings);
  const criticalFindings = allFindings.filter(f => f.severity === 'critical');
  const highCount = allFindings.filter(f => f.severity === 'high').length;
  const mediumCount = allFindings.filter(f => f.severity === 'medium').length;

  const headerColor = report.overallScore >= 80
    ? '#3B6D11'
    : report.overallScore >= 60
      ? '#854F0B'
      : '#A32D2D';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>تقرير الفحص الشامل — كلميرون AI — ${escapeHtml(new Date(report.timestamp).toLocaleDateString('ar-EG'))}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f8f8f6; color: #1a1a18; padding: 2rem; line-height: 1.5; }
  .header { background: white; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; border: 0.5px solid #e8e8e4; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; font-weight: 600; color: white; background: ${headerColor}; flex-shrink: 0; }
  .score-circle .num { font-size: 28px; line-height: 1; }
  .score-circle .grade { font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 1.5rem; }
  .stat { background: white; border-radius: 8px; padding: 1rem; text-align: center; border: 0.5px solid #e8e8e4; }
  .stat-n { font-size: 24px; font-weight: 600; }
  .stat-l { font-size: 11px; color: #888; margin-top: 3px; }
  .modules { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-bottom: 1.5rem; }
  .module-card { background: white; border-radius: 8px; padding: 12px; border: 0.5px solid #e8e8e4; }
  .module-score { font-size: 20px; font-weight: 600; }
  .module-name { font-size: 12px; color: #666; margin-top: 2px; }
  .findings { background: white; border-radius: 8px; overflow: hidden; border: 0.5px solid #e8e8e4; margin-bottom: 1.5rem; }
  .finding { padding: 14px 16px; border-top: 0.5px solid #f0f0ec; }
  .finding:first-child { border-top: 0; }
  .finding-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
  .badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 500; color: white; }
  .finding-title { font-size: 13px; font-weight: 500; }
  .finding-desc { font-size: 12px; color: #666; line-height: 1.5; }
  .finding-fix { font-size: 11px; color: #3B6D11; margin-top: 4px; font-family: ui-monospace, "SF Mono", Menlo, monospace; white-space: pre-wrap; }
  .finding-evidence { font-size: 11px; color: #888; margin-top: 4px; font-family: ui-monospace, "SF Mono", Menlo, monospace; background: #f5f5f0; padding: 4px 6px; border-radius: 3px; white-space: pre-wrap; word-break: break-all; }
  .finding-loc { font-size: 10px; color: #888; margin-top: 2px; }
  h1 { font-size: 22px; font-weight: 500; }
  h2 { font-size: 16px; font-weight: 500; margin-bottom: 10px; }
  .section { margin-bottom: 1.5rem; }
  details summary { cursor: pointer; padding: 10px 12px; background: white; border-radius: 8px; border: 0.5px solid #e8e8e4; font-size: 13px; font-weight: 500; }
  details summary:hover { background: #fafaf7; }
  details[open] summary { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
  .ok-banner { background: #EAF3DE; border-radius: 8px; padding: 1.5rem; text-align: center; color: #27500A; margin-bottom: 1.5rem; }
  a { color: #185FA5; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>تقرير الفحص الشامل — كلميرون AI</h1>
    <p style="font-size:13px;color:#888;margin-top:4px">${escapeHtml(new Date(report.timestamp).toLocaleString('ar-EG'))}</p>
    <p style="font-size:13px;margin-top:6px">${escapeHtml(report.summary)}</p>
  </div>
  <div class="score-circle">
    <span class="num">${report.overallScore}</span>
    <span class="grade">${report.grade}</span>
  </div>
</div>

<div class="grid">
  <div class="stat"><div class="stat-n" style="color:#A32D2D">${report.criticalCount}</div><div class="stat-l">مشاكل حرجة</div></div>
  <div class="stat"><div class="stat-n" style="color:#854F0B">${highCount}</div><div class="stat-l">عالية الخطورة</div></div>
  <div class="stat"><div class="stat-n" style="color:#185FA5">${mediumCount}</div><div class="stat-l">متوسطة</div></div>
  <div class="stat"><div class="stat-n" style="color:#3B6D11">${report.autoFixCount}</div><div class="stat-l">قابلة للإصلاح التلقائي</div></div>
</div>

<div class="section">
  <h2>النقاط حسب القسم</h2>
  <div class="modules">
    ${report.modules.map(m => `
      <div class="module-card" style="border-right: 3px solid ${m.score >= 80 ? '#3B6D11' : m.score >= 60 ? '#854F0B' : '#A32D2D'}">
        <div class="module-score" style="color: ${m.score >= 80 ? '#3B6D11' : m.score >= 60 ? '#854F0B' : '#A32D2D'}">${m.score}/100</div>
        <div class="module-name">${escapeHtml(m.module)}</div>
        <div style="font-size:10px;color:#888;margin-top:2px">${m.failed} مشكلة · ${m.duration}ms</div>
      </div>
    `).join('')}
  </div>
</div>

${criticalFindings.length > 0 ? `
<div class="section">
  <h2 style="color:#A32D2D">🔴 مشاكل حرجة — يجب الإصلاح الفوري</h2>
  <div class="findings">
    ${criticalFindings.map(f => `
      <div class="finding">
        <div class="finding-header">
          <span class="badge" style="background:${severityColors[f.severity]}">${escapeHtml(f.severity)}</span>
          <span class="finding-title">${escapeHtml(f.title)}</span>
        </div>
        <p class="finding-desc">${escapeHtml(f.description)}</p>
        ${f.location ? `<p class="finding-loc">📁 ${escapeHtml(f.location)}</p>` : ''}
        ${f.evidence ? `<pre class="finding-evidence">${escapeHtml(f.evidence)}</pre>` : ''}
        ${f.fix ? `<pre class="finding-fix">✅ ${escapeHtml(f.fix)}</pre>` : ''}
      </div>
    `).join('')}
  </div>
</div>` : `<div class="ok-banner">🎉 لا توجد مشاكل حرجة!</div>`}

<div class="section">
  <h2>كل النتائج (مفصّل)</h2>
  ${report.modules.map(m => `
    <details style="margin-bottom:8px">
      <summary>
        ${escapeHtml(m.module)} — ${m.score}/100 — ${m.findings.length} نتيجة
      </summary>
      <div class="findings" style="border-top-left-radius:0;border-top-right-radius:0">
        ${m.findings.length === 0
          ? `<div class="finding" style="color:#3B6D11">✅ لا مشاكل في هذا القسم</div>`
          : m.findings.map(f => `
              <div class="finding">
                <div class="finding-header">
                  <span class="badge" style="background:${severityColors[f.severity]}">${escapeHtml(f.severity)}</span>
                  <span class="finding-title">${escapeHtml(f.title)}</span>
                  ${f.autoFixable ? '<span style="font-size:10px;color:#3B6D11">🔧 تلقائي</span>' : ''}
                </div>
                <p class="finding-desc">${escapeHtml(f.description)}</p>
                ${f.location ? `<p class="finding-loc">📁 ${escapeHtml(f.location)}</p>` : ''}
                ${f.evidence ? `<pre class="finding-evidence">${escapeHtml(f.evidence)}</pre>` : ''}
                ${f.fix ? `<pre class="finding-fix">→ ${escapeHtml(f.fix)}</pre>` : ''}
                ${f.references && f.references.length > 0
                  ? `<p style="font-size:10px;margin-top:4px">${f.references.map(r => `<a href="${escapeHtml(r)}" target="_blank" rel="noopener">📖 مرجع</a>`).join(' · ')}</p>`
                  : ''}
              </div>
            `).join('')}
      </div>
    </details>
  `).join('')}
</div>

<p style="font-size:11px;color:#888;text-align:center;margin-top:2rem">
  تم التوليد بواسطة <strong>Kalmeron Audit System</strong> · ${escapeHtml(report.id)}
</p>

</body>
</html>`;

  const htmlPath = `${config.reportsDir}/report_${report.id}.html`;
  const jsonPath = `${config.reportsDir}/report_${report.id}.json`;
  ensureDir(htmlPath);
  writeFileSync(htmlPath, html, 'utf8');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  // Also write a "latest" symlink-style copy for easy access
  writeFileSync(`${config.reportsDir}/latest.html`, html, 'utf8');
  writeFileSync(`${config.reportsDir}/latest.json`, JSON.stringify(report, null, 2), 'utf8');

  return htmlPath;
}
