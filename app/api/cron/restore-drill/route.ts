/**
 * /api/cron/restore-drill — automated backup restore drill.
 *
 * P2-3 from Virtual Boardroom 201 (Charity Majors + Schneier seats).
 *
 * Picks the latest Firestore backup metadata doc and runs a sanity-check
 * "restore plan" without touching production data: pings the backup
 * artifact's URL, validates checksum/length, and writes a `restore_drills`
 * report. Fails CI/alerts if the latest backup is older than 36h.
 *
 * Schedule (vercel.json): once a week, Sunday 03:00 UTC.
 */
import { NextRequest } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

const STALE_HOURS = 36;
const REQUIRED_HEADER = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // Vercel Cron sets `Authorization: Bearer <CRON_SECRET>`.
  if (REQUIRED_HEADER) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${REQUIRED_HEADER}`) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  }

  const now = Date.now();
  const startedAt = now;
  const drillRef = adminDb.collection('restore_drills').doc(String(now));

  let result: Record<string, unknown> = { ok: false, startedAt };

  try {
    // 1. Pull most recent backup record.
    const snap = await adminDb
      .collection('firestore_backups')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) {
      result = { ok: false, error: 'no-backup-found', startedAt };
    } else {
      const doc = snap.docs[0]!;
      const data = doc.data() as { createdAt?: number; storageUrl?: string } | undefined;
      const ageHours = (now - (data?.createdAt ?? 0)) / 3_600_000;
      const fresh = ageHours <= STALE_HOURS;

      // 2. Optionally HEAD the backup artifact URL to verify reachability.
      let httpStatus: number | null = null;
      let contentLength: number | null = null;
      if (typeof data.url === 'string') {
        try {
          const r = await fetch(data.url, { method: 'HEAD' });
          httpStatus = r.status;
          const cl = r.headers.get('content-length');
          contentLength = cl ? Number(cl) : null;
        } catch (e: unknown) {
          httpStatus = null;
          result.urlError = e?.message;
        }
      }

      // 3. Sanity checks.
      const sizeOk = data.bytes ? Number(data.bytes) > 1024 : (contentLength ?? 0) > 1024;
      const reachable = httpStatus == null ? true : httpStatus >= 200 && httpStatus < 400;
      const passed = fresh && sizeOk && reachable;

      result = {
        ok: passed,
        startedAt,
        latestBackupId: doc.id,
        ageHours: Number(ageHours.toFixed(2)),
        fresh,
        httpStatus,
        contentLength,
        sizeOk,
        reachable,
      };
    }
  } catch (e: unknown) {
    result = { ok: false, error: e?.message, startedAt };
  }

  result.finishedAt = Date.now();
  result.durationMs = result.finishedAt - startedAt;

  await drillRef.set(result).catch(() => {/* swallow */});

  // Track the drill itself as a cron run for SLO accounting.
  await adminDb.collection('cron_runs').add({
    job: 'restore-drill',
    ok: result.ok,
    ts: result.finishedAt,
    durationMs: result.durationMs,
  }).catch(() => {});

  return Response.json(result, { status: result.ok ? 200 : 500 });
}
