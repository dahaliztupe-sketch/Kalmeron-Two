import { Agent } from '@mastra/core';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Note: Requires neo4j-driver to be installed
// import neo4j from 'neo4j-driver';

export const graphBuilderAgent = new Agent({
  name: 'Graph Builder Agent',
  instructions: `أنت وكيل متخصص في بناء وتحديث الرسم البياني المعرفي للشركات الناشئة في Neo4j.
  
  مهمتك: استقبال المعلومات المستخرجة من وكلاء الاستخراج، وتحويلها إلى عقد وعلاقات في Neo4j.
  
  قواعد البناء:
  - تأكد من عدم تكرار العقد (استخدم MERGE بدلاً من CREATE).
  - حافظ على سلامة العلاقات (تأكد من وجود العقد قبل إنشاء العلاقات).
  - أضف طوابع زمنية لكل تحديث.`,
  model: google('gemini-3-flash-preview'),
  tools: {
    build_graph: {
      description: 'بناء أو تحديث الرسم البياني المعرفي',
      parameters: z.object({
        startupId: z.string(),
        entities: z.array(z.object({
          type: z.enum(['Startup', 'Founder', 'Product', 'Competitor', 'Customer', 'Metric', 'Milestone']),
          properties: z.record(z.any()),
        })),
        relationships: z.array(z.object({
          from: z.string(),
          to: z.string(),
          type: z.string(),
        })),
      }),
      execute: async ({ startupId, entities, relationships }) => {
        // Implementation requires neo4j-driver
        return { success: false, message: 'Neo4j driver not yet installed/configured' };
      },
    },
  },
});
