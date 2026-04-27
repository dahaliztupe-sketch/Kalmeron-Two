// @ts-nocheck
import { globalGraphTools } from '@/src/lib/memory/graph-tools';
  import { Agent } from '@mastra/core';
  import { z } from 'zod';
  import { executorTools } from '@/src/ai/actions/executor-tools';
  import { smartTools, SMART_AGENT_GUIDELINES } from '@/src/ai/reasoning/smart-tools';

  /**
   * Legal Orchestrator — منسق قسم الشؤون القانونية والملكية الفكرية
   * النمط: Supervisor (Hub-and-Spoke)
   * يدير 5 وكيل متخصص.
   */
  export const legalOrchestratorAgent = new Agent({
    name: 'Legal Orchestrator',
    instructions: `أنت منسق قسم الشؤون القانونية والملكية الفكرية في كلميرون تو.
  مهمتك: حماية الملكية الفكرية وضمان الامتثال للقوانين المصرية والدولية.

  الوكلاء تحت إدارتك:
  1. Founders Agreement Advisor
2. IP Protection Expert
3. Data Privacy Compliance Auditor
4. Contract Drafter
5. Investment Agreement Specialist

  آلية العمل:
  - تستقبل المهمة من المنسق العام (Global Orchestrator).
  - تحلّل المهمة وتقرّر: تنفيذ متوازٍ (للمهام المستقلة) أم متسلسل (للمهام التابعة).
  - تجمّع نتائج الوكلاء في استجابة واحدة متماسكة.
  - تُسجّل التكلفة وزمن الاستجابة في طبقة المراقبة.

${SMART_AGENT_GUIDELINES}`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
      ...globalGraphTools,
      ...smartTools(),
      ...executorTools([
        'legal_create_contract_draft',
        'legal_send_for_signature',
        'legal_log_compliance_check',
        'send_email',
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
  