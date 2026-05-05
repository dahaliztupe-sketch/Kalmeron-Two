/**
 * Budget Analyst — محلّل الميزانية
 * Department: المالية | Reports to: CFO
 * دوره: تحليل الميزانيات، مقارنة الفعلي بالمخطط، واكتشاف الانحرافات.
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { BUDGET_ANALYST_PROMPT } from './prompt';
const SYSTEM_PROMPT = BUDGET_ANALYST_PROMPT;


export async function budgetAnalystAction(input: {
  task: 'analyze-variance' | 'build-zero-budget' | 'break-even' | 'cost-structure' | 'general';
  data: Record<string, unknown>;
  period?: string;
}) {
  return instrumentAgent('budget_analyst', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const taskDescriptions: Record<string, string> = {
      'analyze-variance': 'حلّل الانحراف بين الميزانية المخططة والفعلية وحدد الأسباب الجذرية والتوصيات',
      'build-zero-budget': 'ابنِ ميزانية صفرية (Zero-Based) مع مبرر لكل بند إنفاق',
      'break-even': 'احسب نقطة التعادل وحلّل هيكل التكاليف',
      'cost-structure': 'حلّل هيكل التكاليف الثابتة والمتغيرة وقدّم توصيات للتحسين',
      'general': 'قدّم تحليلاً ماليًا شاملاً للبيانات المقدمة',
    };

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${taskDescriptions[input.task] || taskDescriptions.general}
الفترة: ${input.period || 'الفترة الحالية'}
البيانات: ${JSON.stringify(input.data, null, 2)}`,
    });

    return { analysis: text, agentId: 'budget-analyst', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['finance.budget'] });
}
