import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { DIGITAL_TWIN_PROMPT } from './prompt';
import { runCypher, isNeo4jConfigured } from './neo4j-client';

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
      execute: async ({ startupId, entities, relationships }: {
        startupId: string;
        entities: Array<{ type: string; properties: Record<string, unknown> }>;
        relationships: Array<{ from: string; to: string; type: string }>;
      }) => {
        if (!isNeo4jConfigured()) {
          throw new Error(
            '[graph-builder] Neo4j credentials are not configured. ' +
            'Set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD to enable the Digital Twin.'
          );
        }

        const createdNodes: string[] = [];
        const createdRels: string[] = [];
        const errors: string[] = [];

        for (const entity of entities) {
          const { type, properties } = entity;
          const name = (properties.name as string) || 'unknown';
          try {
            await runCypher(
              `MERGE (n:${type} {startupId: $startupId, name: $name})
               ON CREATE SET n.createdAt = datetime(), n.updatedAt = datetime(), n.confidence = $confidence
               ON MATCH  SET n.updatedAt = datetime(), n.confidence = $confidence
               SET n += $props`,
              {
                startupId,
                name,
                confidence: (properties.confidence as number) ?? 0.8,
                props: { ...properties, startupId },
              }
            );
            createdNodes.push(`${type}:${name}`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`Failed to merge ${type}:${name} — ${msg}`);
            console.error(`[graph-builder] MERGE node error:`, msg);
          }
        }

        for (const rel of relationships) {
          try {
            const safeType = rel.type.replace(/[^A-Z_]/gi, '_').toUpperCase();
            await runCypher(
              `MATCH (a {startupId: $startupId, name: $from})
               MATCH (b {startupId: $startupId, name: $to})
               MERGE (a)-[:${safeType}]->(b)`,
              { startupId, from: rel.from, to: rel.to }
            );
            createdRels.push(`${rel.from}-[${safeType}]->${rel.to}`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`Failed to merge rel ${rel.from}->${rel.to} — ${msg}`);
            console.error(`[graph-builder] MERGE relationship error:`, msg);
          }
        }

        if (errors.length > 0) {
          console.warn(`[graph-builder] Completed with ${errors.length} error(s):`, errors);
        }

        return {
          success: errors.length === 0,
          nodesCreated: createdNodes,
          relationshipsCreated: createdRels,
          errors,
        };
      },
    },
  },
});
