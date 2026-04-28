#!/usr/bin/env node
/**
 * i18n-diff — compare messages/ar.json vs messages/en.json
 * Reports keys present in one locale but missing in the other.
 * Exit code 1 if any divergence detected.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const arPath = path.join(root, 'messages', 'ar.json');
const enPath = path.join(root, 'messages', 'en.json');

const ar = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

function flatten(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flatten(v, key));
    } else {
      out.push(key);
    }
  }
  return out;
}

const arKeys = new Set(flatten(ar));
const enKeys = new Set(flatten(en));

const missingInEn = [...arKeys].filter((k) => !enKeys.has(k)).sort();
const missingInAr = [...enKeys].filter((k) => !arKeys.has(k)).sort();

const report = {
  arKeyCount: arKeys.size,
  enKeyCount: enKeys.size,
  missingInEn,
  missingInAr,
  inSync: missingInEn.length === 0 && missingInAr.length === 0,
};

console.log(`AR keys: ${report.arKeyCount}`);
console.log(`EN keys: ${report.enKeyCount}`);
console.log(`Missing in EN (${missingInEn.length}):`);
for (const k of missingInEn.slice(0, 50)) console.log(`  - ${k}`);
if (missingInEn.length > 50) console.log(`  … and ${missingInEn.length - 50} more`);
console.log(`Missing in AR (${missingInAr.length}):`);
for (const k of missingInAr.slice(0, 50)) console.log(`  - ${k}`);
if (missingInAr.length > 50) console.log(`  … and ${missingInAr.length - 50} more`);

if (!report.inSync) {
  console.error('\n❌ Locale messages are out of sync.');
  process.exit(1);
}
console.log('\n✅ Locale messages are in sync.');
