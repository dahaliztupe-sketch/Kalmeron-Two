/**
 * Org Structure Designer — مصمّم الهيكل التنظيمي
 * Department: الموارد البشرية | Reports to: CHRO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { ORG_DESIGNER_PROMPT } from './prompt';
const SYSTEM_PROMPT = ORG_DESIGNER_PROMPT;


export async function orgDesignerAction(input: {
  task: 'design-org-chart' | 'job-architecture' | 'raci-matrix' | 'hiring-plan' | 'restructure';
  companyStage?: string;
  headcount?: number;
  departments?: string[];
  budget?: string;
  goals?: string;
}) {
  return instrumentAgent('org_designer', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
مرحلة الشركة: ${input.companyStage || 'Seed'}
عدد الموظفين: ${input.headcount || 'غير محدد'}
الأقسام: ${input.departments?.join('، ') || 'غير محددة'}
الميزانية: ${input.budget || 'محدودة'}
الأهداف: ${input.goals || 'النمو المستدام'}`,
    });

    return { design: text, agentId: 'org-designer', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['hr.org'] });
}
