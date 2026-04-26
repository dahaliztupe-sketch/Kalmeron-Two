// @ts-nocheck
  /**
   * Global Orchestrator — طبقة الحوكمة (Governance Layer)
   * نمط: Supervisor (Mastra) + Hub-and-Spoke
   * يستقبل المهمة من وكيل الاستقبال، يحلل النية، ويفوّض إلى قسم/أقسام (تنفيذ متوازٍ أو متسلسل).
   */
  import { generateText } from 'ai';
  import { MODELS } from '@/src/lib/gemini';
  import { dispatchAlert } from '../compliance/monitor';
  import { sendMessage } from '../protocols/communication';
  import { createTask, updateTaskStatus } from '../tasks/task-manager';
  import { getPersonalizedPath, type AudienceSegment } from '../personalization/paths';

  export type DepartmentId =
    | 'marketing' | 'product' | 'finance' | 'sales'
    | 'support' | 'hr' | 'legal' | 'monitoring';

  export interface OrchestrationRequest {
    userId: string;
    message: string;
    uiContext?: Record<string, unknown>;
    segment?: AudienceSegment;
    threadId?: string;
  }

  export interface OrchestrationPlan {
    mode: 'parallel' | 'sequential' | 'single';
    departments: DepartmentId[];
    reasoning: string;
  }

  const ROUTING_PROMPT = `أنت المنسق العام لمنصة كلميرون تو. حلّل طلب المستخدم وحدّد:
  1. أي الأقسام يجب إشراكها (واحد أو أكثر).
  2. هل التنفيذ متوازٍ (مهام مستقلة) أم متسلسل (مخرجات قسم تُغذّي قسمًا آخر).

  الأقسام المتاحة:
  - marketing: التسويق والنمو
  - product: العمليات والمنتج  
  - finance: المالية والاستراتيجية
  - sales: المبيعات
  - support: خدمة العملاء
  - hr: الموارد البشرية
  - legal: القانون والملكية الفكرية
  - monitoring: المراقبة والأمان

  أجب بصيغة JSON فقط:
  {"mode":"parallel|sequential|single","departments":["..."],"reasoning":"سبب موجز"}`;

  export async function planOrchestration(req: OrchestrationRequest): Promise<OrchestrationPlan> {
    const { text } = await generateText({
      model: MODELS.LITE,
      system: ROUTING_PROMPT,
      prompt: `السياق: ${JSON.stringify(req.uiContext || {})}
  الرسالة: ${req.message}`,
    });
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('no json');
      const plan = JSON.parse(jsonMatch[0]);
      return {
        mode: plan.mode || 'single',
        departments: Array.isArray(plan.departments) ? plan.departments : ['product'],
        reasoning: plan.reasoning || '',
      };
    } catch {
      return { mode: 'single', departments: ['product'], reasoning: 'fallback: routing parse failed' };
    }
  }

  export async function orchestrate(req: OrchestrationRequest): Promise<{
    taskId: string;
    plan: OrchestrationPlan;
    results: Record<string, unknown>;
  }> {
    const taskId = await createTask({
      userId: req.userId,
      description: req.message.slice(0, 200),
      payload: req,
    });
    await updateTaskStatus(taskId, 'in_progress');

    try {
      const plan = await planOrchestration(req);

      // Apply personalized path overrides for the audience segment
      const path = req.segment ? getPersonalizedPath(req.segment) : null;
      if (path?.priorityDepartments?.length) {
        const merged = Array.from(new Set([...path.priorityDepartments, ...plan.departments]));
        plan.departments = merged as DepartmentId[];
      }

      const work = plan.departments.map(dept => sendMessage({
        from: 'global-orchestrator',
        to: `${dept}-orchestrator`,
        type: 'task',
        payload: { taskId, request: req, plan },
        priority: 'high',
      }));

      const results: Record<string, unknown> = {};
      if (plan.mode === 'sequential') {
        let prev: unknown = null;
        for (const dept of plan.departments) {
          const ack = await sendMessage({
            from: 'global-orchestrator',
            to: `${dept}-orchestrator`,
            type: 'task',
            payload: { taskId, request: req, prev },
            priority: 'high',
          });
          results[dept] = ack;
          prev = ack;
        }
      } else {
        const acks = await Promise.all(work);
        plan.departments.forEach((d, i) => { results[d] = acks[i]; });
      }

      await updateTaskStatus(taskId, 'completed', results);
      return { taskId, plan, results };
    } catch (err: unknown) {
      await updateTaskStatus(taskId, 'failed', { error: err?.message });
      await dispatchAlert({
        severity: 'high',
        source: 'global-orchestrator',
        message: `Orchestration failed: ${err?.message}`,
      });
      throw err;
    }
  }
  