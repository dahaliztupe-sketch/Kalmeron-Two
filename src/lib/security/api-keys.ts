/**
 * API keys (Personal Access Tokens) — scoped, hashed, revocable.
 * Raw key format:  kal_live_<24-char-random>
 * Stored as SHA-256 hash; raw key is shown to the user only once on creation.
 */
import crypto from 'crypto';
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const COL = 'api_keys';
const PREFIX = 'kal_live_';

export interface ApiKeyRecord {
  id: string;
  ownerId: string;
  workspaceId: string;
  name: string;
  hash: string;
  prefix: string;
  scopes: string[];
  lastUsedAt?: FirebaseFirestore.Timestamp | null;
  createdAt?: FirebaseFirestore.Timestamp;
  revokedAt?: FirebaseFirestore.Timestamp | null;
}

function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export function generateKey(): { raw: string; prefix: string; hash: string } {
  const rand = crypto.randomBytes(18).toString('base64url').slice(0, 24);
  const raw = `${PREFIX}${rand}`;
  return { raw, prefix: raw.slice(0, 12), hash: sha256(raw) };
}

export async function createApiKey(args: {
  ownerId: string;
  workspaceId: string;
  name: string;
  scopes: string[];
}): Promise<{ id: string; raw: string; prefix: string }> {
  const { raw, prefix, hash } = generateKey();
  const ref = await adminDb.collection(COL).add({
    ownerId: args.ownerId,
    workspaceId: args.workspaceId,
    name: args.name,
    scopes: args.scopes,
    hash,
    prefix,
    createdAt: FieldValue.serverTimestamp(),
    revokedAt: null,
    lastUsedAt: null,
  });
  return { id: ref.id, raw, prefix };
}

export async function listApiKeys(workspaceId: string, ownerId: string) {
  const snap = await adminDb
    .collection(COL)
    .where('workspaceId', '==', workspaceId)
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as Partial<ApiKeyRecord>;
    return {
      id: d.id,
      name: data.name ?? '',
      prefix: data.prefix ?? '',
      scopes: data.scopes ?? [],
      createdAt: data.createdAt?.toMillis?.() ?? null,
      lastUsedAt: data.lastUsedAt?.toMillis?.() ?? null,
      revoked: !!data.revokedAt,
    };
  });
}

export async function revokeApiKey(id: string, ownerId: string): Promise<boolean> {
  const ref = adminDb.collection(COL).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  const data = doc.data() as Partial<ApiKeyRecord> | undefined;
  if (!data || data.ownerId !== ownerId) return false;
  await ref.update({ revokedAt: FieldValue.serverTimestamp() });
  return true;
}

export async function verifyApiKey(raw: string): Promise<{
  ok: boolean;
  ownerId?: string;
  workspaceId?: string;
  scopes?: string[];
  id?: string;
}> {
  if (!raw || !raw.startsWith(PREFIX)) return { ok: false };
  const hash = sha256(raw);
  const snap = await adminDb.collection(COL).where('hash', '==', hash).limit(1).get();
  if (snap.empty) return { ok: false };
  const doc = snap.docs[0];
  if (!doc) return { ok: false };
  const data = doc.data() as Partial<ApiKeyRecord> | undefined;
  if (!data || data.revokedAt) return { ok: false };
  // fire-and-forget touch
  doc.ref.update({ lastUsedAt: FieldValue.serverTimestamp() }).catch(() => {});
  return {
    ok: true,
    ownerId: data.ownerId,
    workspaceId: data.workspaceId,
    scopes: data.scopes ?? [],
    id: doc.id,
  };
}
