/**
 * DevOps Engineer — مهندس DevOps
 * Department: التقنية | Reports to: CTO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { DEVOPS_ENGINEER_PROMPT } from './prompt';
const SYSTEM_PROMPT = DEVOPS_ENGINEER_PROMPT;


export async function devopsEngineerAction(input: {
  task: 'design-cicd' | 'cloud-architecture' | 'cost-optimization' | 'monitoring-setup' | 'security-audit' | 'incident-response';
  stack?: string;
  currentInfrastructure?: Record<string, unknown>;
  budget?: string;
  problem?: string;
}) {
  return instrumentAgent('devops_engineer', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
التقنيات المستخدمة: ${input.stack || 'غير محدد'}
الميزانية: ${input.budget || 'محدودة'}
المشكلة/الطلب: ${input.problem || 'انظر السياق'}
البنية الحالية: ${JSON.stringify(input.currentInfrastructure || {}, null, 2)}`,
    });

    return { solution: text, agentId: 'devops-engineer', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['tech.devops'] });
}
