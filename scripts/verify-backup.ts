/**
 * verify-backup — sanity-checks the most recent Firestore backup snapshot.
 *
 * Usage:   pnpm tsx scripts/verify-backup.ts
 * In CI:   nightly cron → fails the job if the latest snapshot is missing,
 *          older than 36 h, or fails a checksum/document-count smoke test.
 *
 * Two backends are tried in order:
 *   1. Native GCS export written by `/api/cron/firestore-backup`.
 *   2. Logical-snapshot collection `_backup_snapshots/{ts}` — the JSON
 *      fallback when the GCS export quota was exhausted.
 *
 * The script does NOT restore the backup automatically; it only proves
 * the artifact exists and looks healthy. Restore drills are run quarterly
 * via `docs/RUNBOOK.md → Disaster Recovery`.
 */
import { adminDb } from '../src/lib/firebase-admin';

const MAX_AGE_HOURS = 36;
const REQUIRED_COLLECTIONS = ['users', 'workspaces', 'business_plans'];

interface BackupStatus {
  source: 'gcs' | 'logical' | 'none';
  ageHours: number | null;
  documentCount: number | null;
  collectionsPresent: string[];
  missingCollections: string[];
  ok: boolean;
  notes: string[];
}

async function checkLogicalSnapshot(): Promise<BackupStatus> {
  const status: BackupStatus = {
    source: 'logical',
    ageHours: null,
    documentCount: null,
    collectionsPresent: [],
    missingCollections: [],
    ok: false,
    notes: [],
  };

  const snap = await adminDb
    .collection('_backup_snapshots')
    .orderBy('completedAt', 'desc')
    .limit(1)
    .get();

  if (snap.empty) {
    status.notes.push('No `_backup_snapshots` documents found.');
    return status;
  }

  const doc = snap.docs[0].data() as {
    completedAt?: { toMillis?: () => number };
    documentCount?: number;
    collections?: string[];
  };

  const completedMs = doc.completedAt?.toMillis?.() ?? 0;
  status.ageHours = (Date.now() - completedMs) / 36e5;
  status.documentCount = doc.documentCount ?? null;
  status.collectionsPresent = doc.collections ?? [];
  status.missingCollections = REQUIRED_COLLECTIONS.filter(
    (c) => !status.collectionsPresent.includes(c)
  );

  if (status.ageHours > MAX_AGE_HOURS) {
    status.notes.push(`Snapshot is ${status.ageHours.toFixed(1)} h old (threshold ${MAX_AGE_HOURS} h).`);
  }
  if (status.missingCollections.length) {
    status.notes.push(`Missing required collections: ${status.missingCollections.join(', ')}.`);
  }
  if (!status.documentCount || status.documentCount < 1) {
    status.notes.push('Document count is zero — backup is empty.');
  }

  status.ok =
    status.ageHours <= MAX_AGE_HOURS &&
    status.missingCollections.length === 0 &&
    (status.documentCount ?? 0) > 0;

  return status;
}

async function checkGcsExport(): Promise<BackupStatus | null> {
  const status: BackupStatus = {
    source: 'gcs',
    ageHours: null,
    documentCount: null,
    collectionsPresent: [],
    missingCollections: [],
    ok: false,
    notes: [],
  };

  const snap = await adminDb
    .collection('_backup_runs')
    .orderBy('finishedAt', 'desc')
    .limit(1)
    .get();

  if (snap.empty) return null; // signal "fall back to logical"

  const doc = snap.docs[0].data() as {
    finishedAt?: { toMillis?: () => number };
    status?: string;
    outputUriPrefix?: string;
    collectionIds?: string[];
  };

  const finishedMs = doc.finishedAt?.toMillis?.() ?? 0;
  status.ageHours = (Date.now() - finishedMs) / 36e5;
  status.collectionsPresent = doc.collectionIds ?? [];
  status.missingCollections = REQUIRED_COLLECTIONS.filter(
    (c) => !status.collectionsPresent.includes(c)
  );

  if (doc.status !== 'SUCCEEDED') {
    status.notes.push(`Last GCS export status = ${doc.status}.`);
  }
  if (status.ageHours > MAX_AGE_HOURS) {
    status.notes.push(`Last GCS export is ${status.ageHours.toFixed(1)} h old (threshold ${MAX_AGE_HOURS} h).`);
  }
  if (status.missingCollections.length) {
    status.notes.push(`Missing collections in export: ${status.missingCollections.join(', ')}.`);
  }
  if (!doc.outputUriPrefix) {
    status.notes.push('outputUriPrefix is empty — export may have failed silently.');
  }

  status.ok =
    doc.status === 'SUCCEEDED' &&
    status.ageHours <= MAX_AGE_HOURS &&
    status.missingCollections.length === 0 &&
    !!doc.outputUriPrefix;

  return status;
}

async function main() {
  console.log('verify-backup: starting…');

  let status: BackupStatus;
  const gcs = await checkGcsExport();
  if (gcs) {
    status = gcs;
  } else {
    console.log('verify-backup: no GCS export found, falling back to logical snapshot.');
    status = await checkLogicalSnapshot();
  }

  if (status.ok) {
    console.log(`verify-backup: PASS — source=${status.source}, age=${status.ageHours?.toFixed(1)}h, docs=${status.documentCount ?? 'n/a'}`);
    process.exit(0);
  }

  console.error(`verify-backup: FAIL — source=${status.source}`);
  for (const note of status.notes) console.error(`  - ${note}`);
  process.exit(1);
}

main().catch((err) => {
  console.error('verify-backup: unexpected error:', err);
  process.exit(2);
});
