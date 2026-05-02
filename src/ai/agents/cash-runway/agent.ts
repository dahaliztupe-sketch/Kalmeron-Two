// @ts-nocheck
/**
 * Cash Runway Manager — مدير السيولة والمدرج النقدي
 * Department: المالية | Reports to: CFO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { CASH_RUNWAY_PROMPT } from './prompt';
const SYSTEM_PROMPT = CASH_RUNWAY_PROMPT;


export async function cashRunwayAction(input: {
  monthlyBurn: number;
  cashOnHand: number;
  monthlyRevenue?: number;
  growthRate?: number;
  context?: string;
}) {
  return instrumentAgent('cash_runway', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const runwayMonths = input.monthlyBurn > 0
      ? Math.round(input.cashOnHand / input.monthlyBurn)
      : null;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `حلّل الوضع النقدي للشركة:
- النقد الحالي: ${input.cashOnHand.toLocaleString('ar-EG')} جنيه
- معدل الحرق الشهري: ${input.monthlyBurn.toLocaleString('ar-EG')} جنيه
- الإيراد الشهري: ${input.monthlyRevenue ? input.monthlyRevenue.toLocaleString('ar-EG') + ' جنيه' : 'غير محدد'}
- معدل النمو: ${input.growthRate ? input.growthRate + '%' : 'غير محدد'}
- المدرج المحسوب: ${runwayMonths ? runwayMonths + ' شهر' : 'يتطلب بيانات الحرق'}
${input.context ? '- سياق إضافي: ' + input.context : ''}

قدّم: تقييم الوضع، المخاطر، وخطة عمل واضحة لتمديد المدرج.`,
    });

    return {
      analysis: text,
      runwayMonths,
      agentId: 'cash-runway',
      status: runwayMonths && runwayMonths < 6 ? 'critical' : runwayMonths && runwayMonths < 12 ? 'warning' : 'healthy',
    };
  }, { model: 'gemini-flash', input, toolsUsed: ['finance.cash'] });
}
