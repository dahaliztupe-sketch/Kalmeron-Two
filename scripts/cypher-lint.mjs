#!/usr/bin/env node
/**
 * cypher-lint — blocks string-concatenated Cypher queries in Neo4j integration code.
 * Requires parameterized binds (e.g., `session.run(query, { param: value })` pattern).
 *
 * Closes TB4 in docs/THREAT_MODEL.md.
 * Usage: node scripts/cypher-lint.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOTS = ['src', 'app', 'services'];
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.local', '.venv', '__pycache__']);

// Patterns that indicate unsafe string-concatenated Cypher queries
const DANGEROUS_PATTERNS = [
  // JS/TS: session.run(`MATCH ... ${userInput}`)
  /session\.run\(\s*[`'"]\s*(?:MATCH|CREATE|MERGE|DELETE|REMOVE|SET|RETURN|WITH|WHERE|CALL).*\$\{/i,
  // JS/TS: cypher template with interpolation
  /(?:cypher|query|cql)\s*[=:]\s*[`]\s*(?:MATCH|CREATE|MERGE|DELETE|RETURN|WHERE).*\$\{/i,
  // JS/TS: string concat with Cypher keywords
  /["'](?:MATCH|CREATE|MERGE|DELETE|RETURN|WHERE)\s.*["']\s*\+\s*(?!['"])/i,
];

// Safe patterns (parameterized queries)
const SAFE_INDICATORS = [
  /session\.run\([^,]+,\s*\{/, // session.run(query, { params })
  /cypher-allow/,
];

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e)) continue;
    const full = join(dir, e);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      yield* walk(full);
    } else if (['.ts', '.tsx', '.js', '.mjs', '.py'].includes(extname(full))) {
      yield full;
    }
  }
}

const violations = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    let content;
    try { content = readFileSync(file, 'utf8'); } catch { continue; }
    if (!content.includes('neo4j') && !content.toLowerCase().includes('cypher') &&
        !content.includes('session.run') && !content.includes('driver.session')) {
      continue; // Skip files with no Neo4j/Cypher mentions
    }
    const lines = content.split(/\r?\n/);
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) return;
      if (line.includes('cypher-allow')) return;
      if ((lines[i - 1] ?? '').includes('cypher-allow')) return;
      for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(line)) {
          const isSafe = SAFE_INDICATORS.some(s => s.test(line));
          if (!isSafe) {
            violations.push({
              file: relative(process.cwd(), file),
              line: i + 1,
              preview: trimmed.slice(0, 100),
            });
          }
          break;
        }
      }
    });
  }
}

if (violations.length === 0) {
  console.log('cypher-lint: PASS — no string-concatenated Cypher queries found.');
  process.exit(0);
}

console.error(`cypher-lint: FAIL — ${violations.length} potential Cypher injection(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    ${v.preview}\n`);
}
process.exit(1);
