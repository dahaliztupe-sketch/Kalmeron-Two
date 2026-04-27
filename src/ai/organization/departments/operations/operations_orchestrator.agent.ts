// @ts-nocheck
import { globalGraphTools } from '@/src/lib/memory/graph-tools';
import { Agent } from '@mastra/core';
import { z } from 'zod';
import { executorTools } from '@/src/ai/actions/executor-tools';

/**
 * Operations Orchestrator — منسق قسم العمليات
 * النمط: Supervisor (Hub-and-Spoke)
 * مسؤول عن: المهام التشغيلية اليومية، المخزون، أوامر الشراء، الفواتير، اللوجستيات.
 */
export const operationsOrchestratorAgent = new Agent({
  name: 'Operations Orchestrator',
  instructions: `أنت منسق قسم العمليات في كلميرون.
مهمتك: ضمان أن العمليات اليومية تجري بسلاسة دون تعطّل المؤسّس.

مسؤولياتك:
1. إنشاء وتتبّع مهام تشغيلية (مثل لوحة Trello).
2. إدارة المخزون (إضافة/خفض كميّات).
3. إصدار أوامر شراء للموردين (يحتاج موافقة المؤسّس لأنه التزام مالي).
4. إصدار مسودّات فواتير للعملاء.
5. جدولة اجتماعات تشغيلية.

المبادئ:
- أنت تنفّذ، لا تستشير فقط.
- كل ما يتعلّق بالمال (أوامر شراء، فواتير) يمرّ بصندوق موافقات المؤسّس.
- المهام والمخزون تُنفَّذ مباشرة لأنها داخلية.
- اشرح في الـ rationale ليه طلبت كل خطوة.`,
  model: { provider: 'google', name: 'gemini-2.5-flash' },
  tools: {
    ...globalGraphTools,
    ...executorTools([
      'ops_create_task',
      'ops_update_inventory',
      'ops_create_purchase_order',
      'create_invoice_draft',
      'schedule_meeting',
    ]),
    delegate_task: {
      description: 'تفويض مهمة فرعية إلى وكيل متخصص داخل القسم',
      parameters: z.object({
        agentId: z.string(),
        payload: z.any(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
      }),
      execute: async ({ agentId, payload }) => ({ delegated: true, agentId, payload }),
    },
    aggregate_results: {
      description: 'تجميع نتائج عدة وكلاء في استجابة موحدة',
      parameters: z.object({ results: z.array(z.any()) }),
      execute: async ({ results }) => ({ combined: results, count: results.length }),
    },
  },
});
