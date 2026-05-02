// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { OPERATIONS_MANAGER_PROMPT } from './prompt';

export async function operationsManagerAction(challenge: string, context?: string) {
  return instrumentAgent(
    'operations_manager',
    async () => {
      c
      const baseSystem = OPERATIONS_MANAGER_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;
      const prompt = context
        ? `التحدي التشغيلي: "${challenge}". السياق: "${context}". ساعدني بحل تشغيلي فعّال.`
        : `التحدي التشغيلي: "${challenge}". ساعدني بتحسين العمليات وتجاوز هذا التحدي.`;
      const { text } = await generateText({ model: MODELS.FLASH, system, prompt });
      return text;
    },
    { model: 'gemini-flash', input: { challenge, context }, toolsUsed: ['operations.optimize'] }
  );
}
