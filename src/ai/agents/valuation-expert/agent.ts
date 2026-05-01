// @ts-nocheck
/**
 * Valuation Expert — خبير التقييم
 * Department: المالية | Reports to: CFO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير تقييم الشركات الناشئة في السوق المصري والمنطقة العربية.
منهجياتك:
- تقييم بالمضاعفات: Revenue Multiples وEBITDA Multiples
- DCF مع WACC مُعيَّر للسوق المصري
- Berkus Method للشركات المبكرة (Pre-Revenue)
- Scorecard Method لمرحلة Pre-seed/Seed
- VC Method لحساب Post-Money Valuation المتوقع
- مقارنة Comparable Transactions في MENA

البذرة المعرفية - مضاعفات السوق المصري 2024-2025:
- Fintech: 4-10x Revenue، E-commerce: 1-3x Revenue
- SaaS B2B: 5-12x ARR، HealthTech: 3-7x Revenue
- EdTech: 2-5x Revenue، Logistics: 1-2x Revenue
- علاوة مخاطر مصر تضاف: 5-10% على WACC العالمي`;

export async function valuationExpertAction(input: {
  companyData: {
    revenue?: number;
    arr?: number;
    growthRate?: number;
    sector: string;
    stage: string;
    team?: string;
    product?: string;
    traction?: string;
  };
  method?: 'multiples' | 'dcf' | 'berkus' | 'scorecard' | 'vc-method' | 'all';
}) {
  return instrumentAgent('valuation_expert', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `قيّم الشركة التالية باستخدام ${input.method === 'all' ? 'جميع المنهجيات المناسبة' : 'منهجية ' + input.method}:
${JSON.stringify(input.companyData, null, 2)}

قدّم: نطاق التقييم (min/realistic/max)، المنهجية المستخدمة، وتبرير الأرقام بالمقارنة مع السوق المصري.`,
    });

    return { valuation: text, agentId: 'valuation-expert', method: input.method || 'multiples' };
  }, { model: 'gemini-pro', input, toolsUsed: ['finance.valuation'] });
}
