// @ts-nocheck
/**
 * Performance Manager — مدير الأداء والتطوير المهني
 * Department: الموارد البشرية | Reports to: CHRO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { PERFORMANCE_MANAGER_PROMPT } from './prompt';
const SYSTEM_PROMPT = PERFORMANCE_MANAGER_PROMPT;


export async function performanceManagerAction(input: {
  task: 'design-review-system' | 'create-idp' | 'pip-plan' | 'career-ladder' | 'comp-benchmarking' | 'skill-gap';
  employeeData?: Record<string, unknown>;
  role?: string;
  currentPerformance?: string;
  goals?: string[];
}) {
  return instrumentAgent('performance_manager', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الدور الوظيفي: ${input.role || 'غير محدد'}
بيانات الموظف: ${JSON.stringify(input.employeeData || {}, null, 2)}
مستوى الأداء الحالي: ${input.currentPerformance || 'غير محدد'}
الأهداف: ${input.goals?.join('، ') || 'غير محددة'}`,
    });

    return { plan: text, agentId: 'performance-manager', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['hr.performance'] });
}
