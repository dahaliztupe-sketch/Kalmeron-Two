import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { EXPANSION_PLANNER_PROMPT } from './prompt';

export async function expansionPlannerAction(business: string, targetMarket: string) {
  return instrumentAgent(
    'expansion_planner',
    async () => {
      const baseSystem = EXPANSION_PLANNER_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = `شركتي في "${business}" وأريد التوسع إلى "${targetMarket}". ضع لي خطة توسع شاملة ومدروسة.`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { business, targetMarket }, toolsUsed: ['expansion.planning'] }
  );
}
