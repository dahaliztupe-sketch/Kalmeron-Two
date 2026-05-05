/**
 * QA Manager — مدير ضبط الجودة
 * Department: التقنية | Reports to: CTO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { QA_MANAGER_PROMPT } from './prompt';
const SYSTEM_PROMPT = QA_MANAGER_PROMPT;


export async function qaManagerAction(input: {
  task: 'write-test-plan' | 'create-test-cases' | 'bug-triage' | 'performance-test' | 'accessibility-check' | 'release-checklist';
  featureOrBug: string;
  acceptanceCriteria?: string[];
  bugDetails?: Record<string, unknown>;
  platform?: string;
}) {
  return instrumentAgent('qa_manager', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الميزة/البج: ${input.featureOrBug}
معايير القبول: ${input.acceptanceCriteria?.join('\n') || 'غير محددة'}
تفاصيل البج: ${JSON.stringify(input.bugDetails || {}, null, 2)}
المنصة: ${input.platform || 'Web + Mobile'}`,
    });

    return { output: text, agentId: 'qa-manager', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['tech.qa'] });
}
