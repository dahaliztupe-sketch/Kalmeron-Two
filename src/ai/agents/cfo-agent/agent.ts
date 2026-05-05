import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CFO_SYSTEM_PROMPT } from './prompt';
import * as tools from './tools';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { z } from 'zod';

export const ScenarioAnalysisSchema = z.object({
  baseModel: z.record(z.string(), z.unknown()),
  scenario: z.object({
    variable: z.string(),
    changePercent: z.number(),
  }),
});

export const InvestmentEvalSchema = z.object({
  cashflows: z.array(z.number()),
  discountRate: z.number(),
  initialInvestment: z.number(),
});

export type CfoTask = 'analyze-scenario' | 'evaluate-investment' | 'general';

export interface CfoInput {
  task: CfoTask;
  parameters: Record<string, unknown>;
}

const CfoActionSchema = z.object({
  task: z.enum(['analyze-scenario', 'evaluate-investment', 'general']).default('general'),
  parameters: z.record(z.string(), z.unknown()),
});

export async function cfoAgentAction(task: string, parameters: Record<string, unknown>): Promise<string> {
  CfoActionSchema.parse({ task, parameters });
  const usedTools: string[] = [];
  return instrumentAgent(
    'cfo_agent',
    async () => {
      let result: unknown;

      switch (task) {
        case 'analyze-scenario': {
          const parsed = ScenarioAnalysisSchema.safeParse(parameters);
          if (!parsed.success) {
            result = { error: 'بيانات السيناريو غير مكتملة — يلزم baseModel وscenario.variable وscenario.changePercent' };
          } else {
            usedTools.push('finance.scenario');
            result = await tools.runScenarioAnalysis(
              parsed.data.baseModel as Record<string, number | undefined>,
              parsed.data.scenario,
            );
          }
          break;
        }
        case 'evaluate-investment': {
          const parsed = InvestmentEvalSchema.safeParse(parameters);
          if (!parsed.success) {
            result = { error: 'بيانات الاستثمار غير مكتملة — يلزم cashflows وdiscountRate وinitialInvestment' };
          } else {
            usedTools.push('finance.evaluate');
            result = await tools.evaluateInvestment(parsed.data);
          }
          break;
        }
        default:
          result = 'المهمة غير مدعومة حالياً — المهام المدعومة: analyze-scenario, evaluate-investment';
      }

      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon
        ? `${CFO_SYSTEM_PROMPT}\n\n${learnedAddon}`
        : CFO_SYSTEM_PROMPT;

      const { text } = await generateText({
        model: MODELS.PRO,
        system: systemPrompt,
        prompt: `النتيجة التقنية هي: ${JSON.stringify(result)}. قم بشرحها وإعطاء رؤية استراتيجية للمستخدم.`,
      });

      return text;
    },
    { model: 'gemini-pro', input: { task, parameters }, toolsUsed: usedTools ?? ['finance.' + task] }
  );
}

// Helper for inline CFO queries without a specific tool
export async function cfoQueryAction(query: string, context?: string): Promise<string> {
  return instrumentAgent(
    'cfo_agent',
    async () => {
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const systemPrompt = learnedAddon ? `${CFO_SYSTEM_PROMPT}\n\n${learnedAddon}` : CFO_SYSTEM_PROMPT;
      const { text } = await generateText({
        model: MODELS.PRO,
        system: systemPrompt,
        prompt: context ? `السياق: ${context}\n\nالسؤال: ${query}` : query,
      });
      return text;
    },
    { model: 'gemini-pro', input: { query }, toolsUsed: ['cfo.query'] }
  );
}

