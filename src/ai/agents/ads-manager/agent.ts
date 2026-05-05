/**
 * Ads Campaign Manager — مدير الحملات الإعلانية
 * Department: التسويق | Reports to: CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { ADS_MANAGER_PROMPT } from './prompt';
const SYSTEM_PROMPT = ADS_MANAGER_PROMPT;


export async function adsManagerAction(input: {
  task: 'plan-campaign' | 'analyze-performance' | 'optimize-budget' | 'write-ad-copy' | 'targeting-strategy';
  platform?: string;
  budget?: number;
  objective?: string;
  audience?: string;
  performanceData?: Record<string, unknown>;
  product?: string;
}) {
  return instrumentAgent('ads_manager', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
المنصة: ${input.platform || 'Facebook/Instagram'}
الميزانية: ${input.budget ? input.budget.toLocaleString('ar-EG') + ' جنيه/شهر' : 'غير محددة'}
الهدف: ${input.objective || 'غير محدد'}
الجمهور المستهدف: ${input.audience || 'غير محدد'}
المنتج/الخدمة: ${input.product || 'غير محدد'}
بيانات الأداء: ${JSON.stringify(input.performanceData || {}, null, 2)}`,
    });

    return { plan: text, agentId: 'ads-manager', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['marketing.ads'] });
}
