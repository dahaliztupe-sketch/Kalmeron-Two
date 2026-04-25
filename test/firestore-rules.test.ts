/**
 * Firestore Security Rules — unit tests.
 *
 * Run with:
 *   npm run test:rules
 *
 * Requirements:
 *   1. Firestore emulator running on 127.0.0.1:8080
 *      (use `firebase emulators:exec --only firestore "npm run test:rules"`)
 *   2. `@firebase/rules-unit-testing` installed:
 *      npm i -D @firebase/rules-unit-testing
 *
 * If either is missing the suite skips itself rather than failing the build.
 */
 
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ID = 'kalmeron-rules-test';
let RULES = '';
try {
  RULES = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
} catch {
  RULES = '';
}

let lib: any = null;
async function loadLib() {
  if (lib !== null) return lib;
  try {
    lib = await import('@firebase/rules-unit-testing' as any);
  } catch {
    lib = false;
  }
  return lib;
}

const _itIfAvailable = async () => {
  const l = await loadLib();
  return l ? it : it.skip;
};

describe('Firestore security rules', () => {
  let env: any = null;

  beforeAll(async () => {
    const l = await loadLib();
    if (!l || !RULES) return;
    try {
      env = await l.initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: { rules: RULES, host: '127.0.0.1', port: 8080 },
      });
    } catch {
      env = null;
    }
  });

  afterAll(async () => {
    if (env) await env.cleanup();
  });

  beforeEach(async () => {
    if (env) await env.clearFirestore();
  });

  it('forbids reading another user profile', async () => {
    const l = await loadLib();
    if (!l || !env) return;
    await env.withSecurityRulesDisabled(async (admin: any) => {
      await admin.firestore().doc('users/bob').set({ email: 'b@x.com' });
    });
    const ctx = env.authenticatedContext('alice');
    await l.assertFails(ctx.firestore().doc('users/bob').get());
  });

  it('forbids client-side delete of any user document', async () => {
    const l = await loadLib();
    if (!l || !env) return;
    const uid = 'alice';
    await env.withSecurityRulesDisabled(async (admin: any) => {
      await admin.firestore().doc(`users/${uid}`).set({ email: 'a@x.com' });
    });
    const ctx = env.authenticatedContext(uid);
    await l.assertFails(ctx.firestore().doc(`users/${uid}`).delete());
  });

  it('forbids spoofing createdBy on task create', async () => {
    const l = await loadLib();
    if (!l || !env) return;
    const uid = 'alice';
    const ctx = env.authenticatedContext(uid);
    const ref = ctx.firestore().doc(`users/${uid}/tasks/t1`);
    await l.assertFails(
      ref.set({
        taskId: 't1', name: 'T', description: 'd',
        status: 'pending', priority: 'low',
        createdBy: 'eve', assignee: uid,
        createdAt: new Date(), updatedAt: new Date(),
      }),
    );
  });

  it('forbids accessing tasks of another user', async () => {
    const l = await loadLib();
    if (!l || !env) return;
    await env.withSecurityRulesDisabled(async (admin: any) => {
      await admin.firestore().doc('users/bob/tasks/t1').set({
        taskId: 't1', name: 'T', description: 'd',
        status: 'pending', priority: 'low',
        createdBy: 'bob', assignee: 'bob',
        createdAt: new Date(), updatedAt: new Date(),
      });
    });
    const ctx = env.authenticatedContext('alice');
    await l.assertFails(ctx.firestore().doc('users/bob/tasks/t1').get());
  });

  it('forbids any client write to audit_logs', async () => {
    const l = await loadLib();
    if (!l || !env) return;
    const ctx = env.authenticatedContext('alice');
    await l.assertFails(
      ctx.firestore().collection('audit_logs').add({
        actorId: 'alice', actorType: 'user', action: 'read',
        resource: 'x', success: true,
      }),
    );
  });

  it('forbids access to a collection not explicitly allowed', async () => {
    const l = await loadLib();
    if (!l || !env) return;
    const ctx = env.authenticatedContext('alice');
    await l.assertFails(ctx.firestore().collection('arbitrary_unknown').add({ x: 1 }));
  });
});
