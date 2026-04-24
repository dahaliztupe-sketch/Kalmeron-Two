#!/usr/bin/env node
/**
 * check-audit — fail CI on high/critical npm-audit advisories,
 * with an explicit allowlist for known-no-fix issues.
 *
 * Usage:  node scripts/check-audit.mjs <audit-report.json>
 *
 * The companion CI step (.github/workflows/security.yml) generates
 * the report via `npm audit --omit=dev --json > audit-report.json`.
 *
 * To allowlist a new advisory:
 *   1. Confirm there is genuinely no fix available upstream.
 *   2. Add its GHSA ID to ALLOWLIST below with a one-line comment
 *      explaining the package, the risk, and the mitigation.
 *   3. Open an issue to track removal once a fix lands.
 */
import { readFileSync } from 'node:fs';

/**
 * Advisory IDs we accept the risk on (no upstream fix available).
 * Keep this list as small as possible.
 */
const ALLOWLIST = new Set([
  // xlsx (SheetJS Community Edition):
  // Prototype Pollution — only triggerable on attacker-controlled spreadsheet
  // input. We only parse files that the workspace owner explicitly uploads.
  'GHSA-4r6h-8v6p-xvw6',
  // xlsx ReDoS — same threat model as above.
  'GHSA-5pgg-2g8v-p4x9',
]);

const BLOCKING_SEVERITIES = new Set(['high', 'critical']);

const reportPath = process.argv[2];
if (!reportPath) {
  console.error('Usage: node scripts/check-audit.mjs <audit-report.json>');
  process.exit(2);
}

let report;
try {
  report = JSON.parse(readFileSync(reportPath, 'utf8'));
} catch (e) {
  console.error(`check-audit: could not read ${reportPath}: ${e.message}`);
  process.exit(2);
}

const blocking = [];
const allowlisted = [];

const vulns = report.vulnerabilities ?? {};
for (const [name, info] of Object.entries(vulns)) {
  const sev = info.severity;
  if (!BLOCKING_SEVERITIES.has(sev)) continue;

  // `via` is either a list of package names (transitive) or a list of
  // advisory objects (direct). Only the latter has a GHSA we can match.
  const advisories = (info.via ?? []).filter((v) => typeof v === 'object');
  if (advisories.length === 0) {
    blocking.push({ name, severity: sev, advisory: '(transitive)' });
    continue;
  }
  for (const adv of advisories) {
    const id = adv.url?.match(/GHSA-[a-z0-9-]+/i)?.[0] ?? adv.source ?? '';
    if (ALLOWLIST.has(id)) {
      allowlisted.push({ name, severity: sev, advisory: id, title: adv.title });
    } else {
      blocking.push({ name, severity: sev, advisory: id || '(unknown)', title: adv.title });
    }
  }
}

if (allowlisted.length > 0) {
  console.log(`check-audit: ${allowlisted.length} allowlisted advisor${allowlisted.length === 1 ? 'y' : 'ies'} (no fix upstream):`);
  for (const a of allowlisted) {
    console.log(`  - ${a.severity.toUpperCase()} ${a.name} (${a.advisory})${a.title ? ` — ${a.title}` : ''}`);
  }
}

if (blocking.length > 0) {
  console.error(`check-audit: FAIL — ${blocking.length} blocking advisor${blocking.length === 1 ? 'y' : 'ies'}:`);
  for (const b of blocking) {
    console.error(`  - ${b.severity.toUpperCase()} ${b.name} (${b.advisory})${b.title ? ` — ${b.title}` : ''}`);
  }
  console.error('');
  console.error('To allowlist a known-no-fix advisory, edit scripts/check-audit.mjs.');
  process.exit(1);
}

console.log('check-audit: PASS — no new high/critical advisories.');
process.exit(0);
