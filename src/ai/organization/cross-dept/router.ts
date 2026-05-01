/**
 * Cross-Department Task Router
 * ─────────────────────────────────────────────────────────────────────────────
 * يُدير المهام التي تمتد عبر أقسام متعددة (cross-departmental tasks).
 *
 * مثال: مهمة "إطلاق منتج جديد" تحتاج:
 *   - قسم التقنية → تطوير وبناء
 *   - قسم التسويق → إعداد الحملة
 *   - قسم المالية → وضع الميزانية
 *   - قسم القانون → مراجعة الاتفاقيات
 *
 * الخطوات:
 *   1. تحليل المهمة باستخدام LLM لتحديد الأقسام المعنية
 *   2. توزيع المهام الفرعية على وكلاء كل قسم بشكل موازٍ
 *   3. تجميع النتائج وتلخيصها في مخرج نهائي متماسك
 *   4. إطلاق أحداث SSE على delegationBus لكل مرحلة
 */

import { generateText } from 'ai';
import { routeModel } from '@/src/lib/model-router';
import { runCouncilSafe } from '@/src/ai/panel';
import { delegationBus } from '../delegation/engine';
import type { DelegationEvent, DelegationEventType } from '../delegation/engine';
import type { Company, CompanyTask, CrossDeptTaskResult, CompanyDepartment } from '@/src/lib/company-builder/types';

// ─── مساعدات ──────────────────────────────────────────────────────────────────

function emitCross(traceId: string, type: DelegationEventType, data: Record<string, unknown>) {
  const event: DelegationEvent = { type, traceId, timestamp: Date.now(), data };
  delegationBus.emit(`trace:${traceId}`, event);
  delegationBus.emit('all', event);
}

// ─── تحليل المهمة لتحديد الأقسام المعنية ────────────────────────────────────

interface DeptAssignment {
  departmentId: string;
  subTask: string;
  priority: 'high' | 'medium' | 'low';
}

async function analyzeCrossDeptTask(
  taskDescription: string,
  departments: CompanyDepartment[],
  userId?: string,
): Promise<DeptAssignment[]> {
  const deptList = departments.map(d => `${d.id}: ${d.nameAr} — ${d.description}`).join('\n');

  const prompt = `
أنت مدير تنفيذي خبير في توزيع المهام.

الأقسام المتاحة:
${deptList}

المهمة المطلوبة:
"${taskDescription}"

حلّل هذه المهمة وحدد:
1. الأقسام المعنية (2-4 أقسام على الأكثر)
2. المهمة الفرعية التي يجب أن يُنجزها كل قسم
3. أولوية مشاركة كل قسم

أجب بتنسيق JSON:
{
  "assignments": [
    { "departmentId": "...", "subTask": "...", "priority": "high|medium|low" }
  ]
}
`.trim();

  try {
    const model = routeModel('fast');
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.2,
    });
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as { assignments: DeptAssignment[] };
    return parsed.assignments.slice(0, 4);
  } catch {
    // Fallback: أول قسمين متاحين
    return departments.slice(0, 2).map(d => ({
      departmentId: d.id,
      subTask: `تنفيذ: ${taskDescription}`,
      priority: 'medium' as const,
    }));
  }
}

// ─── تنفيذ المهمة الفرعية على قسم محدد ──────────────────────────────────────

async function executeDeptSubTask(
  dept: CompanyDepartment,
  subTask: string,
  context: { companyName: string; companyType: string; traceId: string },
  userId?: string,
): Promise<{ output: string; latencyMs: number }> {
  const start = Date.now();

  // اختيار الوكيل الرئيسي للقسم (Head)
  const headAgentId = dept.headId;
  const agentNameAr = `رئيس قسم ${dept.nameAr}`;

  try {
    const result = await runCouncilSafe({
      agentName: headAgentId,
      agentRoleAr: agentNameAr,
      userMessage: `
[شركة: ${context.companyName} | ${context.companyType}]
[Trace: ${context.traceId}]

مهمتك كـ${agentNameAr}:
${subTask}

قدّم إجابة عملية ومختصرة لا تتجاوز 300 كلمة.
      `.trim(),
      uiContext: `cross-dept-task:${dept.id}`,
      userId: userId ?? 'system',
      mode: 'focused',
    });
    return { output: result.response ?? result.toString(), latencyMs: Date.now() - start };
  } catch (err) {
    return {
      output: `لم يتمكن قسم ${dept.nameAr} من إتمام المهمة: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`,
      latencyMs: Date.now() - start,
    };
  }
}

// ─── تجميع النتائج ────────────────────────────────────────────────────────────

