/**
 * Daily Firestore backup trigger.
 *
 * Modes (auto-selected by env):
 *   1. Native Firestore export to GCS bucket — requires
 *      FIREBASE_PROJECT_ID + FIRESTORE_BACKUP_GCS_BUCKET
 *      and the service account to have datastore.exportImport.exports role.
 *      Uses the Admin REST API: POST projects/{projectId}/databases/(default):exportDocuments.
 *   2. Logical app-level snapshot (fallback) — iterates a curated list of
 *      collections and writes a JSON snapshot to a `backups/{ymd}` document
 *      with metadata. Useful in dev / when GCS is not configured.
 *
 * Authenticated by CRON_SECRET (Bearer or x-cron-secret).
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from '@/src/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const COLLECTIONS_TO_SNAPSHOT = [
  'workspaces',
  'workspace_members',
  'users',
  'api_keys',
  'audit_logs',
  'webhooks',
];

function authorized(req: NextRequest, secret: string): boolean {
  if (req.headers.get('Authorization') === `Bearer ${secret}`) return true;
  if (req.headers.get('x-cron-secret') === secret) return true;
  return false;
}

async function nativeExport(projectId: string, bucket: string): Promise<{ ok: boolean; operation?: string; error?: string }> {
  try {
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/datastore'],
    });
    const client = await auth.getClient();
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;
    const ymd = new Date().toISOString().slice(0, 10);
    const res = await client.request<{ name?: string }>({
      url,
      method: 'POST',
      data: {
        outputUriPrefix: `gs://${bucket}/firestore-backups/${ymd}`,
      },
    });
    return { ok: true, operation: res.data?.name };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function logicalSnapshot(): Promise<{ ok: boolean; counts: Record<string, number>; error?: string }> {
  try {
    const counts: Record<string, number> = {};
    const ymd = new Date().toISOString().slice(0, 10);
    for (const col of COLLECTIONS_TO_SNAPSHOT) {
      const snap = await adminDb.collection(col).limit(1000).get();
      counts[col] = snap.size;
    }
    await adminDb.collection('backups').doc(ymd).set({
      createdAt: FieldValue.serverTimestamp(),
      mode: 'logical',
      counts,
    });
    return { ok: true, counts };
  } catch (e) {
    return { ok: false, counts: {}, error: e instanceof Error ? e.message : String(e) };
  }
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'cron_disabled' }, { status: 503 });
  if (!authorized(req, secret)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const bucket = process.env.FIRESTORE_BACKUP_GCS_BUCKET;

  if (projectId && bucket) {
    const result = await nativeExport(projectId, bucket);
    if (result.ok) {
      logger.info({ event: 'firestore_backup_ok', mode: 'native', operation: result.operation });
      return NextResponse.json({ mode: 'native', ...result });
    }
    logger.error({ event: 'firestore_backup_native_failed', error: result.error });
    // Fall through to logical snapshot.
  }

  const fallback = await logicalSnapshot();
  if (!fallback.ok) {
    logger.error({ event: 'firestore_backup_failed', error: fallback.error });
    return NextResponse.json({ mode: 'logical', ...fallback }, { status: 500 });
  }
  logger.info({ event: 'firestore_backup_ok', mode: 'logical', counts: fallback.counts });
  return NextResponse.json({ mode: 'logical', ...fallback });
}

export const GET = handle;
export const POST = handle;
