#!/usr/bin/env node
/**
 * Diagnostics orchestrator.
 * Runs error scanner + gap scanner and produces a unified dashboard
 * report at diagnostics/reports/dashboard.md (+ .json).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import {
  ensureDirs, nowISO, dateStamp, writeJSON, writeMD, readJSONSafe,
  REPORTS_DIR, ERRORS_DIR, GAPS_DIR, HISTORY_DIR, ROOT,
} from './lib/utils.mjs';

function run(script) {
  const r = spawnSync(process.execPath, [script], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  if (r.status !== 0) {
    console.error(`\n[diagnostics] ${path.basename(script)} exited with code ${r.status}`);
  }
}

function main() {
  ensureDirs();
  const startedAt = nowISO();
  console.log('===== Internal Diagnostics =====');
  console.log(`Started: ${startedAt}\n`);

  run(path.join(ROOT, 'scripts/diagnostics/scan-errors.mjs'));
  run(path.join(ROOT, 'scripts/diagnostics/scan-gaps.mjs'));

  const errors = readJSONSafe(path.join(ERRORS_DIR, 'latest.json'), { totals: { all: 0 }, byScanner: {} });
  const gaps = readJSONSafe(path.join(GAPS_DIR, 'latest.json'), { totals: { all: 0 }, byScanner: {} });

  const dashboard = {
    type: 'dashboard',
    generatedAt: startedAt,
    finishedAt: nowISO(),
    errors: {
      total: errors.totals.all,
      bySeverity: { ...errors.totals, all: undefined },
      byScanner: errors.byScanner,
      delta: errors.delta,
    },
    gaps: {
      total: gaps.totals.all,
      bySeverity: { ...gaps.totals, all: undefined },
      byCategory: gaps.byScanner,
      delta: gaps.delta,
    },
    healthScore: computeHealthScore(errors, gaps),
    topPriorities: pickTopPriorities(errors, gaps),
  };

  writeJSON(path.join(REPORTS_DIR, 'dashboard.json'), dashboard);
  writeJSON(path.join(HISTORY_DIR, `dashboard-${dateStamp()}.json`), dashboard);
  writeMD(path.join(REPORTS_DIR, 'dashboard.md'), renderDashboard(dashboard));

  console.log('\n===== Diagnostics Complete =====');
  console.log(`Health score: ${dashboard.healthScore}/100`);
  console.log(`Errors: ${dashboard.errors.total}  |  Gaps: ${dashboard.gaps.total}`);
  console.log(`\nReports:`);
  console.log('  • diagnostics/reports/dashboard.md');
  console.log('  • diagnostics/errors/latest.md');
  console.log('  • diagnostics/gaps/latest.md\n');
}

function computeHealthScore(errors, gaps) {
  // Two-bucket capped penalty model.
  // - Errors are weighted more heavily (real bugs / vulnerabilities).
  // - Gaps are capped so a long tail of "nice-to-have" tasks (e.g. missing
  //   unit tests) cannot floor the score at 0 while real issues are clean.
  const errPen = Math.min(
    60,
    (errors.totals?.critical || 0) * 15
      + (errors.totals?.high || 0) * 5
      + (errors.totals?.medium || 0) * 1.2
      + (errors.totals?.low || 0) * 0.2
  );
  const gapPen = Math.min(
    30,
    (gaps.totals?.critical || 0) * 15
      + (gaps.totals?.high || 0) * 5
      + (gaps.totals?.medium || 0) * 1
      + (gaps.totals?.low || 0) * 0.05
  );
  return Math.max(0, Math.round(100 - errPen - gapPen));
}

function pickTopPriorities(errors, gaps) {
  const all = [
    ...(errors.findings || []).map((f) => ({ ...f, kind: 'error' })),
    ...(gaps.findings || []).map((f) => ({ ...f, kind: 'gap' })),
  ];
  const rank = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
  all.sort((a, b) => (rank[b.severity] ?? 0) - (rank[a.severity] ?? 0));
  return all.slice(0, 15).map((f) => ({
    kind: f.kind,
    severity: f.severity,
    scanner: f.scanner,
    code: f.code,
    file: f.file,
    line: f.line,
    message: f.message,
  }));
}

function renderDashboard(d) {
  const dl = (group, k) => {
    const v = d[group]?.delta?.[k]?.delta;
    if (v == null || v === 0) return '±0';
    return v > 0 ? `+${v}` : String(v);
  };
  let out = `# Project Health Dashboard

**Generated:** ${d.generatedAt}
**Health score:** **${d.healthScore} / 100**

| Section | Total | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| Errors | ${d.errors.total} | ${d.errors.bySeverity.critical || 0} | ${d.errors.bySeverity.high || 0} | ${d.errors.bySeverity.medium || 0} | ${d.errors.bySeverity.low || 0} |
| Gaps   | ${d.gaps.total}   | ${d.gaps.bySeverity.critical || 0}   | ${d.gaps.bySeverity.high || 0}   | ${d.gaps.bySeverity.medium || 0}   | ${d.gaps.bySeverity.low || 0}   |

### Trend vs previous run
- Errors total: ${dl('errors', 'all')}
- Gaps total: ${dl('gaps', 'all')}

---

## Errors by scanner
${Object.entries(d.errors.byScanner || {}).map(([k, v]) => `- **${k}**: ${v}`).join('\n') || '_(none)_'}

## Gaps by category
${Object.entries(d.gaps.byCategory || {}).map(([k, v]) => `- **${k}**: ${v}`).join('\n') || '_(none)_'}

---

## Top 15 priorities
`;
  if (!d.topPriorities.length) {
    out += '\n_Nothing urgent. Healthy state._\n';
  } else {
    for (const p of d.topPriorities) {
      const loc = p.file ? ` \`${p.file}${p.line ? ':' + p.line : ''}\`` : '';
      out += `\n- **[${p.severity}]** (${p.kind}) \`${p.scanner}/${p.code || ''}\`${loc}\n  ${p.message || ''}\n`;
    }
  }
  out += `\n---\n\n_Detailed reports:_\n- \`diagnostics/errors/latest.md\`\n- \`diagnostics/gaps/latest.md\`\n- History snapshots in \`diagnostics/history/\`\n`;
  return out;
}

main();
