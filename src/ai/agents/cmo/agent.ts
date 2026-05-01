import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CMO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export interface CMOInput {
  message: string;
  industry?: string;
  targetAudience?: string;
  budget?: string;
  currentStage?: 'idea' | 'launch' | 'growth' | 'scale';
}

export async function cmoAgentAction(input: CMOInput): Promise<string> {
  return instrumentAgent(
    'cmo_agent',
    async () => {
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon
        ? `${CMO_SYSTEM_PROMPT}\n\n${learnedAddon}`
        : CMO_SYSTEM_PROMPT;

      const { text } = await generateText({
        model: MODELS.FLASH,
        system: systemPrompt,
        prompt: `القطاع: ${input.industry || 'غير محدد'}
الجمهور المستهدف: ${input.targetAudience || 'غير محدد'}
الميزانية التقريبية: ${input.budget || 'غير محددة'}
مرحلة الشركة: ${input.currentStage || 'غير محددة'}
الطلب: ${input.message}

قدّم استراتيجية تسويقية عملية تشمل:
1. تحليل الجمهور وتقسيمه
2. القنوات التسويقية الموصى بها مع أولوياتها
3. الرسالة التسويقية الجوهرية (Core Message)
4. مؤشرات قياس النجاح (KPIs)
5. خارطة طريق لأول 90 يوماً`,
      });

      return text;
    },
    { model: 'gemini-flash', input, toolsUsed: ['cmo.strategy', 'cmo.brand'] }
  );
}
