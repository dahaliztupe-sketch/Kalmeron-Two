import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CHRO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { z } from 'zod';

export const CHROInputSchema = z.object({
  message: z.string().min(1).max(5000),
  companySize: z.number().int().positive().max(100000).optional(),
  industry: z.string().max(200).optional(),
  stage: z.enum(['startup', 'growth', 'scale']).optional(),
  hrChallenge: z.enum(['hiring', 'retention', 'culture', 'performance', 'structure', 'general']).optional(),
});

export type CHROInput = z.infer<typeof CHROInputSchema>;

export async function chroAgentAction(input: CHROInput): Promise<string> {
  CHROInputSchema.parse(input);
  return instrumentAgent(
    'chro_agent',
    async () => {
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon
        ? `${CHRO_SYSTEM_PROMPT}\n\n${learnedAddon}`
        : CHRO_SYSTEM_PROMPT;

      const { text } = await generateText({
        model: MODELS.FLASH,
        system: systemPrompt,
        prompt: `حجم الشركة: ${input.companySize || 'غير محدد'} موظف
القطاع: ${input.industry || 'غير محدد'}
مرحلة الشركة: ${input.stage || 'غير محددة'}
تحدي الموارد البشرية: ${input.hrChallenge || 'عام'}
الاستفسار: ${input.message}

قدّم استراتيجية موارد بشرية عملية تتضمن:
1. تشخيص التحدي الجوهري
2. الحلول الموصى بها (قصيرة ومتوسطة المدى)
3. مؤشرات النجاح (كيف تعرف أن التحسن حقيقي؟)
4. الأدوات والنماذج الموصى بها
5. المخاطر وكيفية تجنبها`,
      });

      return text;
    },
    { model: 'gemini-flash', input, toolsUsed: ['chro.strategy', 'chro.recruit'] }
  );
}
