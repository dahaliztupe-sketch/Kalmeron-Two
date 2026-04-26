// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { CFO_SYSTEM_PROMPT } from './prompt';
import * as tools from './tools';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

export async function cfoAgentAction(task: string, parameters: unknown) {
  return instrumentAgent(
    'cfo_agent',
    async () => {
      let result: unknown;
      const usedTools: string[] = [];

      switch (task) {
        case 'analyze-scenario':
          usedTools.push('finance.scenario');
          result = await tools.runScenarioAnalysis(parameters.baseModel, parameters.scenario);
          break;
        case 'evaluate-investment':
          usedTools.push('finance.evaluate');
          result = await tools.evaluateInvestment(parameters);
          break;
        default:
          result = 'المهمة غير مدعومة حالياً';
      }

      // حقن المهارات المُتعلَّمة (إن وجدت) في system prompt — يجعل الوكيل
      // يستفيد من تجاربه السابقة قبل توليد الجواب.
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
    { model: 'gemini-pro', input: { task, parameters }, toolsUsed: ['finance.' + task] }
  );
}
