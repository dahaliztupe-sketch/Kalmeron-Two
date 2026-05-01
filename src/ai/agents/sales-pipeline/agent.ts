// @ts-nocheck
/**
 * Sales Pipeline Analyst — محلّل خط المبيعات
 * Department: المبيعات | Reports to: CMO/VP Sales
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت محلّل خط مبيعات (Pipeline) متخصص في الشركات الناشئة بالسوق المصري.
تحليلاتك:
- تشخيص صحة Pipeline: الحجم، التنوع، الانتشار عبر المراحل
- حساب Conversion Rates بين كل مرحلة
- توقع الإيراد من Pipeline الحالي (Weighted Forecast)
- تحديد bottlenecks وأسبابها الجذرية
- اقتراح أنشطة لتسريع إغلاق الصفقات
- تحليل Win/Loss لاستخلاص أنماط النجاح والفشل
- KPIs: Average Deal Size، Sales Cycle Length، Win Rate

البذرة المعرفية:
- Pipeline الصحي = 3-4x هدف الإيراد
- Win Rate جيد للشركات الناشئة المصرية: 15-30%
- دورة البيع: B2C 1-7 أيام، B2B SME 30-90 يوم، B2B Enterprise 90-180 يوم
- أهم محرك للإغلاق في مصر: بناء الثقة والمصداقية`;

export async function salesPipelineAction(input: {
  pipelineData: Array<{
    dealName: string;
    stage: string;
    value: number;
    probability?: number;
    age?: number;
    nextAction?: string;
  }>;
  monthlyTarget?: number;
  context?: string;
}) {
  return instrumentAgent('sales_pipeline', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const totalValue = input.pipelineData.reduce((sum, d) => sum + d.value, 0);
    const weightedValue = input.pipelineData.reduce((sum, d) => sum + d.value * (d.probability || 50) / 100, 0);

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `حلّل Pipeline المبيعات التالي:
الصفقات: ${JSON.stringify(input.pipelineData, null, 2)}
إجمالي قيمة Pipeline: ${totalValue.toLocaleString('ar-EG')} جنيه
القيمة الموزونة المتوقعة: ${weightedValue.toLocaleString('ar-EG')} جنيه
الهدف الشهري: ${input.monthlyTarget ? input.monthlyTarget.toLocaleString('ar-EG') + ' جنيه' : 'غير محدد'}
${input.context ? 'سياق إضافي: ' + input.context : ''}`,
    });

    return {
      analysis: text,
      totalPipelineValue: totalValue,
      weightedForecast: weightedValue,
      agentId: 'sales-pipeline',
    };
  }, { model: 'gemini-flash', input, toolsUsed: ['sales.pipeline'] });
}
