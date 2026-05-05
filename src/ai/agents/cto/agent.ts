import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CTO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { z } from 'zod';

export const CTOInputSchema = z.object({
  message: z.string().min(1).max(5000),
  currentTechStack: z.string().max(500).optional(),
  teamSize: z.number().int().positive().max(10000).optional(),
  stage: z.enum(['mvp', 'launch', 'growth', 'scale']).optional(),
  budget: z.string().max(100).optional(),
});

export type CTOInput = z.infer<typeof CTOInputSchema>;

export async function ctoAgentAction(input: CTOInput): Promise<string> {
  CTOInputSchema.parse(input);
  return instrumentAgent(
    'cto_agent',
    async () => {
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon
        ? `${CTO_SYSTEM_PROMPT}\n\n${learnedAddon}`
        : CTO_SYSTEM_PROMPT;

      const { text } = await generateText({
        model: MODELS.FLASH,
        system: systemPrompt,
        prompt: `Stack الحالي: ${input.currentTechStack || 'غير محدد'}
حجم الفريق التقني: ${input.teamSize || 'غير محدد'}
مرحلة المنتج: ${input.stage || 'غير محددة'}
الميزانية: ${input.budget || 'غير محددة'}
الطلب التقني: ${input.message}

قدّم توجيهاً تقنياً شاملاً يتضمن:
1. تقييم الوضع التقني الحالي
2. التوصية التقنية مع التبرير
3. المقايضات (Trade-offs) والمخاطر
4. خارطة تقنية للتنفيذ
5. مؤشرات النجاح التقني`,
      });

      return text;
    },
    { model: 'gemini-flash', input, toolsUsed: ['cto.assess', 'cto.recommend'] }
  );
}
