// @ts-nocheck
/**
 * Graph Tools — أدوات يستخدمها كل وكيل للقراءة/الكتابة في الدماغ المشترك.
 * يتم تمرير userId من سياق التشغيل.
 */
import { z } from 'zod';
import {
  addEntity,
  addRelationship,
  searchEntities,
  getProjectOverview,
  isKnowledgeGraphEnabled,
} from './knowledge-graph';

export function buildGraphTools(userId: string) {
  return {
    search_knowledge: {
      description: 'يبحث في الدماغ المشترك عن كيانات مرتبطة بمشروع المستخدم.',
      parameters: z.object({ term: z.string(), limit: z.number().int().min(1).max(50).default(20) }),
      execute: async ({ term, limit }) => {
        const enabled = await isKnowledgeGraphEnabled();
        if (!enabled) return { enabled: false, results: [] };
        const results = await searchEntities(userId, term, limit);
        return { enabled: true, results: results || [] };
      },
    },
    add_finding: {
      description: 'يضيف معرفة جديدة (عقدة) إلى الدماغ المشترك ويربطها بالمشروع.',
      parameters: z.object({
        type: z.string().describe('نوع الكيان: Lead, Insight, Competitor, Customer, Risk, ...'),
        properties: z.record(z.string(), z.any()).describe('خصائص الكيان (name, description, source, ...)'),
        linkTo: z.string().optional().describe('id لعقدة موجودة لربطها بهذه العقدة الجديدة'),
        relationType: z.string().default('RELATED_TO'),
      }),
      execute: async ({ type, properties, linkTo, relationType }) => {
        const enabled = await isKnowledgeGraphEnabled();
        if (!enabled) return { enabled: false, stored: false };
        const node = await addEntity(userId, type, properties);
        if (linkTo && node?.id) {
          await addRelationship(userId, node.id, linkTo, relationType);
        }
        return { enabled: true, stored: true, node };
      },
    },
    get_project_overview: {
      description: 'يسترجع جميع العقد والعلاقات المرتبطة بمشروع المستخدم.',
      parameters: z.object({ limit: z.number().int().min(1).max(500).default(200) }),
      execute: async ({ limit }) => {
        const enabled = await isKnowledgeGraphEnabled();
        if (!enabled) return { enabled: false, nodes: [], edges: [] };
        const overview = await getProjectOverview(userId, limit);
        return { enabled: true, ...(overview || { nodes: [], edges: [] }) };
      },
    },
  };
}

export type GraphTools = ReturnType<typeof buildGraphTools>;

/**
 * Stateless variant مناسبة لوكلاء Mastra الذين يُنشَؤون مرة واحدة دون سياق userId.
 * يُمرَّر userId كمعامل لكل أداة، فيستطيع نموذج اللغة قراءة/كتابة في الدماغ المشترك
 * نيابةً عن أي مستخدم نشط.
 */
export const globalGraphTools = {
  kg_search: {
    description: 'يبحث في الدماغ المشترك (Neo4j) عن كيانات مرتبطة بمشروع مستخدم معيّن.',
    parameters: z.object({
      userId: z.string().describe('معرّف المستخدم/المشروع'),
      term: z.string(),
      limit: z.number().int().min(1).max(50).default(20),
    }),
    execute: async ({ userId, term, limit }: unknown) => {
      if (!(await isKnowledgeGraphEnabled())) return { enabled: false, results: [] };
      return { enabled: true, results: (await searchEntities(userId, term, limit)) || [] };
    },
  },
  kg_add_finding: {
    description: 'يضيف معرفة جديدة (عقدة) إلى الدماغ المشترك ويربطها بالمشروع.',
    parameters: z.object({
      userId: z.string(),
      type: z.string(),
      properties: z.record(z.string(), z.any()),
      linkTo: z.string().optional(),
      relationType: z.string().default('RELATED_TO'),
    }),
    execute: async ({ userId, type, properties, linkTo, relationType }: unknown) => {
      if (!(await isKnowledgeGraphEnabled())) return { enabled: false, stored: false };
      const node = await addEntity(userId, type, properties);
      if (linkTo && node?.id) await addRelationship(userId, node.id, linkTo, relationType);
      return { enabled: true, stored: true, node };
    },
  },
  kg_overview: {
    description: 'يسترجع جميع العقد والعلاقات المرتبطة بمشروع المستخدم.',
    parameters: z.object({
      userId: z.string(),
      limit: z.number().int().min(1).max(500).default(200),
    }),
    execute: async ({ userId, limit }: unknown) => {
      if (!(await isKnowledgeGraphEnabled())) return { enabled: false, nodes: [], edges: [] };
      return { enabled: true, ...((await getProjectOverview(userId, limit)) || { nodes: [], edges: [] }) };
    },
  },
};
