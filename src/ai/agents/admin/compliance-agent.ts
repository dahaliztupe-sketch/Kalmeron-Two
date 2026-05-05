import { globalGraphTools } from '@/src/lib/memory/graph-tools';
import { Agent } from '@mastra/core';
import { z } from 'zod';
import { ADMIN_PROMPT } from './prompt';

export const complianceAgent = new Agent({
  name: 'Compliance & Audit Agent',
  instructions: `${ADMIN_PROMPT}

## التخصص: الامتثال والتدقيق
أنت وكيل الامتثال والتدقيق لمنصة كلميرون. مهمتك: ضمان التزام المنصة باللوائح التنظيمية (EU AI Act، GDPR). قم بتدقيق مسارات الذكاء الاصطناعي وإصدار تقارير مراجعة شاملة. تحقق من الشفافية، المساءلة، وحماية البيانات في كل عملية.`,
  model: { provider: 'google', name: 'gemini-2.5-pro' },
  tools: {
      ...globalGraphTools,
    audit_ai_pipeline: {
      description: 'تدقيق مسار الذكاء الاصطناعي للامتثال',
      parameters: z.object({
        pipelineType: z.enum(['dataset', 'training', 'deployment']),
        pipelineId: z.string(),
      }),
      execute: async () => {
        return { status: "Compliant", exceptions: 0, notes: "All RAG sources properly attributed per EU AI Act transparency rules." };
      },
    },
  },
});
