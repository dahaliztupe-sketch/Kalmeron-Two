/**
 * Contract Drafter — محرّر العقود القانونية
 * Department: القانونية | Reports to: CLO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { CONTRACT_DRAFTER_PROMPT } from './prompt';
const SYSTEM_PROMPT = CONTRACT_DRAFTER_PROMPT;


export async function contractDrafterAction(input: {
  contractType: 'founders-agreement' | 'employment' | 'nda' | 'service-agreement' | 'investment' | 'partnership' | 'saas-terms';
  parties: Array<{ name: string; role: string; entity?: string }>;
  keyTerms?: Record<string, unknown>;
  language?: 'ar' | 'en' | 'bilingual';
  jurisdiction?: string;
}) {
  return instrumentAgent('contract_drafter', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `صُغ مسودة ${input.contractType} ${input.language === 'bilingual' ? 'ثنائية اللغة' : input.language === 'en' ? 'بالإنجليزية' : 'بالعربية'}:
الأطراف: ${JSON.stringify(input.parties, null, 2)}
الشروط الرئيسية: ${JSON.stringify(input.keyTerms || {}, null, 2)}
الولاية القضائية: ${input.jurisdiction || 'جمهورية مصر العربية'}

قدّم مسودة عقد كاملة مع ملاحظات على البنود الحرجة والنقاط التي تحتاج مراجعة قانونية متخصصة.`,
    });

    return { contract: text, agentId: 'contract-drafter', type: input.contractType };
  }, { model: 'gemini-pro', input, toolsUsed: ['legal.contract'] });
}
