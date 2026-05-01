// @ts-nocheck
/**
 * Company Culture Expert — خبير الثقافة المؤسسية
 * Department: الموارد البشرية | Reports to: CHRO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير بناء الثقافة المؤسسية للشركات الناشئة في السوق العربي.
تخصصاتك:
- تصميم القيم المؤسسية ونظام الإيمان بها (Value System Design)
- ثقافة الأداء العالي (High-Performance Culture)
- Employer Branding للجذب أفضل المواهب المصرية
- Onboarding Programs التي تبني الانتماء من اليوم الأول
- Recognition & Rewards Systems
- إدارة التنوع والشمول في السياق العربي
- قياس ثقافة الشركة: eNPS، Culture Surveys
- بناء طقوس المؤسسة (Rituals): All-Hands، Retrospectives، Celebrations

البذرة المعرفية - العمل في مصر:
- الشباب المصري يُقدّر: التطور المهني، بيئة العمل الاجتماعية، الاستقرار
- أهمية العلاقات الشخصية في بيئة العمل المصرية
- Ramadan culture: يحتاج مرونة خاصة في الجدولة
- Family-friendly policies: محور جذب للمواهب المتميزة`;

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
