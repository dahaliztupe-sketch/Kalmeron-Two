/**
 * POST /api/delegate
 * ─────────────────────────────────────────────────────────────────────────────
 * يُتيح للمديرين التنفيذيين (C-Suite) تفويض المهام إلى مرؤوسيهم المباشرين،
 * مما يُشكّل سلاسل تعاون حقيقية متعددة الوكلاء.
 *
 * Request Body:
 * {
 *   "delegatorRole": "CFO",           // الدور المُفوِّض (CEO | CFO | COO | CMO | CTO | CLO | CHRO | CSO)
 *   "task": "حلل التدفق النقدي للربع الثالث وقدّم توصيات لخفض معدل الحرق",
 *   "targetAgentId": "cash-runway",   // (اختياري) تحديد مُباشر للمرؤوس
 *   "context": { "quarter": "Q3" },   // (اختياري) سياق إضافي
 *   "allowSubDelegation": false        // (اختياري) السماح بإعادة التفويض
 * }
 *
 * Response:
 * {
 *   "output": "...",                   // نتيجة المهمة
 *   "delegationChain": [...],          // سلسلة التفويض
 *   "traceId": "dlg_...",
 *   "executedByAgent": "cash-runway",
 *   "initiatedByRole": "CFO",
 *   "totalLatencyMs": 3200
 * }
 *
 * GET /api/delegate?role=CFO
 * يُعيد قائمة المرؤوسين المباشرين للدور المحدد، أو الهيكل التنظيمي الكامل.
 *
 * SECURITY:
 *   - يتطلب Firebase ID token في Authorization: Bearer
 *   - rate limit: 10 طلبات/دقيقة لكل مستخدم (التفويض مكلف — يُطلق سلاسل وكلاء)
 *   - حقن الـ userId من التوكن لا من الجسم
 *   - التحقق من صلاحية التفويض عبر `validateDelegationAuthority`
 *   - تنظيف المدخلات من PII قبل إرسالها للـ LLM
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitAgent, rateLimitResponse } from '@/src/lib/security/rate-limit';
import { createRequestLogger } from '@/src/lib/logger';
import {
  delegateTask,
  validateDelegationAuthority,
  getDirectReports,
  getDelegationOrgChart,
} from '@/src/ai/organization/delegation/engine';
import { ENTERPRISE_EXECUTIVES } from '@/src/ai/organization/enterprise/hierarchy';
import type { ExecutiveRole } from '@/src/ai/organization/enterprise/hierarchy';
import xss from 'xss';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** أدوار C-Suite المدعومة (literal tuple لـ Zod). */
const EXECUTIVE_ROLES_TUPLE = [
  'CEO', 'CFO', 'COO', 'CMO', 'CTO', 'CLO', 'CHRO', 'CSO',
] as const satisfies readonly ExecutiveRole[];

/** للاستخدام العام (Array). */
const EXECUTIVE_ROLES: ExecutiveRole[] = [...EXECUTIVE_ROLES_TUPLE];

/** Schema جسم الطلب. */
const DelegateBodySchema = z.object({
  /** الدور التنفيذي المُفوِّض. */
  delegatorRole: z.enum(EXECUTIVE_ROLES_TUPLE, {
    error: `delegatorRole يجب أن يكون أحد: ${EXECUTIVE_ROLES.join(', ')}`,
  }),
  /** وصف المهمة (2–2000 حرف). */
  task: z.string().min(2).max(2000),
  /** (اختياري) معرّف وكيل مُحدد من المرؤوسين. */
  targetAgentId: z.string().min(1).max(64).optional(),
  /** (اختياري) سياق إضافي للمهمة. */
  context: z.record(z.string(), z.unknown()).optional(),
  /**
   * (اختياري) هل يُسمح للوكيل المستقبِل بإعادة التفويض؟
   * يُتيح سلاسل متعددة المستويات (مثال: CEO → CFO → budget-analyst).
   * افتراضي: false لإبقاء التحكم والتكلفة تحت السيطرة.
   */
  allowSubDelegation: z.boolean().optional().default(false),
});

