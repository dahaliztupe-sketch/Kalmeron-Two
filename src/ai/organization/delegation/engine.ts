/**
 * Delegation Engine — Kalmeron Two
 * ─────────────────────────────────────────────────────────────────────────────
 * يُتيح للمديرين التنفيذيين (C-Suite) تفويض المهام إلى مرؤوسيهم المباشرين،
 * مما يُشكّل سلاسل تعاون حقيقية متعددة الوكلاء.
 *
 * مثال على سلسلة تفويض:
 *   CEO → CFO → budget-analyst (تحليل ميزانية Q3)
 *   CEO → CMO → brand-builder (بناء هوية بصرية)
 *   CFO → cash-runway (تحليل التدفق النقدي للـ 6 أشهر القادمة)
 *
 * القيود الأمنية:
 *   - الوكيل المُفوِّض يجب أن يكون في قائمة `directReports` للمدير الطالب.
 *   - الحد الأقصى للقفزات (hops) = MAX_DELEGATION_HOPS لمنع الحلقات اللانهائية.
 *   - كل قفزة تُسجَّل في `delegationChain` لضمان الشفافية والتتبع الكامل.
 */

import { z } from 'zod';
import { generateObject } from 'ai';
import {
  ENTERPRISE_EXECUTIVES,
  type ExecutiveRole,
  type DepartmentId,
} from '../enterprise/hierarchy';
import { runCouncilSafe } from '../../panel';
import { routeModel } from '@/src/lib/model-router';
import { logTrace, type AgentTrace } from '../../meta/tracer';

/** الحد الأقصى لعدد القفزات في سلسلة تفويض واحدة. */
const MAX_DELEGATION_HOPS = 4;

/** ─── أنواع البيانات ─── */

export interface DelegationHop {
  /** الوكيل المُفوِّض في هذه القفزة. */
  from: string;
  /** الوكيل المُستقبِل للمهمة. */
  to: string;
  /** سبب اختيار هذا الوكيل تحديداً. */
  reasoning: string;
  /** الوقت بالمللي ثانية الذي استغرقته هذه القفزة. */
  latencyMs: number;
}

export interface DelegationResult {
  /** نتيجة المهمة النهائية (مخرج الوكيل الأخير في السلسلة). */
  output: string;
  /** سلسلة التفويض الكاملة بالترتيب. */
  delegationChain: DelegationHop[];
  /** معرّف تتبع فريد لهذه الجلسة. */
  traceId: string;
  /** إجمالي وقت التنفيذ بالمللي ثانية. */
  totalLatencyMs: number;
  /** الوكيل الذي نفّذ المهمة في النهاية. */
  executedByAgent: string;
  /** الوكيل الذي أصدر طلب التفويض الأصلي. */
  initiatedByRole: string;
}

export interface DelegationRequest {
  /** دور المدير التنفيذي المُفوِّض (CEO, CFO, …). */
  delegatorRole: ExecutiveRole;
  /** وصف المهمة المُفوَّضة. */
  task: string;
  /** (اختياري) تحديد وكيل مُحدد من المرؤوسين المباشرين. */
  targetAgentId?: string;
  /** (اختياري) السياق الإضافي للمهمة. */
  context?: Record<string, unknown>;
  /** (اختياري) هل يُسمح للوكيل المستقبِل بإعادة التفويض؟ */
  allowSubDelegation?: boolean;
  /** معرف المستخدم لتتبع التكلفة. */
  userId?: string;
}

/** ─── Schema تصنيف الوكيل الأمثل ─── */
const AgentSelectionSchema = z.object({
  selectedAgentId: z.string(),
  reasoning: z.string().max(300),
  confidence: z.number().min(0).max(1),
});

/**
 * يختار أفضل مرؤوس لتنفيذ المهمة عبر LLM.
 * يعود إلى المرؤوس الأول في القائمة إذا فشل LLM.
 */
