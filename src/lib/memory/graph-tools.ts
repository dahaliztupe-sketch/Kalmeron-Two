// @ts-nocheck
/**
 * Graph Tools — Knowledge Graph has been removed.
 * All tools return { enabled: false } as the disabled-path fallback.
 * This file is kept for backward-compatibility with agent imports.
 */
import { z } from 'zod';

export function buildGraphTools(_userId: string) {
  return {
    search_knowledge: {
      description: 'يبحث في الدماغ المشترك عن كيانات مرتبطة بمشروع المستخدم.',
      parameters: z.object({ term: z.string(), limit: z.number().int().min(1).max(50).default(20) }),
      execute: async () => ({ enabled: false, results: [] }),
    },
    add_finding: {
      description: 'يضيف معرفة جديدة (عقدة) إلى الدماغ المشترك ويربطها بالمشروع.',
      parameters: z.object({
        type: z.string().describe('نوع الكيان'),
        properties: z.record(z.string(), z.any()),
        linkTo: z.string().optional(),
        relationType: z.string().default('RELATED_TO'),
      }),
      execute: async () => ({ enabled: false, stored: false }),
    },
    get_project_overview: {
      description: 'يسترجع جميع العقد والعلاقات المرتبطة بمشروع المستخدم.',
      parameters: z.object({ limit: z.number().int().min(1).max(500).default(200) }),
      execute: async () => ({ enabled: false, nodes: [], edges: [] }),
    },
  };
}

export type GraphTools = ReturnType<typeof buildGraphTools>;

export const globalGraphTools = {
  kg_search: {
    description: 'يبحث في الدماغ المشترك عن كيانات (معطّل).',
    parameters: z.object({
      userId: z.string(),
      term: z.string(),
      limit: z.number().int().min(1).max(50).default(20),
    }),
    execute: async () => ({ enabled: false, results: [] }),
  },
  kg_add_finding: {
    description: 'يضيف معرفة جديدة إلى الدماغ المشترك (معطّل).',
    parameters: z.object({
      userId: z.string(),
      type: z.string(),
      properties: z.record(z.string(), z.any()),
      linkTo: z.string().optional(),
      relationType: z.string().default('RELATED_TO'),
    }),
    execute: async () => ({ enabled: false, stored: false }),
  },
  kg_overview: {
    description: 'يسترجع جميع العقد والعلاقات (معطّل).',
    parameters: z.object({
      userId: z.string(),
      limit: z.number().int().min(1).max(500).default(200),
    }),
    execute: async () => ({ enabled: false, nodes: [], edges: [] }),
  },
};
