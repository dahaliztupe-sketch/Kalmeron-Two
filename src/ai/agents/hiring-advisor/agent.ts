import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { HIRING_ADVISOR_PROMPT } from './prompt';

export async function hiringAdvisorAction(role: string, stage?: string, budget?: string) {
  return instrumentAgent(
    'hiring_advisor',
    async () => {
      const baseSystem = HIRING_ADVISOR_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const parts = [`تحتاج إلى توظيف "${role}"`];
      if (stage) parts.push(`في مرحلة "${stage}"`);
      if (budget) parts.push(`بميزانية "${budget}"`);
      parts.push(`في السوق المصري. ساعدني باستراتيجية توظيف مناسبة.`);
      const { text } = await generateText({ model: MODELS.FLASH, system, prompt: parts.join(' ') });
      return text;
    },
    { model: 'gemini-flash', input: { role, stage, budget }, toolsUsed: ['hiring.advice'] }
  );
}
