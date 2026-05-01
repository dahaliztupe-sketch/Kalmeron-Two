import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CHRO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export interface CHROInput {
  message: string;
  companySize?: number;
  industry?: string;
  stage?: 'startup' | 'growth' | 'scale';
  hrChallenge?: 'hiring' | 'retention' | 'culture' | 'performance' | 'structure' | 'general';
}

export async function chroAgentAction(input: CHROInput): Promise<string> {
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
