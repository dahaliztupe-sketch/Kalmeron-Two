import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { LEGAL_KNOWLEDGE } from './knowledge-base';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { LEGAL_GUIDE_PROMPT } from './prompt';
import { z } from 'zod';

export const LegalQuerySchema = z.object({
  query: z.string().min(5, 'الاستفسار القانوني قصير جداً'),
  context: z.string().optional(),
  legalArea: z.enum(['company_law', 'labor_law', 'contracts', 'ip', 'tax', 'real_estate', 'general']).optional(),
});

export type LegalQueryInput = z.infer<typeof LegalQuerySchema>;

export async function legalGuideAction(query: string, context?: string): Promise<string> {
  return instrumentAgent(
    'legal_guide',
    async () => {
      const baseSystem = LEGAL_GUIDE_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const fullQuery = context ? `السياق: ${context}\n\nالاستفسار: ${query}` : query;
      const { text } = await generateText({
        model: MODELS.PRO,
        system,
        prompt: fullQuery,
      });
      return text;
    },
    { model: 'gemini-pro', input: { query }, toolsUsed: ['legal.knowledge_base', 'legal.egypt_law'] }
  );
}
