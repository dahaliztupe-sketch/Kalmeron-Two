import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { COO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

import { z } from 'zod';

export const COOInputSchema = z.object({
  message: z.string().min(1).max(5000),
  context: z.string().max(2000).optional(),
  focusArea: z.enum(['process', 'risk', 'okr', 'quality', 'general']).optional(),
  currentMetrics: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
});

export type COOInput = z.infer<typeof COOInputSchema>;

export async function cooAgentAction(input: COOInput): Promise<string> {
  return instrumentAgent(
    'coo_agent',
    async () => {
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon
        ? `${COO_SYSTEM_PROMPT}\n\n${learnedAddon}`
        : COO_SYSTEM_PROMPT;

      const metricsContext = input.currentMetrics
        ? `\nالمؤشرات الحالية: ${JSON.stringify(input.currentMetrics)}`
        : '';

      const { text } = await generateText({
        model: MODELS.FLASH,
        system: systemPrompt,
        prompt: `${metricsContext}
مجال التركيز: ${input.focusArea || 'عام'}
السياق: ${input.context || 'مشروع ريادي'}
المشكلة أو الطلب: ${input.message}

قدّم تحليلاً تشغيلياً واضحاً مع:
1. تشخيص المشكلة التشغيلية
2. الخطوات التصحيحية (من يفعل ماذا بحلول متى)
3. مؤشرات قياس النجاح (KPIs)
4. مخاطر التنفيذ وكيفية تخفيفها`,
      });

      return text;
    },
    { model: 'gemini-flash', input, toolsUsed: ['coo.analyze', 'coo.plan'] }
  );
}
