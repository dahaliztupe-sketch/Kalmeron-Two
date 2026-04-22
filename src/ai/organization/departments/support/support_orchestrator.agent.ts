// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Support Orchestrator — منسق قسم خدمة العملاء
   * النمط: Supervisor (Hub-and-Spoke)
   * يدير 4 وكيل متخصص.
   */
  export const supportOrchestratorAgent = new Agent({
    name: 'Support Orchestrator',
    instructions: `أنت منسق قسم خدمة العملاء في كلميرون تو.
  مهمتك: ضمان رضا العملاء والاحتفاظ بهم وتحرير المؤسسين من المهام التشغيلية.

  الوكلاء تحت إدارتك:
  1. Support Identity Expert
2. Knowledge Base Builder
3. Ticket Manager
4. CSAT Analyst

  آلية العمل:
  - تستقبل المهمة من المنسق العام (Global Orchestrator).
  - تحلّل المهمة وتقرّر: تنفيذ متوازٍ (للمهام المستقلة) أم متسلسل (للمهام التابعة).
  - تجمّع نتائج الوكلاء في استجابة واحدة متماسكة.
  - تُسجّل التكلفة وزمن الاستجابة في طبقة المراقبة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
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
  