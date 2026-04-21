// @ts-nocheck
  /**
   * Task Manager — تتبع حالة المهام في Firestore (مع fallback في الذاكرة عندما لا تتوفر Firestore).
   */
  import crypto from 'crypto';

  export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'awaiting_human';

  export interface TaskRecord {
    taskId: string;
    userId: string;
    description: string;
    status: TaskStatus;
    payload?: any;
    result?: any;
    createdAt: Date;
    updatedAt: Date;
  }

  const memoryStore = new Map<string, TaskRecord>();

  async function getDb(): Promise<any | null> {
    try {
      const mod = await import('@/src/lib/firebase-admin');
      // adminDb may be null if Firebase Admin isn't configured
      return (mod as any).adminDb || null;
    } catch { return null; }
  }

  export async function createTask(input: { userId: string; description: string; payload?: any }): Promise<string> {
    const taskId = crypto.randomUUID();
    const rec: TaskRecord = {
      taskId, userId: input.userId, description: input.description,
      status: 'pending', payload: input.payload,
      createdAt: new Date(), updatedAt: new Date(),
    };
    memoryStore.set(taskId, rec);
    const db = await getDb();
    if (db?.collection) {
      try { await db.collection('tasks').doc(taskId).set(rec); } catch { /* ignore */ }
    }
    return taskId;
  }

  export async function updateTaskStatus(taskId: string, status: TaskStatus, result?: any) {
    const rec = memoryStore.get(taskId);
    if (rec) {
      rec.status = status; rec.updatedAt = new Date();
      if (result !== undefined) rec.result = result;
    }
    const db = await getDb();
    if (db?.collection) {
      try {
        await db.collection('tasks').doc(taskId).update({
          status, updatedAt: new Date(), ...(result !== undefined ? { result } : {}),
        });
      } catch { /* ignore */ }
    }
  }

  export async function getTask(taskId: string): Promise<TaskRecord | null> {
    return memoryStore.get(taskId) || null;
  }

  export async function listTasksForUser(userId: string, limit = 50): Promise<TaskRecord[]> {
    const arr: TaskRecord[] = [];
    for (const t of memoryStore.values()) {
      if (t.userId === userId) arr.push(t);
    }
    return arr.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, limit);
  }
  