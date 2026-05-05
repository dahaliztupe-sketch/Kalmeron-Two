import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { OPERATIONS_MANAGER_PROMPT } from './prompt';
import { z } from 'zod';

export const OperationsInputSchema = z.object({
  challenge: z.string().min(5).max(5000),
  context: z.string().max(2000).optional(),
});

export async function operationsManagerAction(challenge: string, context?: string): Promise<string> {
  OperationsInputSchema.parse({ challenge, context });
  return instrumentAgent(
    'operations_manager',
    async () => {
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
