/**
 * Company Builder — Engine (Firestore CRUD)
 * ─────────────────────────────────────────────────────────────────────────────
 * يُدير دورة حياة الشركات الافتراضية:
 *   - إنشاء شركة جديدة من preset أو من الصفر
 *   - قراءة / تحديث / حذف الشركة
 *   - إضافة / إزالة موظفين
 *   - إنشاء مهام وتحديث حالتها
 *   - فهرسة سريعة بـ ownerUid
 *
 * Firestore Schema:
 *   companies/{companyId}                  — وثيقة الشركة
 *   companies/{companyId}/tasks/{taskId}   — مهام الشركة (sub-collection)
 */

import { adminDb } from '@/src/lib/firebase-admin';
import { nanoid } from 'nanoid';
import { getPreset } from './presets';
import type {
  Company,
  CompanyTask,
  CreateCompanyRequest,
  VirtualEmployee,
  CompanyDepartment,
  CompanyStage,
  TaskStatus,
  TaskPriority,
} from './types';

// ─── مسارات Firestore ─────────────────────────────────────────────────────────

const COL = 'companies';
const taskSubCol = (companyId: string) => adminDb.collection(COL).doc(companyId).collection('tasks');

// ─── إنشاء شركة ──────────────────────────────────────────────────────────────

export async function createCompany(
  ownerUid: string,
  req: CreateCompanyRequest,
): Promise<Company> {
  const companyId = `co_${nanoid(12)}`;
  const now = new Date();

  const preset = req.usePreset ? getPreset(req.usePreset) : null;

  // بناء الأقسام والموظفين من الـ preset أو خالية إذا كانت مخصصة
  const departments: CompanyDepartment[] = (preset?.departments ?? []).map(d => ({
    ...d,
    employeeIds: d.employeeIds,
  }));

  const employees: VirtualEmployee[] = (preset?.employees ?? []).map(e => ({
    ...e,
    status: 'active' as const,
    joinedAt: now,
  }));

  const company: Company = {
    id: companyId,
    ownerUid,
    name: req.name,
    nameAr: req.name,
    description: req.description,
    type: req.type,
    typeNameAr: preset?.nameAr ?? req.type,
    stage: req.stage ?? 'early',
    industry: req.industry ?? '',
    country: req.country ?? 'EG',
    currency: req.currency ?? preset?.defaultCurrency ?? 'EGP',
    departments,
    employees,
    logo: req.logo ?? preset?.icon ?? '🏢',
    brandColor: req.brandColor ?? preset?.color ?? '#6366f1',
    values: preset?.suggestedValues ?? [],
    currentOkrs: preset?.suggestedOkrs ?? [],
    tasksCompleted: 0,
    createdAt: now,
    lastActiveAt: now,
    isActive: true,
  };

  await adminDb.collection(COL).doc(companyId).set(serializeCompany(company));
  return company;
}

// ─── قراءة شركة ──────────────────────────────────────────────────────────────

export async function getCompany(companyId: string): Promise<Company | null> {
  const snap = await adminDb.collection(COL).doc(companyId).get();
  if (!snap.exists) return null;
  return deserializeCompany(snap.data()!);
}

export async function listCompaniesByOwner(ownerUid: string): Promise<Company[]> {
  const snap = await adminDb.collection(COL)
    .where('ownerUid', '==', ownerUid)
    .where('isActive', '==', true)
    .orderBy('lastActiveAt', 'desc')
    .limit(50)
    .get();
  return snap.docs.map(d => deserializeCompany(d.data()));
}

// ─── تحديث شركة ──────────────────────────────────────────────────────────────

export async function updateCompany(
  companyId: string,
  updates: Partial<Pick<Company, 'name' | 'description' | 'stage' | 'values' | 'currentOkrs' | 'brandColor' | 'logo'>>,
): Promise<void> {
  await adminDb.collection(COL).doc(companyId).update({
    ...updates,
    lastActiveAt: new Date().toISOString(),
  });
}

export async function deleteCompany(companyId: string): Promise<void> {
  await adminDb.collection(COL).doc(companyId).update({ isActive: false });
}

// ─── إضافة موظف ──────────────────────────────────────────────────────────────

