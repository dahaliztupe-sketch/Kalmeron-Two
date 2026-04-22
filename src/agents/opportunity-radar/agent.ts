// @ts-nocheck
import { generateObject, generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { OPPORTUNITY_RADAR_SYSTEM_PROMPT } from './prompt';
import { z } from 'zod';
import { searchKnowledge } from '@/src/lib/rag';
import { unstable_cache } from 'next/cache';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';

// 1. هيكل الفرصة
export const OpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['hackathon', 'competition', 'accelerator', 'conference', 'workshop', 'grant']),
  description: z.string(),
  organizer: z.string(),
  deadline: z.string(),
  location: z.string(),
  isOnline: z.boolean(),
  link: z.string().url(),
  relevanceScore: z.number().min(0).max(100),
  tags: z.array(z.string()),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;

/**
 * Opportunity Radar Agent using Gemini 3 Flash & RAG.
 * Cached for 6 hours to balance fresh data and cost.
 */
export const getPersonalizedOpportunities = unstable_cache(
  async (
    userIndustry: string,
    userStage: string,
    userGovernorate: string
  ): Promise<Opportunity[]> => {
    return instrumentAgent('opportunity_radar', async () => {
      const latestUpdates = await searchKnowledge(`${userIndustry} ${userStage} مصر`, 'opportunity');

      const prompt = `
  قم بتجميع قائمة من 5-10 فرص مناسبة لرائد أعمال مصري في قطاع "${userIndustry}" وفي مرحلة "${userStage}" ومقيم في "${userGovernorate}".

  بيانات من قاعدة المعرفة:
  ${latestUpdates}

  يجب أن تكون الفرص حديثة (مواعيدها النهائية لم تنتهِ بعد).
  قدم النتيجة بتنسيق JSON منظم.
  `;

      const { object } = await generateObject({
        model: MODELS.FLASH,
        system: OPPORTUNITY_RADAR_SYSTEM_PROMPT,
        prompt: prompt,
        schema: z.array(OpportunitySchema),
      });

      return object;
    }, { model: 'gemini-flash', input: { userIndustry, userStage, userGovernorate }, toolsUsed: ['rag.search'] });
  },
  ['personalized-opportunities'],
  { revalidate: 21600 } // 6 Hours
);

export async function getOpportunityDetails(opportunityId: string): Promise<string> {
  const prompt = `
قدم شرحاً مفصلاً للفرصة التالية: "${opportunityId}".
اذكر: وصفاً كاملاً، شروط التقديم، الجوائز أو المزايا، ونصائح لتقديم طلب قوي.
استخدم أحدث البيانات المتاحة في السوق المصري لعام 2026.
`;

  const result = await generateText({
    model: MODELS.FLASH,
    system: OPPORTUNITY_RADAR_SYSTEM_PROMPT,
    prompt: prompt,
  });

  return result.text;
}