async function selectBestSubordinate(
  directReports: string[],
  task: string,
  traceId: string,
): Promise<{ agentId: string; reasoning: string }> {
  if (directReports.length === 1) {
    return { agentId: directReports[0], reasoning: 'المرؤوس الوحيد المتاح' };
  }

  try {
    const routed = routeModel('agent selection, short structured output', 'trivial');
    const agentDescriptions = directReports
      .map((id) => `- ${id}`)
      .join('\n');

    const { object } = await generateObject({
      model: routed.model,
      schema: AgentSelectionSchema,
      system: `أنت نظام توجيه مهام داخلي في كلميرون. مهمتك اختيار أفضل وكيل من القائمة لتنفيذ المهمة المُعطاة.

الوكلاء المتاحون:
${agentDescriptions}

اختر الأنسب بناءً على اسم الوكيل ومضمون المهمة. أجب بـ JSON فقط.`,
      prompt: `المهمة: ${task.slice(0, 500)}`,
    });

    logTrace({
      traceId,
      agentName: 'delegation_agent_selection',
      userId: 'system',
      timestamp: new Date(),
      input: { candidates: directReports, task: task.slice(0, 200) },
      finalOutput: { selected: object.selectedAgentId, confidence: object.confidence },
      metrics: { totalDuration: 0, tokensUsed: 0, costCents: 0 },
    }).catch(() => {});

    if (directReports.includes(object.selectedAgentId)) {
      return { agentId: object.selectedAgentId, reasoning: object.reasoning };
    }
  } catch {
    /* الارتداد إلى الكلمات المفتاحية */
  }

  return fallbackSelectByKeywords(directReports, task);
}

/** ارتداد بسيط بالكلمات المفتاحية. */
function fallbackSelectByKeywords(
  directReports: string[],
  task: string,
): { agentId: string; reasoning: string } {
  const lowerTask = task.toLowerCase();
  const keywordMap: Record<string, RegExp> = {
    'budget-analyst': /(ميزانية|budget|تكلفة|cost)/i,
    'cash-runway': /(نقد|cash|تدفق|runway|سيولة)/i,
    'financial-modeling': /(نموذج|model|توقع|forecast|تقييم)/i,
    'equity-manager': /(حصص|equity|مساهم|shareholder)/i,
    'brand-builder': /(علامة|brand|هوية|identity)/i,
    'competitor-intel': /(منافس|competitor|سوق|market)/i,
    'content-creator': /(محتوى|content|مقال|post)/i,
    'marketing-strategist': /(تسويق|marketing|استراتيجية)/i,
    'code-interpreter': /(كود|code|برمجة|dev|تقني)/i,
    'product-manager': /(منتج|product|feature|ميزة)/i,
    'contract-drafter': /(عقد|contract|اتفاقية|agreement)/i,
    'compliance': /(امتثال|compliance|لوائح|regulations)/i,
    'hiring-advisor': /(توظيف|hiring|موظف|employee)/i,
    'culture-expert': /(ثقافة|culture|قيم|values)/i,
    'idea-validator': /(فكرة|idea|تحقق|validate)/i,
    'opportunity-radar': /(فرصة|opportunity|تمويل|grant)/i,
    'expansion-planner': /(توسع|expansion|سوق جديد|new market)/i,
  };

  for (const agentId of directReports) {
    const pattern = keywordMap[agentId];
    if (pattern && pattern.test(lowerTask)) {
      return { agentId, reasoning: `keyword-match: نمط الكلمات المفتاحية تطابق مع ${agentId}` };
    }
  }

  return {
    agentId: directReports[0],
    reasoning: 'fallback: لا توجد كلمات مفتاحية مطابقة — اختيار المرؤوس الأول',
  };
}

/**
 * يُنفِّذ المهمة على وكيل مُحدد عبر مجلس الخبراء.
 * يُعيد نص الاستجابة.
 */
