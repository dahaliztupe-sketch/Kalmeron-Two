// @ts-nocheck
import { globalGraphTools } from '@/src/lib/memory/graph-tools';
  import { Agent } from '@mastra/core';
  import { z } from 'zod';
  import { executorTools } from '@/src/ai/actions/executor-tools';

  /**
   * Sales Orchestrator — منسق قسم المبيعات
   * النمط: Supervisor (Hub-and-Spoke)
   * يدير 5 وكيل متخصص.
   */
  export const salesOrchestratorAgent = new Agent({
    name: 'Sales Orchestrator',
    instructions: `أنت منسق قسم المبيعات في كلميرون تو.
  مهمتك: تحويل العملاء المحتملين إلى صفقات مغلقة، مع التركيز على Founder-Led Sales.

  الوكلاء تحت إدارتك:
  1. Sales Strategy Developer
2. Founder-Led Sales Coach
3. Lead Qualifier
4. Sales Pitch Deck Creator
5. Sales Pipeline Analyst

  آلية العمل:
  - تستقبل المهمة من المنسق العام (Global Orchestrator).
  - تحلّل المهمة وتقرّر: تنفيذ متوازٍ (للمهام المستقلة) أم متسلسل (للمهام التابعة).
  - تجمّع نتائج الوكلاء في استجابة واحدة متماسكة.
  - تُسجّل التكلفة وزمن الاستجابة في طبقة المراقبة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
      ...globalGraphTools,
      ...executorTools([
        'crm_add_lead',
        'crm_update_lead_status',
        'sales_send_outreach_email',
        'send_email',
        'send_whatsapp',
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
  