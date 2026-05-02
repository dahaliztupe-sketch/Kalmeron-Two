// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { LEGAL_KNOWLEDGE } from './knowledge-base';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { LEGAL_GUIDE_PROMPT } from './prompt';

export async function legalGuideAction(query: string) {
  return instrumentAgent(
    'legal_guide',
    async () => {
      const baseSystem = LEGAL_GUIDE_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const { text } = await generateText({
        model: MODELS.PRO,
        system: learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem,
        prompt: query,
      });
      return text;
    },
    { model: 'gemini-pro', input: query, toolsUsed: ['legal.knowledge_base'] }
  );
}
