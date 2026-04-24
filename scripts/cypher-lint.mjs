#!/usr/bin/env node
/**
 * cypher-lint — block string-concatenation Cypher queries to prevent injection.
 *
 * Closes 🟡 on TB4 of docs/THREAT_MODEL.md. Runs in CI via .github/workflows/security.yml.
 *
 * The rule:
 *   - Any call to driver.session().run(<query>, <params>) MUST pass an Object literal
 *     or named binding for parameters. The first arg must be a string literal —
 *     NEVER a template literal with embedded expressions, NEVER string concatenation.
 *
 * Usage:  node scripts/cypher-lint.mjs
 * Exit codes:  0 = pass, 1 = violations found, 2 = scan error.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['src', 'app'];
const EXTS = new Set(['.ts', '.tsx']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', 'coverage', '.venv']);

/** Walk a tree and yield candidate files. */
function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) yield* walk(full);
    else if (EXTS.has(full.slice(full.lastIndexOf('.')))) yield full;
  }
}

/**
 * Heuristic detection of dangerous Cypher patterns:
 *   1) `.run(\`...${expr}...\`)`  — template literal with interpolation
 *   2) `.run('...' + expr)`       — string concat
 *   3) `.run(variableName)`       — query built dynamically (warn)
 */
const VIOLATIONS = [];

function scanFile(file) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Quick filter: only inspect lines that look like cypher .run(
    if (!/\.(run|executeQuery)\s*\(/.test(line)) continue;

    // P1: Template literal with embedded ${} as the FIRST argument
    if (/\.(run|executeQuery)\s*\(\s*`[^`]*\$\{/.test(line)) {
      VIOLATIONS.push({
        file, line: i + 1, kind: 'template-injection',
        snippet: line.trim(),
      });
      continue;
    }

    // P2: String concatenation in the first argument
    if (/\.(run|executeQuery)\s*\(\s*['"][^'"]*['"]\s*\+/.test(line)) {
      VIOLATIONS.push({
        file, line: i + 1, kind: 'concat-injection',
        snippet: line.trim(),
      });
      continue;
    }

    // P3: First arg is bare identifier (warn — may or may not be safe)
    const m = line.match(/\.(run|executeQuery)\s*\(\s*([a-zA-Z_$][\w$]*)\s*[,)]/);
    if (m && !['query', 'cypher', 'CYPHER', 'QUERY'].includes(m[2])) {
      // Only flag if the identifier name looks user-derived
      if (/(req|input|user|payload|body|args)/i.test(m[2])) {
        VIOLATIONS.push({
          file, line: i + 1, kind: 'dynamic-query-warn',
          snippet: line.trim(),
        });
      }
    }
  }
}

function main() {
  for (const root of ROOTS) {
    try { statSync(root); } catch { continue; }
    for (const file of walk(root)) {
      try { scanFile(file); } catch (e) {
        console.error(`cypher-lint: scan error ${file}: ${e.message}`);
        process.exit(2);
      }
    }
  }

  if (VIOLATIONS.length === 0) {
    console.log('cypher-lint: PASS — no string-concatenated Cypher queries found.');
    process.exit(0);
  }

  console.error(`cypher-lint: FAIL — ${VIOLATIONS.length} violation(s):`);
  for (const v of VIOLATIONS) {
    const rel = relative(process.cwd(), v.file);
    console.error(`  ${v.kind.padEnd(22)} ${rel}:${v.line}`);
    console.error(`    ${v.snippet}`);
  }
  console.error('');
  console.error('Use parameterized queries only:');
  console.error('  await session.run(`MATCH (n {id: $id}) RETURN n`, { id: userId });');
  process.exit(1);
}

main();
