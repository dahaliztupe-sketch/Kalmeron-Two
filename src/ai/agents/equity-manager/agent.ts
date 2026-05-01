// @ts-nocheck
/**
 * Equity Manager — مدير حقوق الملكية وجداول الرسملة
 * Department: المالية | Reports to: CFO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير إدارة حقوق الملكية وهياكل رأس المال للشركات الناشئة في مصر.
تخصصاتك:
- بناء Cap Table (جدول الرسملة) وإدارته عبر جولات التمويل
- هيكلة ESOP (خطط مشاركة الموظفين بالأسهم)
- تحليل التخفيف (Dilution) وأثره على كل طرف
- Safe Notes وConvertible Notes وشروطها
- حصص المؤسسين وحماية النسب مع Vesting Schedules
- Anti-dilution provisions والتفاوض على شروطها
- Liquidation Preferences وترتيب الأولويات في الخروج

البذرة المعرفية - السوق المصري:
- توزيع نموذجي: مؤسسون 60-70%، موظفون ESOP 10-15%، مستثمرون 20-30%
- Cliff period: 12 شهرًا، Vesting: 4 سنوات
- نسب ESOP شائعة عند الإطلاق: 10-15% من Cap Table`;

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
