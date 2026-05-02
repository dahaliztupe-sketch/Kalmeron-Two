// @ts-nocheck
/**
 * Company Culture Expert — خبير الثقافة المؤسسية
 * Department: الموارد البشرية | Reports to: CHRO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { CULTURE_EXPERT_PROMPT } from './prompt';
const SYSTEM_PROMPT = CULTURE_EXPERT_PROMPT;


export async function cultureExpertAction(input: {
  task: 'define-values' | 'design-onboarding' | 'culture-survey' | 'recognition-program' | 'employer-branding';
  companyDescription?: string;
  currentChallenges?: string[];
  teamSize?: number;
  stage?: string;
}) {
  return instrumentAgent('culture_expert', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الشركة: ${input.companyDescription || 'شركة ناشئة'}
التحديات الحالية: ${input.currentChallenges?.join('، ') || 'لا توجد'}
حجم الفريق: ${input.teamSize || 'غير محدد'} شخص
المرحلة: ${input.stage || 'نمو'}`,
    });

    return { plan: text, agentId: 'culture-expert', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['hr.culture'] });
}
