// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { BRAND_BUILDER_PROMPT } from './prompt';

export async function brandBuilderAction(businessName: string, description: string) {
  return instrumentAgent(
    'brand_builder',
    async () => {
      const baseSystem = BRAND_BUILDER_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = `ساعدني في بناء هوية علامة تجارية قوية لـ "${businessName}": ${description}`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { businessName, description }, toolsUsed: ['brand.strategy'] }
  );
}
