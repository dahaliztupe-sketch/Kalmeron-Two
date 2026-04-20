// @ts-nocheck
import { generateObject, generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { SUCCESS_MUSEUM_SYSTEM_PROMPT } from './prompt';
import { z } from 'zod';
import { searchKnowledge } from '@/src/lib/rag';
import { unstable_cache } from 'next/cache';

// 1. هيكل مخرجات تحليل الشركة
export const CompanyAnalysisSchema = z.object({
  companyName: z.string(),
  sector: z.string(),
  founded: z.string(),
  overview: z.string(),
  growthTimeline: z.array(z.object({
    year: z.string(),
    event: z.string(),
  })),
  successFactors: z.array(z.string()),
  lessonsForEgyptianEntrepreneurs: z.array(z.string()),
  keyTakeaways: z.string(),
});

export type CompanyAnalysis = z.infer<typeof CompanyAnalysisSchema>;

/**
 * Success Museum Agent using Gemini 3 Flash & RAG.
 * Cached for 24 hours to reduce repetitive costs.
 */
export const analyzeCompany = unstable_cache(
  async (companyName: string, userContext?: string): Promise<CompanyAnalysis> => {
    const internalData = await searchKnowledge(companyName, 'success');

    const prompt = `
  قم بتحليل شركة "${companyName}" بشكل استراتيجي.
  ${userContext ? `معلومات إضافية عن المستخدم: ${userContext}` : ''}

  بيانات إضافية من الأرشيف:
  ${internalData}

  ركز على الدروس التي يمكن لرائد أعمال مصري أن يستفيد منها.
  `;

    const { object } = await generateObject({
      model: MODELS.FLASH,
      system: SUCCESS_MUSEUM_SYSTEM_PROMPT,
      prompt: prompt,
      schema: CompanyAnalysisSchema,
    });

    return object;
  },
  ['company-analysis'],
  { revalidate: 86400 } // 24 Hours
);

export const suggestCompanies = unstable_cache(
  async (userIndustry: string, userStage: string): Promise<string[]> => {
    const prompt = `
  مستخدم في قطاع "${userIndustry}" وفي مرحلة "${userStage}".
  اقترح 5 شركات (مصرية أو عالمية) يمكن أن تكون تحليلاتها مفيدة جداً لهذا المستخدم. قدم الأسماء فقط.
  `;

    const result = await generateText({
      model: MODELS.FLASH,
      system: SUCCESS_MUSEUM_SYSTEM_PROMPT,
      prompt: prompt,
    });

    return result.text.split('\n').filter(name => name.trim() !== '');
  },
  ['company-suggestions'],
  { revalidate: 86400 }
);
