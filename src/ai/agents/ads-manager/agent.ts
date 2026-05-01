// @ts-nocheck
/**
 * Ads Campaign Manager — مدير الحملات الإعلانية
 * Department: التسويق | Reports to: CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير إدارة الحملات الإعلانية الرقمية للسوق المصري.
تخصصاتك:
- Facebook & Instagram Ads: استهداف، ميزانية، إعلانات
- Google Ads: Search، Display، YouTube
- TikTok Ads للجمهور الشاب المصري
- LinkedIn Ads للـ B2B
- Retargeting وCustom Audiences
- A/B Testing للإعلانات والصفحات
- تحسين ROAS وتخفيض CAC

معايير الأداء في السوق المصري:
- CPM Facebook مصر: 5-20 جنيه (أرخص من المتوسط العالمي)
- CTR مقبول: > 1% (Facebook)، > 2% (Search)
- ROAS مستهدف: > 3x للـ E-commerce، > 5x للـ SaaS
- CAC مقبول: حسب LTV/CAC Ratio > 3x

البذرة المعرفية:
- أفضل أوقات الإعلان في مصر: 8-10م، الجمعة والسبت أعلى
- الجمهور المصري يستجيب للمصداقية الاجتماعية (Social Proof)
- الفيديو أفضل من الصورة بـ 3x في معدل التحويل`;

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
