// @ts-nocheck
import { generateObject, streamText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { PLAN_BUILDER_SYSTEM_PROMPT } from './prompt';
import { z } from 'zod';
import { searchKnowledge } from '@/src/lib/rag';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';

// 1. هيكل مخرجات خطة العمل
export const BusinessPlanSchema = z.object({
  executiveSummary: z.string(),
  problemStatement: z.string(),
  solution: z.string(),
  targetMarket: z.object({
    description: z.string(),
    size: z.string(),
    demographics: z.string(),
  }),
  businessModel: z.string(),
  marketingStrategy: z.string(),
  operationalStructure: z.string(),
  financialProjections: z.object({
    year1: z.object({ revenue: z.number(), expenses: z.number(), profit: z.number() }),
    year2: z.object({ revenue: z.number(), expenses: z.number(), profit: z.number() }),
    year3: z.object({ revenue: z.number(), expenses: z.number(), profit: z.number() }),
  }),
  pitchDeckOutline: z.array(z.object({
    slideNumber: z.number(),
    title: z.string(),
    content: z.string(),
  })),
});

export type BusinessPlan = z.infer<typeof BusinessPlanSchema>;

/**
 * High-Reasoning Business Plan Agent using Gemini 3.1 Pro.
 */
export async function buildBusinessPlanStream(projectInfo: string, conversationHistory: unknown[]) {
  return instrumentAgent('plan_builder', async () => {
    // RAG: Search for industry benchmarks or similar business models
    const benchmarks = await searchKnowledge(projectInfo);

    const prompt = `
المعلومات المتوفرة عن المشروع:
${projectInfo}

مقاييس مرجعية (Benchmarks) للسياق:
${benchmarks}

قم ببناء خطة عمل شاملة وفائقة الذكاء. استخدم قدراتك في الاستدلال (Reasoning) لتوليد أرقام وتوقعات مالية واقعية جداً للسوق المصري في 2026.
`;

    return streamText({
      model: MODELS.PRO,
      system: PLAN_BUILDER_SYSTEM_PROMPT,
      messages: [
          ...conversationHistory,
          { role: 'user', content: prompt }
      ],
    });
  }, { model: 'gemini-pro', input: { projectInfo }, toolsUsed: ['rag.search', 'stream.text'] });
}

export async function generateStructuredPlan(projectInfo: string): Promise<BusinessPlan> {
  const { object } = await generateObject({
    model: MODELS.PRO,
    system: PLAN_BUILDER_SYSTEM_PROMPT,
    prompt: `قم بإنشاء خطة عمل منظمة لهذا المشروع: ${projectInfo}`,
    schema: BusinessPlanSchema,
  });

  return object;
}
