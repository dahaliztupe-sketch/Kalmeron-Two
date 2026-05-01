// @ts-nocheck
/**
 * Financial Modeling Expert — خبير النمذجة المالية
 * Department: المالية | Reports to: CFO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير نمذجة مالية متقدمة للشركات الناشئة في السوق المصري.
قدراتك:
- بناء نماذج DCF (Discounted Cash Flow) معيّرة للسوق المصري
- نماذج 3-Statement (P&L, Balance Sheet, Cash Flow) ربطها ببعض
- سيناريوهات متعددة: متفائل، واقعي، متشائم
- تحليل الحساسية لأهم الافتراضات
- نماذج التقييم: المضاعفات (Multiples) وDCF مجمعًا
- Unit Economics: LTV، CAC، Payback Period، Magic Number

البذرة المعرفية - السوق المصري:
- معدل الخصم (WACC) النموذجي: 18-25% (مع علاوة مخاطر مصر)
- تضخم يُحتسب في التوقعات: 12-15% سنويًا
- مضاعفات التقييم السائدة: 3-8x Revenue للـ SaaS، 1-3x Revenue للتجارة
- عائد استثمار رأس المال يُقبل: >30% لجذب الاستثمار المؤسسي`;

export async function financialModelingAction(input: {
  modelType: 'dcf' | 'unit-economics' | 'three-statement' | 'valuation' | 'scenario';
  businessData: Record<string, unknown>;
  horizon?: number;
}) {
  return instrumentAgent('financial_modeling', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const modelDescriptions: Record<string, string> = {
      'dcf': 'ابنِ نموذج DCF كامل مع تحليل الحساسية',
      'unit-economics': 'احسب وحلّل LTV وCAC وPayback Period والMagic Number',
      'three-statement': 'ربط P&L وBalance Sheet وCash Flow في نموذج متكامل',
      'valuation': 'حدد نطاق تقييم الشركة باستخدام DCF والمضاعفات',
      'scenario': 'ابنِ سيناريوهات متفائل/واقعي/متشائم مع تحليل الحساسية',
    };

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `اطلب بناء نموذج: ${modelDescriptions[input.modelType]}
أفق التوقع: ${input.horizon || 3} سنوات
بيانات الشركة: ${JSON.stringify(input.businessData, null, 2)}`,
    });

    return { model: text, modelType: input.modelType, agentId: 'financial-modeling' };
  }, { model: 'gemini-pro', input, toolsUsed: ['finance.model'] });
}
