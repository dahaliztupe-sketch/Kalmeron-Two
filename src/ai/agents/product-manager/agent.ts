/**
 * Product Manager — مدير المنتج
 * Department: التقنية والمنتج | Reports to: CTO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { PRODUCT_MANAGER_PROMPT } from './prompt';
const SYSTEM_PROMPT = PRODUCT_MANAGER_PROMPT;


export async function productManagerAction(input: {
  task: 'write-prd' | 'prioritize-features' | 'create-roadmap' | 'user-stories' | 'define-metrics';
  productContext: string;
  features?: string[];
  userFeedback?: string;
  businessGoals?: string;
  timeframe?: string;
}) {
  return instrumentAgent('product_manager', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const taskMap: Record<string, string> = {
      'write-prd': 'اكتب PRD تفصيليًا لهذه الميزة/المنتج',
      'prioritize-features': 'رتّب الـ features حسب الأولوية باستخدام RICE Framework',
      'create-roadmap': 'ابنِ Roadmap للمنتج',
      'user-stories': 'حوّل المتطلبات إلى User Stories بصيغة: "كـ [user]، أريد [goal]، لأن [reason]"',
      'define-metrics': 'حدّد North Star Metric وKPIs وTracking Events',
    };

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `${taskMap[input.task]}
المنتج: ${input.productContext}
الميزات: ${input.features?.join('، ') || 'انظر السياق'}
آراء المستخدمين: ${input.userFeedback || 'غير متاح'}
الأهداف التجارية: ${input.businessGoals || 'غير محددة'}
الإطار الزمني: ${input.timeframe || '3 أشهر'}`,
    });

    return { output: text, agentId: 'product-manager', task: input.task };
  }, { model: 'gemini-pro', input, toolsUsed: ['product.manage'] });
}
