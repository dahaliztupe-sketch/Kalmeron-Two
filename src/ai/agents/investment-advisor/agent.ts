// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { INVESTMENT_ADVISOR_PROMPT } from './prompt';

export async function investmentAdvisorAction(business: string, stage?: string, amount?: string) {
  return instrumentAgent(
    'investment_advisor',
    async () => {
      const baseSystem = INVESTMENT_ADVISOR_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const parts = [`شركتي تعمل في "${business}"`];
      if (stage) parts.push(`وهي في مرحلة "${stage}"`);
      if (amount) parts.push(`أبحث عن تمويل "${amount}"`);
      parts.push(`ساعدني في استراتيجية جذب المستثمرين والتقييم المناسب.`);
      const { text } = await generateText({ model: MODELS.PRO, system, prompt: parts.join('. ') });
      return text;
    },
    { model: 'gemini-pro', input: { business, stage, amount }, toolsUsed: ['investment.advisory'] }
  );
}
