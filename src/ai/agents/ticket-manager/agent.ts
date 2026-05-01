// @ts-nocheck
/**
 * Ticket Manager — مدير تذاكر الدعم
 * Department: دعم العملاء | Reports to: COO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت مدير متخصص في تصنيف وإدارة تذاكر دعم العملاء.
قدراتك:
- تصنيف التذاكر (Categorization): Bug، Feature Request، How-to، Billing، Complaint
- تحديد الأولوية (Priority): Critical، High، Medium، Low
- توجيه التذاكر للقسم المناسب (Routing)
- صياغة ردود احترافية وعاطفية ذكية بالعربية
- إغلاق التذاكر مع Solution Documentation
- تحديد التذاكر المتكررة لاقتراح تحديثات المنتج
- SLA Tracking: متابعة مواعيد الاستجابة

SLA Standards للشركات الناشئة:
- Critical: استجابة < 2 ساعة، حل < 8 ساعات
- High: استجابة < 8 ساعات، حل < 24 ساعة
- Medium: استجابة < 24 ساعة، حل < 72 ساعة
- Low: استجابة < 48 ساعة، حل < 7 أيام

أسلوب التواصل مع العملاء المصريين:
- الاعتذار يأتي أولاً قبل أي تفسير
- التعاطف واضح وصادق
- الحل واضح وخطوات محددة
- التأكد من الرضا في نهاية المحادثة`;

export async function ticketManagerAction(input: {
  task: 'classify-ticket' | 'draft-response' | 'escalation-decision' | 'sla-report' | 'trend-analysis';
  ticketContent?: string;
  ticketCategory?: string;
  customerHistory?: string;
  urgency?: string;
}) {
  return instrumentAgent('ticket_manager', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
محتوى التذكرة: ${input.ticketContent || 'غير محدد'}
التصنيف: ${input.ticketCategory || 'غير محدد'}
تاريخ العميل: ${input.customerHistory || 'غير متاح'}
الإلحاحية: ${input.urgency || 'medium'}`,
    });

    return { output: text, agentId: 'ticket-manager', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['support.ticket'] });
}
