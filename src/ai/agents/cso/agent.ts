import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CSO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export interface CSOInput {
  message: string;
  industry?: string;
  currentStage?: 'idea' | 'startup' | 'growth' | 'scale';
  horizonYears?: 1 | 3 | 5 | 10;
  focusArea?: 'opportunity' | 'expansion' | 'investor' | 'innovation' | 'general';
}

export async function csoAgentAction(input: CSOInput): Promise<string> {
  return instrumentAgent(
    'cso_agent',
    async () => {
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon
        ? `${CSO_SYSTEM_PROMPT}\n\n${learnedAddon}`
        : CSO_SYSTEM_PROMPT;

      const { text } = await generateText({
        model: MODELS.PRO,
        system: systemPrompt,
        prompt: `القطاع: ${input.industry || 'غير محدد'}
مرحلة الشركة: ${input.currentStage || 'غير محددة'}
أفق التخطيط: ${input.horizonYears || 3} سنوات
مجال التركيز الاستراتيجي: ${input.focusArea || 'عام'}
الطلب الاستراتيجي: ${input.message}

قدّم رؤية استراتيجية تشمل:
1. قراءة المشهد الحالي والاتجاهات المستقبلية
2. الفرص الاستراتيجية المُكتشَفة (مرتبة حسب الأثر)
3. التحديات والمخاطر الاستراتيجية
4. الخيارات الاستراتيجية مع المقايضات
5. التوصية الاستراتيجية المُفضَّلة وخارطة التنفيذ`,
      });

      return text;
    },
    { model: 'gemini-pro', input, toolsUsed: ['cso.analyze', 'cso.opportunity'] }
  );
}
