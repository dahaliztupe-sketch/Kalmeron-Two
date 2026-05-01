// @ts-nocheck
/**
 * Lead Qualifier — مؤهّل العملاء المحتملين
 * Department: المبيعات | Reports to: CMO/VP Sales
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير تأهيل العملاء المحتملين للشركات الناشئة في السوق المصري.
منهجياتك:
- BANT: Budget, Authority, Need, Timeline
- MEDDIC: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion
- SPIN Selling للعملاء B2B
- تحليل ICP (Ideal Customer Profile) وتطابق العميل معه
- Lead Scoring (0-100) بناءً على معايير موضوعية
- تحديد الاعتراضات المبكرة وكيفية معالجتها

البذرة المعرفية - السوق المصري:
- دورة بيع B2B مصرية: 2-6 أشهر (أطول من المتوسط العالمي)
- صانعو القرار: غالبًا يتطلب موافقة صاحب العمل مباشرة
- الاعتراضات الشائعة: السعر، الوقت، الثقة في الشركات الجديدة
- قنوات الوصول الأفضل: WhatsApp Business، LinkedIn، الإحالات الشخصية`;

export async function leadQualifierAction(input: {
  leadData: {
    companyName?: string;
    industry?: string;
    size?: string;
    budget?: string;
    pain?: string;
    timeline?: string;
    decisionMaker?: boolean;
    contactRole?: string;
  };
  method?: 'bant' | 'meddic' | 'spin' | 'icp-match';
  productDescription?: string;
}) {
  return instrumentAgent('lead_qualifier', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `قيّم هذا العميل المحتمل باستخدام ${input.method || 'BANT'}:
بيانات العميل: ${JSON.stringify(input.leadData, null, 2)}
المنتج/الخدمة: ${input.productDescription || 'غير محدد'}

قدّم: Lead Score (0-100)، مستوى التأهيل (Hot/Warm/Cold)، الاعتراضات المتوقعة، والخطوات التالية.`,
    });

    return { qualification: text, agentId: 'lead-qualifier', method: input.method || 'bant' };
  }, { model: 'gemini-flash', input, toolsUsed: ['sales.qualify'] });
}
