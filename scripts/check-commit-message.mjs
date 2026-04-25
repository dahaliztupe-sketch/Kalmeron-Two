#!/usr/bin/env node
/**
 * Lightweight Conventional Commits validator (no dependencies).
 *
 * Usage:
 *   node scripts/check-commit-message.mjs path/to/COMMIT_EDITMSG
 *   node scripts/check-commit-message.mjs --stdin
 *   git config core.hooksPath .githooks   # then drop a one-line hook in commit-msg
 *
 * Exit codes:
 *   0  message is valid
 *   1  message is invalid (prints a remediation hint)
 *   2  usage error (no input given)
 */
import fs from 'node:fs';
import process from 'node:process';

const TYPES = [
  'feat',
  'fix',
  'refactor',
  'perf',
  'docs',
  'test',
  'chore',
  'build',
  'ci',
  'style',
  'revert',
];

const HEADER_RE = new RegExp(
  '^(' + TYPES.join('|') + ')(\\([\\w./-]+\\))?(!)?: .{1,200}$',
);

function readInput() {
  const args = process.argv.slice(2);
  if (args[0] === '--stdin') {
    return fs.readFileSync(0, 'utf8');
  }
  if (args.length === 0) {
    process.stderr.write('usage: check-commit-message.mjs <path> | --stdin\n');
    process.exit(2);
  }
  const path = args[0];
  if (!fs.existsSync(path)) {
    process.stderr.write(`commit-message file not found: ${path}\n`);
    process.exit(2);
  }
  return fs.readFileSync(path, 'utf8');
}

function validate(message) {
  const lines = message.split(/\r?\n/);
  const header = (lines[0] || '').trim();
  if (!header) {
    return { ok: false, reason: 'empty commit header' };
  }
  // Allow merge / fixup / revert auto-headers from git tooling
  if (/^(Merge|Revert|fixup!|squash!) /.test(header)) {
    return { ok: true };
  }
  if (!HEADER_RE.test(header)) {
    return {
      ok: false,
      reason:
        'header does not match Conventional Commits. Expected: <type>(scope)?: <subject>\n' +
        '  allowed types: ' +
        TYPES.join(', '),
    };
  }
  if (lines.length > 1 && lines[1].trim() !== '') {
    return { ok: false, reason: 'second line of commit message must be blank' };
  }
  return { ok: true };
}

const result = validate(readInput());
if (!result.ok) {
  process.stderr.write(`commit message rejected: ${result.reason}\n`);
  process.stderr.write('see CONTRIBUTING.md section "Conventional Commits" for examples.\n');
  process.exit(1);
}
process.stdout.write('commit message OK\n');
