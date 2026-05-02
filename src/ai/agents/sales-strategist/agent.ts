// @ts-nocheck
/**
 * Sales Strategy Developer — مطوّر استراتيجية المبيعات
 * Department: المبيعات | Reports to: CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { SALES_STRATEGIST_PROMPT } from './prompt';
const SYSTEM_PROMPT = SALES_STRATEGIST_PROMPT;


export async function salesStrategistAction(input: {
  task: 'gtm-strategy' | 'sales-playbook' | 'pricing-strategy' | 'channel-strategy' | 'team-structure';
  businessModel?: string;
  targetMarket?: string;
  currentRevenue?: number;
  competitiveLandscape?: string;
  stage?: string;
}) {
  return instrumentAgent('sales_strategist', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `ضع ${input.task === 'gtm-strategy' ? 'استراتيجية Go-to-Market' : input.task === 'sales-playbook' ? 'Playbook مبيعات' : input.task === 'pricing-strategy' ? 'استراتيجية تسعير' : input.task === 'channel-strategy' ? 'استراتيجية قنوات التوزيع' : 'هيكل فريق المبيعات'} للشركة:
نموذج الأعمال: ${input.businessModel || 'غير محدد'}
السوق المستهدف: ${input.targetMarket || 'الشركات في مصر'}
الإيراد الحالي: ${input.currentRevenue ? input.currentRevenue.toLocaleString('ar-EG') + ' جنيه/شهر' : 'Pre-revenue'}
المرحلة: ${input.stage || 'Seed'}
المنافسون: ${input.competitiveLandscape || 'غير محدد'}`,
    });

    return { strategy: text, agentId: 'sales-strategist', task: input.task };
  }, { model: 'gemini-pro', input, toolsUsed: ['sales.strategy'] });
}
