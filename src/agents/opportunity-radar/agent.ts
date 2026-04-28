// @ts-nocheck
import { generateObject, generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { OPPORTUNITY_RADAR_SYSTEM_PROMPT } from './prompt';
import { z } from 'zod';
import { searchKnowledge } from '@/src/lib/rag';
import { unstable_cache } from 'next/cache';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { webSearchMany, type WebSearchResult } from '@/src/lib/integrations/web-search';

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
 * Build a set of targeted web-search queries for the user's profile.
 * We fan out across opportunity categories so the LLM has a wide
 * pool of *real* listings to extract from instead of inventing names.
 */
function buildOpportunityQueries(industry: string, stage: string, governorate: string): string[] {
  const year = new Date().getFullYear();
  const ind = industry || 'تقنية';
  const gov = governorate || 'مصر';
  return [
    `فرص تمويل ومنح للشركات الناشئة في مصر ${ind} ${year}`,
    `هاكاثونات ومسابقات ريادة أعمال في مصر ${year}`,
    `حاضنات ومسرعات أعمال مصرية تقبل ${stage} ${year} (Flat6Labs OR "AUC Venture Lab" OR Falak OR ITIDA OR إبداع)`,
    `مؤتمرات وفعاليات ريادة الأعمال ${gov} ${year} (RiseUp OR "Cairo ICT" OR Techne)`,
    `Egypt startup grants accelerators ${ind} ${year} application deadline`,
  ];
}

/**
 * Format raw search citations into a compact, LLM-friendly evidence block.
 * The model is then instructed to extract structured opportunities ONLY
 * from these results.
 */
function formatSearchEvidence(search: WebSearchResult): string {
  if (!search.ok || search.citations.length === 0) {
    return '(لا توجد نتائج بحث متاحة حالياً)';
  }
  const lines = search.citations.map((c, i) => {
    const title = c.title || '(بدون عنوان)';
    const snippet = (c.snippet || '').replace(/\s+/g, ' ').slice(0, 320);
    return `[${i + 1}] ${title}\n    URL: ${c.url}\n    ${snippet}`;
  });
  const head = search.answer ? `ملخّص محرك البحث:\n${search.answer}\n\n` : '';
  return `${head}نتائج البحث (المصدر: ${search.source}):\n${lines.join('\n')}`;
}

/**
 * Opportunity Radar Agent — backed by real web search (Tavily / Serper /
 * Gemini grounded) with RAG context, and Gemini Flash for structured extraction.
 * Cached for 6 hours to balance freshness and cost.
 */
export const getPersonalizedOpportunities = unstable_cache(
  async (
    userIndustry: string,
    userStage: string,
    userGovernorate: string
  ): Promise<Opportunity[]> => {
    return instrumentAgent('opportunity_radar', async () => {
      const queries = buildOpportunityQueries(userIndustry, userStage, userGovernorate);

      // Run web search + knowledge-base lookup in parallel.
      const [search, latestUpdates] = await Promise.all([
        webSearchMany(queries, {
          maxResults: 6,
          country: 'eg',
          language: 'ar',
          searchDepth: 'advanced',
        }),
        searchKnowledge(`${userIndustry} ${userStage} مصر`, 'opportunity'),
      ]);

      const evidence = formatSearchEvidence(search);

      const prompt = `
استخرج من نتائج البحث التالية قائمة من 5-10 فرص فعليّة ومناسبة لرائد أعمال مصري في قطاع "${userIndustry}" وفي مرحلة "${userStage}" ومقيم في "${userGovernorate}".

${evidence}

سياق إضافي من قاعدة المعرفة الداخلية:
${latestUpdates}

قواعد صارمة:
- استخدم فقط الفرص المذكورة صراحة في نتائج البحث أعلاه. لا تخترع أسماء أو روابط.
- حقل "link" يجب أن يكون رابطاً ظهر فعلاً في النتائج (URL).
- حقل "organizer" يجب أن يُستنتج من اسم الموقع أو العنوان.
- إذا كان الموعد النهائي غير مذكور صراحة، اكتب "غير محدد" في حقل deadline.
- رتّب الفرص تنازلياً حسب relevanceScore (الأكثر ملاءمة لقطاع/مرحلة/موقع المستخدم أولاً).
- استبعد الفرص المنتهية صلاحيتها إذا كان التاريخ واضحاً وقد فات.
- إذا لم تجد فرصاً كافية في النتائج، أعد قائمة أقصر بدلاً من تلفيق فرص غير موجودة.
`;

      const { object } = await generateObject({
        model: MODELS.FLASH,
        system: OPPORTUNITY_RADAR_SYSTEM_PROMPT,
        prompt: prompt,
        schema: z.array(OpportunitySchema),
      });

      return object;
    }, { model: 'gemini-flash', input: { userIndustry, userStage, userGovernorate }, toolsUsed: ['rag.search', 'web.search'] });
  },
  ['personalized-opportunities-v2'],
  { revalidate: 21600 } // 6 Hours
);

export async function getOpportunityDetails(opportunityId: string): Promise<string> {
  // Pull live web context for this specific opportunity so the explanation
  // is grounded in real, up-to-date information.
  const search = await webSearchMany(
    [
      `${opportunityId} مصر شروط التقديم 2026`,
      `${opportunityId} application requirements deadline benefits`,
    ],
    { maxResults: 5, country: 'eg', language: 'ar' },
  );

  const evidence = formatSearchEvidence(search);

  const prompt = `
قدم شرحاً مفصلاً للفرصة التالية: "${opportunityId}".

نتائج البحث الحيّة عن هذه الفرصة:
${evidence}

اعتمد فقط على ما ورد في النتائج أعلاه واذكر:
- وصفاً كاملاً للفرصة.
- شروط التقديم (Eligibility).
- الجوائز أو المزايا (Benefits / Funding amount).
- المواعيد النهائية إن وُجدت.
- نصائح عملية لتقديم طلب قوي.
- في النهاية، اذكر المصادر المستخدمة كقائمة روابط.
`;

  const result = await generateText({
    model: MODELS.FLASH,
    system: OPPORTUNITY_RADAR_SYSTEM_PROMPT,
    prompt: prompt,
  });

  return result.text;
}
