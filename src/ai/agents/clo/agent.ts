import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CLO_SYSTEM_PROMPT } from './prompt';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export interface CLOInput {
  message: string;
  companyType?: string;
  jurisdiction?: 'egypt' | 'uae' | 'ksa' | 'international';
  urgency?: 'low' | 'medium' | 'high';
}

export async function cloAgentAction(input: CLOInput): Promise<string> {
  return instrumentAgent(
    'clo_agent',
    async () => {
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon
        ? `${CLO_SYSTEM_PROMPT}\n\n${learnedAddon}`
        : CLO_SYSTEM_PROMPT;

      const { text } = await generateText({
        model: MODELS.FLASH,
        system: systemPrompt,
        prompt: `نوع الكيان القانوني: ${input.companyType || 'غير محدد'}
الاختصاص القانوني: ${input.jurisdiction || 'مصر'}
درجة الإلحاح: ${input.urgency || 'متوسطة'}
الاستفسار القانوني: ${input.message}

قدّم تحليلاً قانونياً استرشادياً يشمل:
1. الإطار القانوني المنطبق
2. المخاطر القانونية المحتملة
3. الخيارات المتاحة مرتبة حسب الأمان
4. الخطوات التالية الموصى بها
5. تنبيه: هذا التحليل استرشادي ويحتاج لمراجعة محامٍ مرخص`,
      });

      return text;
    },
    { model: 'gemini-flash', input, toolsUsed: ['clo.analyze', 'clo.compliance'] }
  );
}
