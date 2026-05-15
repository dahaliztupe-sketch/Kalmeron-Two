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
/**
 * Package names whose purely-transitive high/critical advisories we accept.
 * Use only when the package has no upstream fix and the advisory object carries
 * no GHSA ID (i.e. `via` contains only package-name strings, not advisory objects).
 * Each entry must include a comment explaining why it is safe to accept.
 */
const PACKAGE_ALLOWLIST = new Set([
  // @traceloop/node-server-sdk depends on @opentelemetry/sdk-node which carries
  // GHSA-q7rr-3cgh-j5r3 (already allowlisted above). The transitive chain
  // produces no additional advisory — the root cause is the same prometheus
  // exporter issue, allowlisted directly. No upstream fix as of 2026-05.
  '@traceloop/node-server-sdk',

  // @temporalio/* packages bundle protobufjs internally. All underlying
  // protobufjs advisory GHSAs (GHSA-66ff-xgx4-vchm, GHSA-2pr8-phx7-x9h3,
  // GHSA-fx83-v9x8-x52w, GHSA-75px-5xx7-5xc7, GHSA-jvwf-75h9-cwgg,
  // GHSA-685m-2w69-288q, GHSA-q6x5-8v7m-xcrf) are already in ALLOWLIST above.
  // These four packages carry no additional GHSA of their own — npm audit
  // surfaces them as pure transitive HIGH entries (via: package-name only).
  // Temporal SDK is used only for internal workflow orchestration with no
  // user-facing surface; no upstream fix available as of 2026-05.
  // Track: https://github.com/temporalio/sdk-node/issues — awaiting protobufjs bump.
  '@temporalio/client',
  '@temporalio/common',
  '@temporalio/proto',
  '@temporalio/workflow',
]);

const ALLOWLIST = new Set([
  // xlsx (SheetJS Community Edition):
  // Prototype Pollution — only triggerable on attacker-controlled spreadsheet
  // input. We only parse files that the workspace owner explicitly uploads.
  'GHSA-4r6h-8v6p-xvw6',
  // xlsx ReDoS — same threat model as above.
  'GHSA-5pgg-2g8v-p4x9',

  // @opentelemetry/exporter-prometheus (transitive via @traceloop/node-server-sdk):
  // Prometheus exporter crash via malformed HTTP request. The exporter is only
  // exposed internally (no public endpoint). No upstream fix available as of 2026-05.
  // Track: https://github.com/advisories/GHSA-q7rr-3cgh-j5r3
  'GHSA-q7rr-3cgh-j5r3',

  // protobufjs (transitive via @temporalio/* packages):
  // All advisories below affect protobufjs versions bundled inside @temporalio.
  // Upgrading requires a breaking @temporalio major release that is not yet available.
  // Temporal SDK is used only in internal workflow orchestration, not in user-facing
  // surfaces, which significantly limits the attack surface for all these advisories.
  // Track removal once @temporalio ships a patched protobufjs.
  'GHSA-q6x5-8v7m-xcrf', // overlong UTF-8 decoding
  'GHSA-2pr8-phx7-x9h3', // DoS via crafted field names
  'GHSA-66ff-xgx4-vchm', // code injection in generated toObject
  'GHSA-fx83-v9x8-x52w', // prototype injection in constructors
  'GHSA-75px-5xx7-5xc7', // code generation gadget after prototype pollution
  'GHSA-jvwf-75h9-cwgg', // DoS via unsafe option paths
  'GHSA-685m-2w69-288q', // DoS via unbounded recursion
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
    if (PACKAGE_ALLOWLIST.has(name)) {
      allowlisted.push({ name, severity: sev, advisory: '(transitive)', title: '(transitive — package allowlisted)' });
    } else {
      blocking.push({ name, severity: sev, advisory: '(transitive)' });
    }
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
