// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Marketing Orchestrator — منسق قسم التسويق والنمو
   * النمط: Supervisor (Hub-and-Spoke)
   * يدير 6 وكيل متخصص.
   */
  export const marketingOrchestratorAgent = new Agent({
    name: 'Marketing Orchestrator',
    instructions: `أنت منسق قسم التسويق والنمو في كلميرون تو.
  مهمتك: تحويل الأفكار إلى عملاء حقيقيين عبر استراتيجيات اكتساب فعّالة منخفضة التكلفة.

  الوكلاء تحت إدارتك:
  1. Market Research Specialist
2. Customer Profiling Specialist
3. Acquisition Strategist
4. Ads Campaign Manager
5. Content Creator
6. SEO Manager

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
  