/** ─── POST /api/delegate ─── */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const log = createRequestLogger(requestId);

  // 1. Rate limit per-IP (حد مبدئي لردع الإساءة قبل التحقق)
  const ipRl = rateLimit(req, { limit: 15, windowMs: 60_000 });
  if (!ipRl.success) return rateLimitResponse();

  // 2. Auth — Firebase ID token إلزامي
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized', message: 'Authorization: Bearer <token> مطلوب' }, { status: 401 });
  }
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7).trim());
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token', message: 'التوكن غير صالح أو منتهي الصلاحية' }, { status: 401 });
  }

  // 3. Rate limit per-user (التفويض مكلف — يُطلق سلسلة وكلاء)
  const userRl = rateLimitAgent(userId, 'delegate', { limit: 10, windowMs: 60_000 });
  if (!userRl.allowed) return rateLimitResponse();

  // 4. Parse + validate body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = DelegateBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { delegatorRole, task, targetAgentId, context, allowSubDelegation } = parsed.data;

  // 5. تنظيف المدخلات من XSS
  const cleanTask = xss(task);

  // 6. التحقق من صلاحية التفويض إذا كان الهدف محدداً
  if (targetAgentId) {
    const authCheck = validateDelegationAuthority(delegatorRole, targetAgentId);
    if (!authCheck.valid) {
      return NextResponse.json(
        {
          error: 'delegation_unauthorized',
          message: authCheck.reason,
          availableReports: ENTERPRISE_EXECUTIVES[delegatorRole]?.directReports ?? [],
        },
        { status: 403 },
      );
    }
  }

  // 7. تنفيذ سلسلة التفويض
  log.info({ delegatorRole, targetAgentId, userId, allowSubDelegation }, 'delegation_started');

  try {
    const result = await delegateTask({
      delegatorRole,
      task: cleanTask,
      targetAgentId,
      context,
      allowSubDelegation,
      userId,
    });

    log.info(
      {
        traceId: result.traceId,
        executedBy: result.executedByAgent,
        hops: result.delegationChain.length,
        latencyMs: result.totalLatencyMs,
      },
      'delegation_completed',
    );

    return NextResponse.json(
      {
        output: result.output,
        delegationChain: result.delegationChain,
        traceId: result.traceId,
        executedByAgent: result.executedByAgent,
        initiatedByRole: result.initiatedByRole,
        totalLatencyMs: result.totalLatencyMs,
        meta: {
          hops: result.delegationChain.length,
          allowSubDelegation,
        },
      },
      { headers: { 'X-Request-ID': requestId, 'X-Trace-ID': result.traceId } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'خطأ غير متوقع';
    log.error({ err: error, userId, delegatorRole }, 'delegation_failed');

    // إذا كان الخطأ بسبب صلاحية التفويض نُعيد 403
    if (msg.includes('ليس مرؤوساً مباشراً')) {
      return NextResponse.json({ error: 'delegation_unauthorized', message: msg }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'delegation_failed', message: msg },
      { status: 500, headers: { 'X-Request-ID': requestId } },
    );
  }
}

/** ─── GET /api/delegate ─── */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const role = searchParams.get('role') as ExecutiveRole | null;

  // Soft auth — يُعيد البيانات للجميع لكن يُسجِّل الاستخدام
  const authHeader = req.headers.get('Authorization');
  let userId = 'guest';
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.slice(7).trim());
      userId = decoded.uid;
    } catch {
      /* نتابع كـ guest */
    }
  }

  // Rate limit خفيف للـ GET
  const ipRl = rateLimit(req, { limit: 30, windowMs: 60_000, userId });
  if (!ipRl.success) return rateLimitResponse();

  // إذا طُلب دور محدد → إعادة مرؤوسيه فقط
  if (role) {
    const exec = ENTERPRISE_EXECUTIVES[role];
    if (!exec) {
      return NextResponse.json(
        { error: 'role_not_found', availableRoles: EXECUTIVE_ROLES },
        { status: 404 },
      );
    }
    const reports = getDirectReports(role);
    return NextResponse.json({
      role,
      nameAr: exec.nameAr,
      titleAr: exec.titleAr,
      agentId: exec.agentId,
      mandate: exec.mandate,
      directReports: reports,
      escalatesTo: exec.escalatesTo,
    });
  }

  // بدون دور → إعادة الهيكل التنظيمي الكامل
  return NextResponse.json({
    orgChart: getDelegationOrgChart(),
    totalExecutives: EXECUTIVE_ROLES.length,
    availableRoles: EXECUTIVE_ROLES,
  });
}
