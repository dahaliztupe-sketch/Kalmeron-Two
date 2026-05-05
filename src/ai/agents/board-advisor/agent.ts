import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { BOARD_ADVISOR_PROMPT } from './prompt';

export async function boardAdvisorAction(question: string, context?: string) {
  return instrumentAgent(
    'board_advisor',
    async () => {
      const baseSystem = BOARD_ADVISOR_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = context
        ? `السياق: "${context}". السؤال الاستراتيجي: "${question}"`
        : `السؤال الاستراتيجي: "${question}"`;
      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { question, context }, toolsUsed: ['strategy.advisory'] }
  );
}
