// @ts-nocheck
/**
 * Pitch Deck Creator — منشئ عروض الاستثمار
 * Department: المبيعات + الاستراتيجية | Reports to: CSO/CMO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير في إعداد عروض الاستثمار (Pitch Decks) للشركات الناشئة في السوق العربي.
هيكل العرض المثالي (Guy Kawasaki / YC / Sequoia Blend):
1. المشكلة — بالأرقام والقصة الإنسانية
2. الحل — بسيط، واضح، مقنع
3. حجم السوق — TAM/SAM/SOM بمصادر موثوقة
4. المنتج — لقطات، ديمو، نقاط القوة الرئيسية
5. نموذج الإيراد — كيف تكسب المال؟
6. قوة الجذب (Traction) — أرقام النمو والإنجازات
7. الفريق — لماذا هذا الفريق تحديدًا؟
8. التمويل المطلوب وخطة استخدامه
9. توقعات مالية (3-5 سنوات)
10. السؤال (The Ask)

البذرة المعرفية - مستثمرو مصر والمنطقة:
- Flat6Labs، Algebra Ventures، A15، EFG EV Fintech، Nclude، MSME Fund
- ما يهم المستثمرين المصريين: Traction محلي، فريق متكامل، سوق كبير بوضوح
- مدة العرض المثالية: 10-15 دقيقة، 10-12 شريحة`;

export async function pitchDeckAction(input: {
  business: {
    name: string;
    sector: string;
    problem: string;
    solution: string;
    revenue?: number;
    growthRate?: number;
    teamDescription?: string;
    fundingAsk?: number;
    stage?: string;
  };
  targetInvestors?: string;
  format?: 'outline' | 'full-narrative' | 'slide-by-slide';
}) {
  return instrumentAgent('pitch_deck', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `اصنع عرض استثماري ${input.format === 'outline' ? 'مخططًا' : input.format === 'slide-by-slide' ? 'شريحة بشريحة' : 'شاملاً'} للشركة:
${JSON.stringify(input.business, null, 2)}
المستهدفون: ${input.targetInvestors || 'مستثمرون ملاك ومحافظ استثمارية في مصر'}`,
    });

    return { deck: text, agentId: 'pitch-deck', format: input.format || 'full-narrative' };
  }, { model: 'gemini-pro', input, toolsUsed: ['sales.pitch'] });
}
