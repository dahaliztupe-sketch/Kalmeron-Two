// @ts-nocheck
import { globalGraphTools } from '@/src/lib/memory/graph-tools';
  import { Agent } from '@mastra/core';
  import { z } from 'zod';
  import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';

  /**
   * HR Orchestrator — منسق قسم الموارد البشرية والعمليات
   * النمط: Supervisor (Hub-and-Spoke)
   * يدير 5 وكيل متخصص.
   */
  export const hrOrchestratorAgent = new Agent({
    name: 'HR Orchestrator',
    instructions: `أنت منسق قسم الموارد البشرية والعمليات في كلميرون تو.
  مهمتك: بناء وإدارة فريق العمل والعمليات اليومية.

  الوكلاء تحت إدارتك:
  1. Org Structure Designer
2. Job Description Writer
3. Company Culture Expert
4. Operations Manager
5. Process Optimizer

  آلية العمل:
  - تستقبل المهمة من المنسق العام (Global Orchestrator).
  - تحلّل المهمة وتقرّر: تنفيذ متوازٍ (للمهام المستقلة) أم متسلسل (للمهام التابعة).
  - تجمّع نتائج الوكلاء في استجابة واحدة متماسكة.
  - تُسجّل التكلفة وزمن الاستجابة في طبقة المراقبة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
      ...globalGraphTools,
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

  export async function hrCrewRun(prompt: string) {
    return instrumentAgent('hr_crew', async () => {
      const res: any = await hrOrchestratorAgent.generate(prompt);
      return res?.text ?? res;
    }, { model: 'gemini-2.5-flash', input: { prompt }, toolsUsed: ['delegate_task', 'aggregate_results'] });
  }
  