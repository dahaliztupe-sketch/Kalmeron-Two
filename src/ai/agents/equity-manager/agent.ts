/**
 * Equity Manager — مدير حقوق الملكية وجداول الرسملة
 * Department: المالية | Reports to: CFO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { EQUITY_MANAGER_PROMPT } from './prompt';
const SYSTEM_PROMPT = EQUITY_MANAGER_PROMPT;


export async function equityManagerAction(input: {
  task: 'build-cap-table' | 'model-dilution' | 'design-esop' | 'analyze-term-sheet' | 'vesting-schedule';
  founders?: Array<{ name: string; shares: number; percentage: number }>;
  investors?: Array<{ name: string; amount: number; valuation: number; round: string }>;
  context?: Record<string, unknown>;
}) {
  return instrumentAgent('equity_manager', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
المؤسسون: ${JSON.stringify(input.founders || [], null, 2)}
المستثمرون: ${JSON.stringify(input.investors || [], null, 2)}
السياق: ${JSON.stringify(input.context || {}, null, 2)}
قدّم تحليلاً تفصيليًا مع جدول رسملة واضح وتوصيات.`,
    });

    return { analysis: text, agentId: 'equity-manager', task: input.task };
  }, { model: 'gemini-pro', input, toolsUsed: ['finance.equity'] });
}
