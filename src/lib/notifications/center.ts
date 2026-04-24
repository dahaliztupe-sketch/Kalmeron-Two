/**
 * In-app notification center — Firestore-backed.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type NotificationType =
  | 'launch.completed'
  | 'meeting.completed'
  | 'expert.created'
  | 'quota.warning'
  | 'webhook.failed'
  | 'system';

export interface Notification {
  id?: string;
  userId: string;
  workspaceId?: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt?: FirebaseFirestore.Timestamp;
}

const COL = 'notifications';

export async function notify(n: Omit<Notification, 'read' | 'createdAt' | 'id'>) {
  await adminDb.collection(COL).add({
    ...n,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function listNotifications(userId: string, limit = 30) {
  const snap = await adminDb
    .collection(COL)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function unreadCount(userId: string): Promise<number> {
  const snap = await adminDb
    .collection(COL)
    .where('userId', '==', userId)
    .where('read', '==', false)
    .count()
    .get();
  return snap.data().count;
}

export async function markRead(_userId: string, ids: string[]) {
  const batch = adminDb.batch();
  for (const id of ids) {
    const ref = adminDb.collection(COL).doc(id);
    batch.update(ref, { read: true, readAt: FieldValue.serverTimestamp() });
  }
  await batch.commit();
}

export async function markAllRead(userId: string) {
  const snap = await adminDb
    .collection(COL)
    .where('userId', '==', userId)
    .where('read', '==', false)
    .limit(500)
    .get();
  const batch = adminDb.batch();
  snap.docs.forEach((d) => batch.update(d.ref, { read: true, readAt: FieldValue.serverTimestamp() }));
  await batch.commit();
  return snap.size;
}
