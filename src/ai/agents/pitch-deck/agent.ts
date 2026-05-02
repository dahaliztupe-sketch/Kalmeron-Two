// @ts-nocheck
/**
 * Pitch Deck Creator — منشئ عروض الاستثمار
 * Department: المبيعات + الاستراتيجية | Reports to: CSO/CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { PITCH_DECK_PROMPT } from './prompt';
const SYSTEM_PROMPT = PITCH_DECK_PROMPT;


export async function pitchDeckAction(input: {
  business: {
    name: string;
    sector: string;
    problem: string;
    solution: string;
    revenue?: number;
    growthRate?: number;
    teamDescription?: string;
    fundingAsk?: number;
    stage?: string;
  };
  targetInvestors?: string;
  format?: 'outline' | 'full-narrative' | 'slide-by-slide';
}) {
  return instrumentAgent('pitch_deck', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `اصنع عرض استثماري ${input.format === 'outline' ? 'مخططًا' : input.format === 'slide-by-slide' ? 'شريحة بشريحة' : 'شاملاً'} للشركة:
${JSON.stringify(input.business, null, 2)}
المستهدفون: ${input.targetInvestors || 'مستثمرون ملاك ومحافظ استثمارية في مصر'}`,
    });

    return { deck: text, agentId: 'pitch-deck', format: input.format || 'full-narrative' };
  }, { model: 'gemini-pro', input, toolsUsed: ['sales.pitch'] });
}
