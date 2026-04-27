// @ts-nocheck
import { globalGraphTools } from '@/src/lib/memory/graph-tools';
  import { Agent } from '@mastra/core';
  import { z } from 'zod';
  import { executorTools } from '@/src/ai/actions/executor-tools';

  /**
   * Finance Orchestrator — منسق قسم المالية والاستراتيجية
   * النمط: Supervisor (Hub-and-Spoke)
   * يدير 5 وكيل متخصص.
   */
  export const financeOrchestratorAgent = new Agent({
    name: 'Finance Orchestrator',
    instructions: `أنت منسق قسم المالية والاستراتيجية في كلميرون تو.
  مهمتك: ضمان الاستدامة المالية والتجهيز للتمويل.

  الوكلاء تحت إدارتك:
  1. Financial Modeling Specialist
2. Investor Relations Specialist
3. Valuation Expert
4. Finance Legal Compliance
5. Equity Manager

  آلية العمل:
  - تستقبل المهمة من المنسق العام (Global Orchestrator).
  - تحلّل المهمة وتقرّر: تنفيذ متوازٍ (للمهام المستقلة) أم متسلسل (للمهام التابعة).
  - تجمّع نتائج الوكلاء في استجابة واحدة متماسكة.
  - تُسجّل التكلفة وزمن الاستجابة في طبقة المراقبة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
      ...globalGraphTools,
      ...executorTools([
        'cfo_log_bank_transaction',
        'cfo_generate_pl_report',
        'cfo_set_budget_alert',
        'create_invoice_draft',
        'investor_add_data_room_file',
        'investor_send_pitch_email',
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
  