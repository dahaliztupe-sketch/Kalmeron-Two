// @ts-nocheck
/**
 * Agent Governance — بوابة سياسات للإجراءات الحساسة.
 * يجب أن تستدعى قبل تنفيذ أي أداة محتملة الخطر.
 * تحقق من قائمة الأدوات الحساسة وتطلب موافقة بشرية صريحة (HITL) عند الحاجة.
 */
import { adminDb } from '@/src/lib/firebase-admin';

export type ActionRisk = 'low' | 'medium' | 'high' | 'critical';

const HIGH_RISK_TOOLS = new Set([
  'send_email', 'send_whatsapp', 'send_telegram',
  'create_meta_campaign', 'optimize_campaign_budget',
  'make_call', 'send_email_sequence',
  'create_invoice', 'reconcile_accounts',
  'run_payroll', 'onboard_employee',
  'deploy_app', 'iterate_on_feedback',
  'hire_freelancer', 'post_job',
  'open_application', 'click_on_element', 'type_text',
]);

const CRITICAL_TOOLS = new Set([
  'run_payroll', 'reconcile_accounts', 'deploy_app',
  'hire_freelancer', 'create_meta_campaign',
]);

export function classifyAction(toolName: string): ActionRisk {
  if (CRITICAL_TOOLS.has(toolName)) return 'critical';
  if (HIGH_RISK_TOOLS.has(toolName)) return 'high';
  return 'low';
}

export interface GovernanceDecision {
  allowed: boolean;
  requiresApproval: boolean;
  approvalId?: string;
  reason?: string;
}

export interface PolicyContext {
  userId: string;
  agentId: string;
  toolName: string;
  args: any;
  /** أعلى من 0 يعني الوكيل يعمل بدرجة استقلالية أعلى. */
  autonomyLevel?: number; // 0..10
}

export async function evaluatePolicy(ctx: PolicyContext): Promise<GovernanceDecision> {
  const risk = classifyAction(ctx.toolName);
  const autonomy = Math.min(10, Math.max(0, ctx.autonomyLevel ?? 3));

  // Critical: ALWAYS requires approval, no matter autonomy.
  if (risk === 'critical') return queueApproval(ctx, 'critical action requires explicit human approval');
  // High: required unless autonomy >= 8
  if (risk === 'high' && autonomy < 8) return queueApproval(ctx, 'high-risk action under current autonomy level');

  return { allowed: true, requiresApproval: false };
}

async function queueApproval(ctx: PolicyContext, reason: string): Promise<GovernanceDecision> {
  try {
    const ref = await adminDb.collection('approvals').add({
      ...ctx, reason, status: 'pending', createdAt: new Date(),
    });
    return { allowed: false, requiresApproval: true, approvalId: ref.id, reason };
  } catch {
    return { allowed: false, requiresApproval: true, reason };
  }
}

export async function resolveApproval(approvalId: string, decision: 'approved' | 'rejected', resolvedBy: string) {
  await adminDb.collection('approvals').doc(approvalId).update({
    status: decision, resolvedBy, resolvedAt: new Date(),
  });
  return { approvalId, status: decision };
}
