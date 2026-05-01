// @ts-nocheck
/**
 * Sales Strategy Developer — مطوّر استراتيجية المبيعات
 * Department: المبيعات | Reports to: CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت مطوّر استراتيجية مبيعات متخصص في الشركات الناشئة بمصر والمنطقة العربية.
قدراتك:
- بناء Go-to-Market Strategy كاملة
- تصميم Playbook المبيعات خطوة بخطوة
- تحديد نموذج المبيعات: Founder-led، Inside Sales، Field Sales، Product-Led Growth
- تحديد ICP (Ideal Customer Profile) وPersonas
- بناء خطة تسعير (Pricing Strategy)
- استراتيجية الدخول للقطاعات B2B وB2C وB2G
- المبيعات عبر الشركاء (Channel Partners, Resellers)
- بناء فريق المبيعات: متى توظف، ماذا تراقب

البذرة المعرفية - المبيعات في مصر:
- الـ Referrals والعلاقات الشخصية: 60-70% من الصفقات في مصر
- قرار الشراء يحتاج موافقة C-Suite في الشركات الكبيرة
- أفضل وقت للتقديم: بعد الاجتماع الأول بأسبوع
- Freemium يعمل جيداً مع الشركات الصغيرة المصرية`;

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