export async function addEmployee(
  companyId: string,
  employee: Omit<VirtualEmployee, 'joinedAt' | 'status' | 'currentTaskId'>,
): Promise<VirtualEmployee> {
  const now = new Date();
  const newEmp: VirtualEmployee = { ...employee, status: 'active', joinedAt: now };

  const { FieldValue } = await import('firebase-admin/firestore');
  await adminDb.collection(COL).doc(companyId).update({
    employees: FieldValue.arrayUnion(serializeEmployee(newEmp)),
    lastActiveAt: now.toISOString(),
  });

  return newEmp;
}

// ─── إنشاء مهمة ──────────────────────────────────────────────────────────────

export async function createTask(
  companyId: string,
  data: {
    title: string;
    description: string;
    involvedDepartments: string[];
    assignedTo?: string;
    delegatedBy?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    requiresHumanReview?: boolean;
  },
): Promise<CompanyTask> {
  const taskId = `task_${nanoid(10)}`;
  const now = new Date();

  const task: CompanyTask = {
    id: taskId,
    companyId,
    title: data.title,
    description: data.description,
    involvedDepartments: data.involvedDepartments,
    assignedTo: data.assignedTo ?? null,
    delegatedBy: data.delegatedBy ?? null,
    status: 'pending',
    priority: data.priority ?? 'medium',
    createdAt: now,
    updatedAt: now,
    dueDate: data.dueDate,
    requiresHumanReview: data.requiresHumanReview ?? false,
  };

  await taskSubCol(companyId).doc(taskId).set(serializeTask(task));
  await adminDb.collection(COL).doc(companyId).update({ lastActiveAt: now.toISOString() });
  return task;
}

// ─── تحديث حالة مهمة ─────────────────────────────────────────────────────────

export async function updateTaskStatus(
  companyId: string,
  taskId: string,
  updates: {
    status?: TaskStatus;
    output?: string;
    traceId?: string;
    delegationChain?: CompanyTask['delegationChain'];
    assignedTo?: string;
    reviewNotes?: string;
  },
): Promise<void> {
  const now = new Date();
  const payload: Record<string, unknown> = { ...updates, updatedAt: now.toISOString() };

  await taskSubCol(companyId).doc(taskId).update(payload);

  if (updates.status === 'completed') {
    const { FieldValue } = await import('firebase-admin/firestore');
    await adminDb.collection(COL).doc(companyId).update({
      tasksCompleted: FieldValue.increment(1),
      lastActiveAt: now.toISOString(),
    });
  }
}

// ─── قراءة مهام الشركة ──────────────────────────────────────────────────────

export async function listTasks(
  companyId: string,
  opts?: { status?: TaskStatus; limit?: number },
): Promise<CompanyTask[]> {
  let q = taskSubCol(companyId).orderBy('createdAt', 'desc').limit(opts?.limit ?? 20);
  if (opts?.status) q = q.where('status', '==', opts.status) as typeof q;
  const snap = await q.get();
  return snap.docs.map(d => deserializeTask(d.data()));
}

// ─── Serialize / Deserialize ──────────────────────────────────────────────────

function serializeCompany(c: Company): Record<string, unknown> {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    lastActiveAt: c.lastActiveAt.toISOString(),
    employees: c.employees.map(serializeEmployee),
  };
}

function deserializeCompany(data: Record<string, unknown>): Company {
  return {
    ...(data as unknown as Company),
    createdAt: new Date(data.createdAt as string),
    lastActiveAt: new Date(data.lastActiveAt as string),
    employees: ((data.employees as unknown[]) ?? []).map(e => deserializeEmployee(e as Record<string, unknown>)),
    departments: (data.departments as CompanyDepartment[]) ?? [],
    stage: (data.stage as CompanyStage) ?? 'early',
  };
}

function serializeEmployee(e: VirtualEmployee): Record<string, unknown> {
  return { ...e, joinedAt: e.joinedAt.toISOString() };
}

function deserializeEmployee(data: Record<string, unknown>): VirtualEmployee {
  return { ...(data as unknown as VirtualEmployee), joinedAt: new Date(data.joinedAt as string) };
}

function serializeTask(t: CompanyTask): Record<string, unknown> {
  return {
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    dueDate: t.dueDate?.toISOString() ?? null,
  };
}

function deserializeTask(data: Record<string, unknown>): CompanyTask {
  return {
    ...(data as unknown as CompanyTask),
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
    dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
  };
}
