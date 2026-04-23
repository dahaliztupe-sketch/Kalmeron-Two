// @ts-nocheck
/**
 * OKR Store — قراءة/كتابة OKRs في Firestore (collection: okrs).
 */
import { adminDb } from '@/src/lib/firebase-admin';

export type OKRPeriod = 'weekly' | 'monthly';
export type OKRStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface KeyResult {
  description: string;
  target: number;
  current: number;
  unit: string;
}

export interface OKR {
  id?: string;
  userId: string;
  period: OKRPeriod;
  startDate: Date | string;
  endDate: Date | string;
  department: string;
  objective: string;
  keyResults: KeyResult[];
  status: OKRStatus;
  agentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function col() { return adminDb.collection('okrs'); }

export async function createOKR(o: OKR): Promise<OKR> {
  const ref = await col().add({
    ...o,
    status: o.status || 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { ...o, id: ref.id };
}

export async function listOKRs(userId: string, opts: { period?: OKRPeriod; department?: string; limit?: number } = {}) {
  let q: any = col().where('userId', '==', userId);
  if (opts.period) q = q.where('period', '==', opts.period);
  if (opts.department) q = q.where('department', '==', opts.department);
  q = q.orderBy('createdAt', 'desc').limit(opts.limit || 50);
  const snap = await q.get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function listCurrentWeekOKRs(userId: string) {
  const start = startOfWeek(new Date());
  const snap = await col()
    .where('userId', '==', userId)
    .where('period', '==', 'weekly')
    .get();
  return snap.docs
    .map((d: any) => ({ id: d.id, ...d.data() }))
    .filter((o: any) => {
      const sd = toDate(o.startDate);
      return sd && sd >= start;
    });
}

export async function updateOKRProgress(okrId: string, krIndex: number, current: number) {
  const ref = col().doc(okrId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('okr_not_found');
  const data: any = snap.data();
  const krs = [...(data.keyResults || [])];
  if (!krs[krIndex]) throw new Error('kr_index_out_of_range');
  krs[krIndex] = { ...krs[krIndex], current };
  const allDone = krs.every((k: KeyResult) => (k.current || 0) >= (k.target || 1));
  const status: OKRStatus = allDone ? 'completed' : 'in_progress';
  await ref.update({ keyResults: krs, status, updatedAt: new Date() });
  return { id: okrId, keyResults: krs, status };
}

export async function getOKR(okrId: string) {
  const snap = await col().doc(okrId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // Sunday = 0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

function toDate(v: any): Date | null {
  if (!v) return null;
  if (v.toDate) return v.toDate();
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
