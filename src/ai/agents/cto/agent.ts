import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CTO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export interface CTOInput {
  message: string;
  currentTechStack?: string;
  teamSize?: number;
  stage?: 'mvp' | 'launch' | 'growth' | 'scale';
  budget?: string;
}

export async function ctoAgentAction(input: CTOInput): Promise<string> {
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
