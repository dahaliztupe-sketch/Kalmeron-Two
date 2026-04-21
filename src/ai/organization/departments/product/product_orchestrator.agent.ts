// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Product Orchestrator — منسق قسم العمليات والمنتج
   * النمط: Supervisor (Hub-and-Spoke)
   * يدير 6 وكيل متخصص.
   */
  export const productOrchestratorAgent = new Agent({
    name: 'Product Orchestrator',
    instructions: `أنت منسق قسم العمليات والمنتج في كلميرون تو.
  مهمتك: بناء منتج يحقق Product-Market Fit عبر تكرار سريع وقياس مستمر.

  الوكلاء تحت إدارتك:
  1. Product Manager
2. System Architect
3. MVP Developer
4. DevOps Engineer
5. QA Manager
6. UX Optimization Specialist

  آلية العمل:
  - تستقبل المهمة من المنسق العام (Global Orchestrator).
  - تحلّل المهمة وتقرّر: تنفيذ متوازٍ (للمهام المستقلة) أم متسلسل (للمهام التابعة).
  - تجمّع نتائج الوكلاء في استجابة واحدة متماسكة.
  - تُسجّل التكلفة وزمن الاستجابة في طبقة المراقبة.`,
    model: { provider: 'google', name: 'gemini-3-flash-preview' },
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
  