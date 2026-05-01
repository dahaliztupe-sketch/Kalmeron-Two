/**
 * POST /api/company/[id]/tasks   — إنشاء مهمة جديدة (single or cross-dept)
 * GET  /api/company/[id]/tasks   — قائمة مهام الشركة
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { getCompany, createTask, listTasks, updateTaskStatus } from '@/src/lib/company-builder/engine';
import { routeCrossDeptTask } from '@/src/ai/organization/cross-dept/router';

async function authenticate(req: NextRequest): Promise<string> {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');
  const decoded = await adminAuth.verifyIdToken(h.slice(7));
  return decoded.uid;
}

const CreateTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(2000),
  involvedDepartments: z.array(z.string()).min(1).max(6),
  assignedTo: z.string().optional(),
  delegatedBy: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  requiresHumanReview: z.boolean().optional(),
  /** إذا true سيُشغَّل الـ cross-dept router تلقائياً */
  autoExecute: z.boolean().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;
  try { userId = await authenticate(req); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const company = await getCompany(params.id);
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  if (company.ownerUid !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { autoExecute, ...taskData } = parsed.data;

  // إنشاء المهمة
  const task = await createTask(params.id, taskData);

  if (autoExecute && parsed.data.involvedDepartments.length > 1) {
    // تشغيل cross-dept router بشكل غير متزامن
    updateTaskStatus(params.id, task.id, { status: 'in_progress' }).catch(() => null);

    routeCrossDeptTask(company, task, userId)
      .then(result =>
        updateTaskStatus(params.id, task.id, {
          status: 'completed',
          output: result.synthesizedOutput,
          traceId: result.traceId,
        }),
      )
      .catch(err =>
        updateTaskStatus(params.id, task.id, {
          status: 'failed',
          output: err instanceof Error ? err.message : 'خطأ غير معروف',
        }),
      );

    return NextResponse.json({ task, crossDeptStarted: true, message: 'المهمة قيد التنفيذ' }, { status: 202 });
  }

  return NextResponse.json({ task }, { status: 201 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;
  try { userId = await authenticate(req); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const company = await getCompany(params.id);
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  if (company.ownerUid !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const status = req.nextUrl.searchParams.get('status') as Parameters<typeof listTasks>[1] extends {status?: infer S} ? S : undefined;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20');

  const tasks = await listTasks(params.id, { status, limit });
  return NextResponse.json({ tasks });
}