async function executeOnAgent(
  agentId: string,
  task: string,
  context: Record<string, unknown>,
  userId?: string,
): Promise<string> {
  const { markdown, result, error } = await runCouncilSafe({
    agentName: agentId,
    agentRoleAr: `وكيل متخصص: ${agentId}`,
    userMessage: task,
    uiContext: context,
    userId,
    mode: 'deep',
  });

  if (error && !result) {
    throw new Error(`فشل تنفيذ المهمة على الوكيل ${agentId}: ${error}`);
  }

  const rawOutput = result?.output;
  if (typeof rawOutput === 'string') return rawOutput;
  if (rawOutput && typeof rawOutput === 'object') {
    // CouncilOutput — نُعيد التوصية النهائية فقط للإيجاز
    const council = rawOutput as { recommendation?: string; diagnosis?: string };
    return council.recommendation || council.diagnosis || JSON.stringify(rawOutput);
  }
  return markdown || 'تم التنفيذ بنجاح';
}

/**
 * التحقق من أن الوكيل المستهدف هو مرؤوس مباشر للمُفوِّض.
 */
export function validateDelegationAuthority(
  delegatorRole: ExecutiveRole,
  targetAgentId: string,
): { valid: boolean; reason?: string } {
  const exec = ENTERPRISE_EXECUTIVES[delegatorRole];
  if (!exec) {
    return { valid: false, reason: `الدور ${delegatorRole} غير موجود في الهيكل التنظيمي` };
  }
  if (!exec.directReports.includes(targetAgentId) && exec.agentId !== targetAgentId) {
    return {
      valid: false,
      reason: `الوكيل ${targetAgentId} ليس مرؤوساً مباشراً للـ ${delegatorRole}. المرؤوسون المتاحون: ${exec.directReports.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * يحلّ الوكيل المُنفِّذ النهائي مع دعم إعادة التفويض متعدد المستويات.
 * يُعيد قائمة القفزات وهوية الوكيل المنفِّذ.
 */
async function resolveExecutor(
  startRole: ExecutiveRole,
  task: string,
  targetAgentId: string | undefined,
  allowSubDelegation: boolean,
  traceId: string,
  hopsUsed: number = 0,
): Promise<{ executorAgentId: string; hops: Array<{ from: string; to: string; reasoning: string }> }> {
  const exec = ENTERPRISE_EXECUTIVES[startRole];
  const hops: Array<{ from: string; to: string; reasoning: string }> = [];

  // اختيار المرؤوس المباشر
  let chosenAgentId: string;
  let selectionReasoning: string;

  if (targetAgentId) {
    chosenAgentId = targetAgentId;
    selectionReasoning = 'تحديد مباشر من المُفوِّض';
  } else {
    const selected = await selectBestSubordinate(exec.directReports, task, traceId);
    chosenAgentId = selected.agentId;
    selectionReasoning = selected.reasoning;
  }

  hops.push({ from: exec.agentId, to: chosenAgentId, reasoning: selectionReasoning });

  // هل الوكيل المختار هو مدير تنفيذي بنفسه؟ وهل يُسمح بإعادة التفويض؟
  if (allowSubDelegation && hopsUsed < MAX_DELEGATION_HOPS) {
    const subExecEntry = Object.entries(ENTERPRISE_EXECUTIVES).find(
      ([, e]) => e.agentId === chosenAgentId,
    );
    if (subExecEntry && subExecEntry[1].directReports.length > 0) {
      const [subRole, subExec] = subExecEntry;
      const subSelected = await selectBestSubordinate(subExec.directReports, task, traceId);
      hops.push({
        from: chosenAgentId,
        to: subSelected.agentId,
        reasoning: `تفويض داخلي: ${subRole} يُحيل المهمة إلى ${subSelected.agentId}`,
      });
      return { executorAgentId: subSelected.agentId, hops };
    }
  }

  return { executorAgentId: chosenAgentId, hops };
}

/**
 * الدالة الرئيسية للتفويض.
 * تُنفِّذ سلسلة التفويض الكاملة وتُعيد النتيجة مع trace كامل.
 */
export async function delegateTask(req: DelegationRequest): Promise<DelegationResult> {
  const traceId = `dlg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  // 1. التحقق من صحة المُفوِّض
  const exec = ENTERPRISE_EXECUTIVES[req.delegatorRole];
  if (!exec) {
    throw new Error(`الدور ${req.delegatorRole} غير معرَّف في الهيكل التنظيمي`);
  }

  // 2. إذا كان الهدف محدداً، تحقق من الصلاحية
  if (req.targetAgentId) {
    const auth = validateDelegationAuthority(req.delegatorRole, req.targetAgentId);
    if (!auth.valid) {
      throw new Error(auth.reason);
    }
  }

  // 3. حل سلسلة التفويض
  const { executorAgentId, hops } = await resolveExecutor(
    req.delegatorRole,
    req.task,
    req.targetAgentId,
    req.allowSubDelegation ?? false,
    traceId,
    0,
  );

  // 4. بناء سلسلة القفزات مع توقيت كل منها
  const delegationChain: DelegationHop[] = [];
  for (const hop of hops) {
    const hopStart = Date.now();
    delegationChain.push({
      from: hop.from,
      to: hop.to,
      reasoning: hop.reasoning,
      latencyMs: Date.now() - hopStart,
    });
  }

  // 5. تنفيذ المهمة على الوكيل النهائي
  const executionStart = Date.now();
  const output = await executeOnAgent(
    executorAgentId,
    req.task,
    {
      delegationChain: hops,
      initiatedBy: req.delegatorRole,
      traceId,
      ...req.context,
    },
    req.userId,
  );

  // تحديث زمن القفزة الأخيرة بالوقت الفعلي للتنفيذ
  if (delegationChain.length > 0) {
    delegationChain[delegationChain.length - 1].latencyMs = Date.now() - executionStart;
  }

  // 6. تسجيل الـ trace
  await logTrace({
    traceId,
    agentName: `delegation:${req.delegatorRole}→${executorAgentId}`,
    userId: req.userId ?? 'system',
    timestamp: new Date(),
    input: { task: req.task, delegatorRole: req.delegatorRole, targetAgentId: req.targetAgentId },
    finalOutput: { output, delegationChain },
    metrics: {
      totalDuration: Date.now() - startTime,
      tokensUsed: 0,
      costCents: 0,
    },
  } satisfies AgentTrace).catch(() => {/* لا نُوقف التنفيذ بسبب فشل التسجيل */});

  return {
    output,
    delegationChain,
    traceId,
    totalLatencyMs: Date.now() - startTime,
    executedByAgent: executorAgentId,
    initiatedByRole: req.delegatorRole,
  };
}

/**
 * يُعيد قائمة بالمرؤوسين المباشرين للمدير التنفيذي.
 * مفيد لواجهات الاستعلام.
 */
export function getDirectReports(role: ExecutiveRole): {
  agentId: string;
  department: DepartmentId;
}[] {
  const exec = ENTERPRISE_EXECUTIVES[role];
  if (!exec) return [];
  return exec.directReports.map((id) => ({
    agentId: id,
    department: exec.department,
  }));
}

/**
 * يُعيد الهيكل التنظيمي الكامل للتفويض كـ JSON.
 */
export function getDelegationOrgChart(): Record<
  ExecutiveRole,
  { nameAr: string; agentId: string; directReports: string[] }
> {
  const chart = {} as Record<
    ExecutiveRole,
    { nameAr: string; agentId: string; directReports: string[] }
  >;
  for (const [role, exec] of Object.entries(ENTERPRISE_EXECUTIVES)) {
    chart[role as ExecutiveRole] = {
      nameAr: exec.nameAr,
      agentId: exec.agentId,
      directReports: exec.directReports,
    };
  }
  return chart;
}
