// @ts-nocheck
/**
 * CSAT Analyst — محلّل رضا العملاء
 * Department: دعم العملاء | Reports to: COO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت محلّل رضا العملاء وتجربتهم للشركات الرقمية في السوق المصري.
قدراتك:
- تحليل CSAT، NPS، CES (Customer Effort Score)
- Voice of Customer (VoC) — استخلاص الأنماط من الآراء
- Sentiment Analysis للمراجعات العربية
- Customer Journey Mapping وتحديد نقاط الألم
- Churn Analysis — لماذا يغادر العملاء؟
- Support Ticket Analysis — الأسباب الجذرية المتكررة
- تقارير رضا العملاء للإدارة

البذرة المعرفية:
- NPS جيد: > 50، ممتاز: > 70
- CSAT هدف: > 85%
- أهم مسبب للـ Churn في مصر: سوء خدمة العملاء
- المراجعات العربية السلبية تنتشر بسرعة على Facebook وGoogle
- WhatsApp: القناة المفضلة للدعم في مصر (> 90% من الاستفسارات)`;

export async function csatAnalystAction(input: {
  task: 'analyze-feedback' | 'nps-report' | 'churn-analysis' | 'journey-map' | 'voc-summary';
  feedbackData?: Array<{ text: string; rating?: number; channel?: string; date?: string }>;
  npsScore?: number;
  churnData?: Record<string, unknown>;
  period?: string;
}) {
  return instrumentAgent('csat_analyst', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
الفترة: ${input.period || 'الشهر الماضي'}
NPS الحالي: ${input.npsScore !== undefined ? input.npsScore : 'غير متاح'}
بيانات الآراء: ${JSON.stringify(input.feedbackData?.slice(0, 20) || [], null, 2)}
بيانات التوقف: ${JSON.stringify(input.churnData || {}, null, 2)}`,
    });

    return { analysis: text, agentId: 'csat-analyst', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['support.csat'] });
}
