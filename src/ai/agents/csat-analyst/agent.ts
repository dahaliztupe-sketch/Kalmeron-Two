/**
 * CSAT Analyst — محلّل رضا العملاء
 * Department: دعم العملاء | Reports to: COO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { CSAT_ANALYST_PROMPT } from './prompt';
const SYSTEM_PROMPT = CSAT_ANALYST_PROMPT;


export async function csatAnalystAction(input: {
  task: 'analyze-feedback' | 'nps-report' | 'churn-analysis' | 'journey-map' | 'voc-summary';
  feedbackData?: Array<{ text: string; rating?: number; channel?: string; date?: string }>;
  npsScore?: number;
  churnData?: Record<string, unknown>;
  period?: string;
}) {
  return instrumentAgent('csat_analyst', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الفترة: ${input.period || 'الشهر الماضي'}
NPS الحالي: ${input.npsScore !== undefined ? input.npsScore : 'غير متاح'}
بيانات الآراء: ${JSON.stringify(input.feedbackData?.slice(0, 20) || [], null, 2)}
بيانات التوقف: ${JSON.stringify(input.churnData || {}, null, 2)}`,
    });

    return { analysis: text, agentId: 'csat-analyst', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['support.csat'] });
}
