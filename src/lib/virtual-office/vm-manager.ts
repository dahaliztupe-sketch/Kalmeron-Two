// @ts-nocheck
/**
 * Virtual Office — VM Manager
 * ---------------------------
 * يوفر لكل وكيل جهازاً افتراضياً آمناً (sandbox) ينفذ فيه مهامه: تصفح الويب،
 * قراءة/كتابة الملفات، إرسال البريد، وجدولة المهام.
 *
 * المزودون المدعومون (بدون مفاتيح، تقع الخدمة في وضع "stub" آمن يسجل الخطأ
 * بدلاً من الفشل الصامت):
 *   - E2B  (E2B_API_KEY)
 *   - Daytona (DAYTONA_API_KEY + DAYTONA_API_URL)
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type VMProvider = 'e2b' | 'daytona' | 'stub';
export type VMStatus = 'provisioning' | 'running' | 'idle' | 'terminated' | 'error';

export interface VMRecord {
  id?: string;
  agentId: string;
  departmentId: string;
  provider: VMProvider;
  providerSandboxId?: string;
  status: VMStatus;
  lastError?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface VMTask {
  kind: 'shell' | 'browse' | 'email' | 'fs-read' | 'fs-write' | 'custom';
  payload: Record<string, unknown>;
}

export interface VMTaskResult {
  ok: boolean;
  output?: unknown;
  error?: string;
  durationMs: number;
}

const COLL = 'virtual_office_vms';
const TASKS_COLL = 'virtual_office_tasks';

function detectProvider(): VMProvider {
  if (process.env.E2B_API_KEY) return 'e2b';
  if (process.env.DAYTONA_API_KEY && process.env.DAYTONA_API_URL) return 'daytona';
  return 'stub';
}

/** تنشئ جهازاً افتراضياً جديداً للوكيل إن لم يكن لديه واحد فعّال. */
export async function provisionVM(agentId: string, departmentId: string): Promise<VMRecord> {
  const existing = await adminDb
    .collection(COLL)
    .where('agentId', '==', agentId)
    .where('status', 'in', ['running', 'idle', 'provisioning'])
    .limit(1)
    .get();
  if (!existing.empty) {
    const doc = existing.docs[0];
    return { id: doc.id, ...(doc.data() as VMRecord) };
  }

  const provider = detectProvider();
  const base: VMRecord = {
    agentId,
    departmentId,
    provider,
    status: 'provisioning',
    createdAt: FieldValue.serverTimestamp() as unknown,
    updatedAt: FieldValue.serverTimestamp() as unknown,
  };
  const ref = await adminDb.collection(COLL).add(base);

  try {
    let providerSandboxId: string | undefined;
    if (provider === 'e2b') {
      providerSandboxId = await e2bCreate();
    } else if (provider === 'daytona') {
      providerSandboxId = await daytonaCreate();
    } else {
      providerSandboxId = `stub-${ref.id}`;
    }
    await ref.update({
      providerSandboxId,
      status: 'running',
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ...base, id: ref.id, providerSandboxId, status: 'running' };
  } catch (err: unknown) {
    await ref.update({
      status: 'error',
      lastError: err?.message || String(err),
      updatedAt: FieldValue.serverTimestamp(),
    });
    throw err;
  }
}

/** تسترجع معرف الجهاز الافتراضي الحالي للوكيل (أو null إن لم يوجد). */
export async function getAgentVM(agentId: string): Promise<VMRecord | null> {
  const snap = await adminDb
    .collection(COLL)
    .where('agentId', '==', agentId)
    .where('status', 'in', ['running', 'idle'])
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as VMRecord) };
}

/** ترسل مهمة للتنفيذ داخل الـ VM مع مهلة زمنية. */
export async function runTaskOnVM(
  vmId: string,
  task: VMTask,
  timeoutMs = 60_000
): Promise<VMTaskResult> {
  const start = Date.now();
  const vmSnap = await adminDb.collection(COLL).doc(vmId).get();
  if (!vmSnap.exists) {
    return { ok: false, error: 'VM not found', durationMs: Date.now() - start };
  }
  const vm = vmSnap.data() as VMRecord;

  const exec = async (): Promise<VMTaskResult> => {
    try {
      let output: unknown;
      if (vm.provider === 'e2b') {
        output = await e2bExec(vm.providerSandboxId!, task);
      } else if (vm.provider === 'daytona') {
        output = await daytonaExec(vm.providerSandboxId!, task);
      } else {
        output = { stubbed: true, echoed: task };
      }
      return { ok: true, output, durationMs: Date.now() - start };
    } catch (err: unknown) {
      return { ok: false, error: err?.message || String(err), durationMs: Date.now() - start };
    }
  };

  const timeoutPromise: Promise<VMTaskResult> = new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          ok: false,
          error: `Task exceeded timeout of ${timeoutMs}ms`,
          durationMs: Date.now() - start,
        }),
      timeoutMs
    )
  );

  const result = await Promise.race([exec(), timeoutPromise]);

  await adminDb.collection(TASKS_COLL).add({
    vmId,
    agentId: vm.agentId,
    task,
    result,
    createdAt: FieldValue.serverTimestamp(),
  });

  return result;
}

/** تجدول مهمة للتنفيذ في وقت مستقبلي (يُنفذها worker دوري عند حلول الوقت). */
export async function scheduleTaskOnVM(
  vmId: string,
  task: VMTask,
  scheduledTime: Date
): Promise<string> {
  const ref = await adminDb.collection(TASKS_COLL).add({
    vmId,
    task,
    status: 'scheduled',
    scheduledAt: Timestamp.fromDate(scheduledTime),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

// ---------- providers ----------

async function e2bCreate(): Promise<string> {
  const res = await fetch('https://api.e2b.dev/sandboxes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.E2B_API_KEY!,
    },
    body: JSON.stringify({ template: 'base' }),
  });
  if (!res.ok) throw new Error(`E2B create failed: ${res.status}`);
  const data = await res.json();
  return data.sandboxId || data.id;
}

async function e2bExec(sandboxId: string, task: VMTask): Promise<unknown> {
  const res = await fetch(`https://api.e2b.dev/sandboxes/${sandboxId}/commands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.E2B_API_KEY!,
    },
    body: JSON.stringify({ kind: task.kind, payload: task.payload }),
  });
  if (!res.ok) throw new Error(`E2B exec failed: ${res.status}`);
  return res.json();
}

async function daytonaCreate(): Promise<string> {
  const res = await fetch(`${process.env.DAYTONA_API_URL}/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAYTONA_API_KEY}`,
    },
    body: JSON.stringify({ name: `agent-${Date.now()}` }),
  });
  if (!res.ok) throw new Error(`Daytona create failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

async function daytonaExec(workspaceId: string, task: VMTask): Promise<unknown> {
  const res = await fetch(`${process.env.DAYTONA_API_URL}/workspaces/${workspaceId}/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAYTONA_API_KEY}`,
    },
    body: JSON.stringify({ kind: task.kind, payload: task.payload }),
  });
  if (!res.ok) throw new Error(`Daytona exec failed: ${res.status}`);
  return res.json();
}
