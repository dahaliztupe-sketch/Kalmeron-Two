#!/usr/bin/env node
/**
 * Feature scaffolder — creates a uniform skeleton under `src/features/<name>`.
 *
 * Usage:
 *   node scripts/scaffold-feature.mjs <kebab-or-camel-name>
 *
 * Generates:
 *   src/features/<name>/types.ts        (Zod schema + inferred types)
 *   src/features/<name>/server.ts       (server-only entry stub)
 *   src/features/<name>/client.tsx      (client component stub)
 *   src/features/<name>/README.md       (spec-first description)
 *   test/<name>.test.ts                 (Vitest skeleton with one passing case)
 *
 * Refuses to overwrite existing files. Exits with a non-zero code on any
 * collision so CI / agents catch double-scaffolding.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const arg = process.argv[2];
if (!arg) {
  process.stderr.write('usage: node scripts/scaffold-feature.mjs <name>\n');
  process.exit(2);
}

const kebab = arg
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .toLowerCase()
  .replace(/^-|-$/g, '');

if (!/^[a-z][a-z0-9-]*$/.test(kebab)) {
  process.stderr.write(`invalid feature name after normalization: "${kebab}"\n`);
  process.exit(2);
}

const camel = kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const Pascal = camel.charAt(0).toUpperCase() + camel.slice(1);

const root = process.cwd();
const featureDir = path.join(root, 'src', 'features', kebab);
const testFile = path.join(root, 'test', `${kebab}.test.ts`);

const files = {
  [path.join(featureDir, 'types.ts')]: `import { z } from 'zod';

export const ${Pascal}InputSchema = z.object({
  // TODO: describe the inputs of "${kebab}".
  id: z.string().min(1),
});

export type ${Pascal}Input = z.infer<typeof ${Pascal}InputSchema>;

export const ${Pascal}OutputSchema = z.object({
  // TODO: describe the outputs of "${kebab}".
  ok: z.boolean(),
});

export type ${Pascal}Output = z.infer<typeof ${Pascal}OutputSchema>;
`,
  [path.join(featureDir, 'server.ts')]: `import 'server-only';
import { ${Pascal}InputSchema, type ${Pascal}Input, type ${Pascal}Output } from './types';

/**
 * Server-only entry for the "${kebab}" feature.
 * Validate input with Zod, then call your service / repository layer.
 */
export async function run${Pascal}(raw: unknown): Promise<${Pascal}Output> {
  const input: ${Pascal}Input = ${Pascal}InputSchema.parse(raw);
  // TODO: implement
  return { ok: true };
}
`,
  [path.join(featureDir, 'client.tsx')]: `'use client';

import { useState } from 'react';

export interface ${Pascal}Props {
  // TODO: describe client props
}

export function ${Pascal}({}: ${Pascal}Props) {
  const [pending, setPending] = useState(false);
  return (
    <div dir="rtl" className="p-4">
      <p>TODO: ${kebab} UI {pending ? '…' : ''}</p>
      <button onClick={() => setPending(true)}>تشغيل</button>
    </div>
  );
}
`,
  [path.join(featureDir, 'README.md')]: `# ${Pascal} Feature

## Spec
- **Goal:** TODO — one-sentence purpose.
- **Inputs:** see \`types.ts\` (\`${Pascal}InputSchema\`).
- **Outputs:** see \`types.ts\` (\`${Pascal}OutputSchema\`).
- **Owner:** TODO.

## Files
- \`types.ts\` — Zod schemas (the spec).
- \`server.ts\` — server-only logic.
- \`client.tsx\` — RSC-aware client component.
- \`../../../test/${kebab}.test.ts\` — Vitest suite.

## Definition of Done
- typecheck + lint clean.
- All tests in \`test/${kebab}.test.ts\` pass.
- README updated with goal/owner.
`,
  [testFile]: `import { describe, it, expect } from 'vitest';
import { ${Pascal}InputSchema } from '@/src/features/${kebab}/types';

describe('${kebab} feature', () => {
  it('accepts a valid input', () => {
    const r = ${Pascal}InputSchema.safeParse({ id: 'x' });
    expect(r.success).toBe(true);
  });

  it('rejects an empty id', () => {
    const r = ${Pascal}InputSchema.safeParse({ id: '' });
    expect(r.success).toBe(false);
  });
});
`,
};

const collisions = Object.keys(files).filter((f) => fs.existsSync(f));
if (collisions.length > 0) {
  process.stderr.write('refusing to overwrite existing files:\n');
  for (const f of collisions) process.stderr.write('  - ' + path.relative(root, f) + '\n');
  process.exit(1);
}

fs.mkdirSync(featureDir, { recursive: true });
fs.mkdirSync(path.dirname(testFile), { recursive: true });

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(filepath, content);
  process.stdout.write('created ' + path.relative(root, filepath) + '\n');
}

process.stdout.write('\nNext steps:\n');
process.stdout.write('  1. Edit ' + path.relative(root, path.join(featureDir, 'types.ts')) + ' to describe the real spec.\n');
process.stdout.write('  2. Implement run' + Pascal + ' in server.ts.\n');
process.stdout.write('  3. Run: npm run typecheck && npm run lint && npm test ' + kebab + '\n');
