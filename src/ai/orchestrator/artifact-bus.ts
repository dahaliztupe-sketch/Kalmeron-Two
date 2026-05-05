/**
 * Artifact Bus — نظام ملفات/قطع مشترك في الوقت الفعلي.
 * Firestore collection: artifacts.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import type { Query } from 'firebase-admin/firestore';

export interface Artifact {
  id?: string;
  userId: string;
  producerAgent: string;
  type: string; // 'doc', 'plan', 'report', 'leads_csv', ...
  name: string;
  content: unknown; // serialisable
  refs?: string[]; // related artifact ids
  createdAt?: Date;
}

const col = () => adminDb.collection('artifacts');

export async function publishArtifact(a: Omit<Artifact, 'id' | 'createdAt'>) {
  const ref = await col().add({ ...a, createdAt: new Date() });
  return { id: ref.id, ...a };
}

export async function listArtifacts(userId: string, type?: string, limit = 50) {
  let q: Query = col().where('userId', '==', userId);
  if (type) q = q.where('type', '==', type);
  q = q.orderBy('createdAt', 'desc').limit(limit);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getArtifact(artifactId: string) {
  const snap = await col().doc(artifactId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}
