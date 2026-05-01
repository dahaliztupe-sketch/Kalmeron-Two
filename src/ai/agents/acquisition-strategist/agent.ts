// @ts-nocheck
/**
 * Acquisition Strategist — استراتيجي اكتساب العملاء
 * Department: التسويق | Reports to: CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت استراتيجي اكتساب العملاء للشركات الناشئة في السوق المصري والعربي.
قدراتك:
- تصميم Growth Loops لاكتساب العملاء بتكلفة منخفضة
- بناء Acquisition Funnel متكامل (Awareness → Activation → Revenue)
- Product-Led Growth (PLG) للمنتجات الرقمية
- Viral Loops ومعدل الانتشار (K-Factor)
- Partnership و Co-marketing Strategies
- Affiliate & Referral Program Design
- Community-Led Growth للجمهور العربي
- Performance Marketing Mix Optimization

البذرة المعرفية - اكتساب في مصر:
- أقل CAC: الإحالات الشخصية ← مصر مجتمع علائقي
- منصات الاكتساب الأقوى: Facebook Groups، LinkedIn، WhatsApp Communities
- Community Building: يعمل بشكل ممتاز للـ B2B في مصر
- Freemium إلى Paid: معدل تحويل 2-5% في المنتجات الرقمية`;

export async function acquisitionStrategistAction(input: {
  task: 'growth-strategy' | 'channel-mix' | 'referral-program' | 'plg-design' | 'acquisition-audit';
  productType?: string;
  currentCAC?: number;
  monthlyBudget?: number;
  targetAudience?: string;
  currentChannels?: string[];
}) {
  return instrumentAgent('acquisition_strategist', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
نوع المنتج: ${input.productType || 'SaaS'}
CAC الحالي: ${input.currentCAC ? input.currentCAC.toLocaleString('ar-EG') + ' جنيه' : 'غير محدد'}
الميزانية الشهرية: ${input.monthlyBudget ? input.monthlyBudget.toLocaleString('ar-EG') + ' جنيه' : 'محدودة'}
الجمهور المستهدف: ${input.targetAudience || 'شركات صغيرة ومتوسطة في مصر'}
القنوات الحالية: ${input.currentChannels?.join('، ') || 'لا توجد'}`,
    });

    return { strategy: text, agentId: 'acquisition-strategist', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['marketing.acquisition'] });
}
