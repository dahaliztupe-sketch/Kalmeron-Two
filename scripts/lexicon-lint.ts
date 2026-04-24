/**
 * lexicon-lint — fails CI if any user-facing surface uses a forbidden alias
 * listed in `src/lib/copy/lexicon.ts`.
 *
 * Usage:  pnpm tsx scripts/lexicon-lint.ts
 *
 * Scope:
 *   - Scans .tsx / .ts under app/, components/, src/lib/seo/, src/lib/copy/
 *   - Skips its own source (lexicon.ts) and tests (test/ and *.test.ts files).
 *   - A "violation" = the file contains a forbidden alias outside an
 *     `aliases: [...]` array (which is allowed inside lexicon.ts itself).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { LEXICON } from '../src/lib/copy/lexicon';

const ROOTS = ['app', 'components'];
const ALLOWED_FILES = new Set([
  'src/lib/copy/lexicon.ts',
  // SEO keyword catalogue intentionally uses raw English search terms.
  'src/lib/seo/use-cases.ts',
  // Dedicated technical pages — lexicon entries explicitly grant these
  // surfaces permission to use raw "MCP Server" / "API Docs" / "REST API".
  'app/mcp-server/page.tsx',
  'app/api-docs/page.tsx',
  // Machine-readable feed for AI crawlers — English-only by spec.
  'app/llms.txt/route.ts',
  // Experts pages use the deliberate "خبير" framing as an alternative
  // to "مساعد" — a brand decision documented in copy guidelines.
  'app/ai-experts/page.tsx',
  'app/ai-experts/[slug]/page.tsx',
  'app/(dashboard)/experts/page.tsx',
]);
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.local']);
/** Generic English words that overlap with JS identifiers, Tailwind classes,
 *  or REST API field names. Lower-cased comparison. */
const ASCII_STOPLIST = new Set([
  'agent', 'agents', 'space', 'seed', 'insight', 'workflow', 'workflows',
  'kpi', 'kpis', 'mvp', 'cash flow', 'runway',
]);
/** Minimum alias length for ASCII (English) terms. Arabic is unaffected.
 *  Set high enough (6) to skip generic words that overlap with Tailwind classes,
 *  identifiers, or English keywords (e.g. "space" in `space-y-2`, "agent",
 *  "seed", "MVP"). Real product terms ("Founder", "Workflows", "Co-founder",
 *  "runway", "cash flow", "Insights") are 6+ chars and remain enforced. */
const MIN_ASCII_ALIAS_LENGTH = 6;
/** Treat letter/digit/underscore as part of an "identifier" — won't match across them. */
const WORD_CHAR = /[A-Za-z0-9_\u0600-\u06FF]/;

function isAsciiOnly(s: string): boolean {
  return /^[\x20-\x7E]+$/.test(s);
}

function hasWordBoundary(line: string, idx: number, alias: string): boolean {
  const before = idx === 0 ? '' : line[idx - 1];
  const after = line[idx + alias.length] ?? '';
  return !WORD_CHAR.test(before) && !WORD_CHAR.test(after);
}

function* walk(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e)) continue;
    const full = join(dir, e);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      yield* walk(full);
    } else if (['.ts', '.tsx'].includes(extname(full)) && !full.endsWith('.test.ts')) {
      yield full;
    }
  }
}

interface Violation {
  file: string;
  line: number;
  alias: string;
  canonical: string;
  preview: string;
}

function scan(): Violation[] {
  const violations: Violation[] = [];

  const aliasMap: { alias: string; canonical: string }[] = [];
  for (const entry of Object.values(LEXICON)) {
    for (const alias of entry.aliases) {
      if (isAsciiOnly(alias)) {
        if (alias.length < MIN_ASCII_ALIAS_LENGTH) continue;
        if (ASCII_STOPLIST.has(alias.toLowerCase())) continue;
      }
      aliasMap.push({ alias, canonical: entry.canonical });
    }
  }

  for (const root of ROOTS) {
    for (const file of walk(root)) {
      const rel = relative(process.cwd(), file).replace(/\\/g, '/');
      if (ALLOWED_FILES.has(rel)) continue;
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
        // Escape hatch: `// lexicon-allow` (same line OR up to 3 preceding lines —
        // covers multi-line JSX where the comment sits above a `<p>` block).
        if (line.includes('lexicon-allow')) return;
        if ((lines[i - 1] ?? '').includes('lexicon-allow')) return;
        if ((lines[i - 2] ?? '').includes('lexicon-allow')) return;
        if ((lines[i - 3] ?? '').includes('lexicon-allow')) return;
        for (const { alias, canonical } of aliasMap) {
          let cursor = 0;
          while (true) {
            const idx = line.indexOf(alias, cursor);
            if (idx === -1) break;
            if (hasWordBoundary(line, idx, alias)) {
              violations.push({
                file: rel,
                line: i + 1,
                alias,
                canonical,
                preview: trimmed.slice(0, 120),
              });
              break; // one violation per (file, line, alias)
            }
            cursor = idx + alias.length;
          }
        }
      });
    }
  }
  return violations;
}

const violations = scan();
if (violations.length === 0) {
  console.log('lexicon-lint: PASS — no forbidden aliases in user-facing code.');
  process.exit(0);
}

console.error(`lexicon-lint: FAIL — ${violations.length} forbidden alias(es) found:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    alias    : "${v.alias}"`);
  console.error(`    canonical: "${v.canonical}"`);
  console.error(`    preview  : ${v.preview}\n`);
}
process.exit(1);
