#!/usr/bin/env node
/**
 * Build CommonJS bundles of the security primitives that fuzz targets need.
 *
 * Fuzz targets in `tests/fuzz/` are plain CommonJS so they can be loaded
 * by jazzer.js inside ClusterFuzzLite. They cannot import TypeScript
 * directly, so we pre-compile the relevant `src/lib/security/*.ts`
 * modules into `dist-fuzz/*.js` using esbuild.
 *
 * Usage:
 *   node scripts/build-fuzz.mjs
 *
 * Called automatically from `.clusterfuzzlite/build.sh` before fuzz
 * compilation, and locally so static analysers (e.g. the broken-import
 * scanner in `scripts/diagnostics/scan-errors.mjs`) can resolve the
 * fuzz target imports.
 */
import { build } from 'esbuild';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'dist-fuzz');

const ENTRIES = [
  'src/lib/security/prompt-guard.ts',
  'src/lib/security/sanitize-log.ts',
];

await build({
  entryPoints: ENTRIES.map((p) => path.join(ROOT, p)),
  outdir: OUT_DIR,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  sourcemap: false,
  logLevel: 'info',
  entryNames: '[name]',
});

console.log(`[build-fuzz] wrote ${ENTRIES.length} module(s) to ${path.relative(ROOT, OUT_DIR)}/`);
