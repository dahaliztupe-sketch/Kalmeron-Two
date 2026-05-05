/**
 * Valuation Expert — خبير التقييم
 * Department: المالية | Reports to: CFO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { VALUATION_EXPERT_PROMPT } from './prompt';
const SYSTEM_PROMPT = VALUATION_EXPERT_PROMPT;


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
