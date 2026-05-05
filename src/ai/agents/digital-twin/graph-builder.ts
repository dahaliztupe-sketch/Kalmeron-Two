import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { DIGITAL_TWIN_PROMPT } from './prompt';

// Note: Requires neo4j-driver to be installed
// import neo4j from 'neo4j-driver';

export const graphBuilderAgent = new Agent({
  id: 'graph-builder-agent',
  name: 'Graph Builder Agent',
  instructions: `${DIGITAL_TWIN_PROMPT}

## التخصص: بناء الرسم البياني المعرفي
مهمتك: استقبال المعلومات المستخرجة من وكلاء الاستخراج وتحويلها إلى عقد وعلاقات في Neo4j لبناء التوأم الرقمي الكامل للشركة.

قواعد البناء:
- تأكد من عدم تكرار العقد (استخدم MERGE بدلاً من CREATE)
- حافظ على سلامة العلاقات (تأكد من وجود العقد قبل إنشاء العلاقات)
- أضف طوابع زمنية ودرجات ثقة لكل تحديث
- نوع العلاقة يجب أن يعكس طبيعتها: HAS_PRODUCT, COMPETES_WITH, TARGETS_SEGMENT, ACHIEVES_METRIC`,
  model: google('gemini-2.5-flash'),
  tools: {
    build_graph: {
      description: 'بناء أو تحديث الرسم البياني المعرفي',
      parameters: z.object({
        startupId: z.string(),
        entities: z.array(z.object({
          type: z.enum(['Startup', 'Founder', 'Product', 'Competitor', 'Customer', 'Metric', 'Milestone']),
          properties: z.record(z.string(), z.any()),
        })),
        relationships: z.array(z.object({
          from: z.string(),
          to: z.string(),
          type: z.string(),
        })),
      }),
      execute: async ({ startupId, entities, relationships }: { startupId: string; entities: Array<{ type: string; properties: Record<string, unknown> }>; relationships: Array<{ from: string; to: string; type: string }> }) => {
        return { success: false, message: 'Neo4j driver not yet installed/configured' };
      },
    },
  },
});
