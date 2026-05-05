import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { MARKETING_STRATEGIST_PROMPT } from './prompt';
import { z } from 'zod';

export const MarketingInputSchema = z.object({
  business: z.string().min(3).max(2000),
  budget: z.string().max(200).optional(),
  goals: z.string().max(1000).optional(),
});

export async function marketingStrategistAction(business: string, budget?: string, goals?: string): Promise<string> {
  MarketingInputSchema.parse({ business, budget, goals });
  return instrumentAgent(
    'marketing_strategist',
    async () => {
      const baseSystem = MARKETING_STRATEGIST_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const parts = [`صمّم خطة تسويق شاملة لـ "${business}"`];
      if (budget) parts.push(`بميزانية "${budget}"`);
      if (goals) parts.push(`الهدف: "${goals}"`);
      const { text } = await generateText({ model: MODELS.PRO, system, prompt: parts.join('. ') });
      return text;
    },
    { model: 'gemini-pro', input: { business, budget, goals }, toolsUsed: ['marketing.strategy'] }
  );
}
