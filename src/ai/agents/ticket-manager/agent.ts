/**
 * Ticket Manager — مدير تذاكر الدعم
 * Department: دعم العملاء | Reports to: COO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { TICKET_MANAGER_PROMPT } from './prompt';
const SYSTEM_PROMPT = TICKET_MANAGER_PROMPT;


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