async function synthesizeResults(
  taskTitle: string,
  results: CrossDeptTaskResult['results'],
  userId?: string,
): Promise<string> {
  const successResults = results.filter(r => r.status === 'completed');
  if (successResults.length === 0) return 'لم تتمكن أي من الأقسام من إتمام المهمة.';

  const summaryPrompt = `
أنت مساعد تلخيص تنفيذي. 

المهمة الأصلية: "${taskTitle}"

نتائج الأقسام:
${successResults.map((r, i) => `
${i + 1}. ${r.departmentNameAr} (${r.agentId}):
${r.output}
`).join('\n---\n')}

قدّم ملخصاً نهائياً متكاملاً يجمع كل هذه النتائج في رد موحد.
الملخص يجب أن:
- يكون شاملاً ومترابطاً
- يُبرز أهم التوصيات من كل قسم
- يُحدد الخطوات التنفيذية التالية
- لا يتجاوز 500 كلمة
  `.trim();

  try {
    const model = routeModel('quality');
    const { text } = await generateText({ model, prompt: summaryPrompt, temperature: 0.3 });
    return text;
  } catch {
    return successResults.map(r => `**${r.departmentNameAr}:**\n${r.output}`).join('\n\n---\n\n');
  }
}

// ─── الدالة الرئيسية ──────────────────────────────────────────────────────────

export async function routeCrossDeptTask(
  company: Company,
  task: CompanyTask,
  userId?: string,
): Promise<CrossDeptTaskResult> {
  const traceId = `cross_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const startTime = Date.now();

  emitCross(traceId, 'delegation_started', {
    taskId: task.id,
    taskTitle: task.title,
    companyId: company.id,
    companyName: company.name,
    message: `بدأ توزيع المهمة: "${task.title}" على أقسام ${company.name}`,
  });

  // 1. تحديد الأقسام المعنية
  emitCross(traceId, 'hop_started', {
    step: 'analyzing_task',
    message: 'تحليل المهمة وتحديد الأقسام المعنية…',
  });

  const assignments = await analyzeCrossDeptTask(
    `${task.title}\n${task.description}`,
    company.departments,
    userId,
  );

  emitCross(traceId, 'agent_selected', {
    assignedDepts: assignments.map(a => a.departmentId),
    count: assignments.length,
    message: `تم توزيع المهمة على ${assignments.length} أقسام`,
  });

  // 2. تنفيذ موازٍ على كل قسم
  const deptResults = await Promise.allSettled(
    assignments.map(async (assignment): Promise<CrossDeptTaskResult['results'][0]> => {
      const dept = company.departments.find(d => d.id === assignment.departmentId);
      if (!dept) {
        return {
          departmentId: assignment.departmentId,
          departmentNameAr: 'قسم غير معروف',
          agentId: 'unknown',
          output: 'القسم غير موجود في هيكل الشركة',
          latencyMs: 0,
          status: 'failed',
        };
      }

      emitCross(traceId, 'agent_processing', {
        departmentId: dept.id,
        departmentNameAr: dept.nameAr,
        agentId: dept.headId,
        message: `${dept.nameAr} يعمل على: ${assignment.subTask.slice(0, 80)}…`,
      });

      const { output, latencyMs } = await executeDeptSubTask(
        dept,
        assignment.subTask,
        { companyName: company.name, companyType: company.typeNameAr, traceId },
        userId,
      );

      emitCross(traceId, 'hop_completed', {
        departmentId: dept.id,
        latencyMs,
        outputPreview: output.slice(0, 100),
      });

      return {
        departmentId: dept.id,
        departmentNameAr: dept.nameAr,
        agentId: dept.headId,
        output,
        latencyMs,
        status: 'completed',
      };
    }),
  );

  const results: CrossDeptTaskResult['results'] = deptResults.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      departmentId: assignments[i].departmentId,
      departmentNameAr: company.departments.find(d => d.id === assignments[i].departmentId)?.nameAr ?? '',
      agentId: 'error',
      output: r.reason instanceof Error ? r.reason.message : 'فشل في التنفيذ',
      latencyMs: 0,
      status: 'failed' as const,
    };
  });

  // 3. تجميع وتلخيص النتائج
  emitCross(traceId, 'agent_processing', {
    step: 'synthesizing',
    message: 'تجميع نتائج الأقسام وإعداد الملخص النهائي…',
  });

  const synthesizedOutput = await synthesizeResults(task.title, results, userId);
  const totalLatencyMs = Date.now() - startTime;

  emitCross(traceId, 'delegation_completed', {
    taskId: task.id,
    totalLatencyMs,
    successCount: results.filter(r => r.status === 'completed').length,
    failCount: results.filter(r => r.status === 'failed').length,
    outputPreview: synthesizedOutput.slice(0, 200),
  });

  return {
    taskId: task.id,
    companyId: company.id,
    title: task.title,
    results,
    synthesizedOutput,
    totalLatencyMs,
    traceId,
  };
}
