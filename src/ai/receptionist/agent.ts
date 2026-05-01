// @ts-nocheck
  /**
   * Receptionist Agent — الواجهة الوحيدة للمستخدم (/chat).
   * نموذج: gemini-2.5-flash (زمن استجابة منخفض جدًا).
   */
  import { generateText } from 'ai';
  import { MODELS } from '@/src/lib/gemini';
  import { orchestrate } from '../organization/governance/orchestrator';
  import { observe, reflect } from '@/src/lib/memory/shared-memory';
  import { getAgentContext } from '@/src/lib/memory/context-provider';
  import {
    receiveMessage as receiveChannelMessage,
    sendMessage as sendChannelMessage,
    type Channel,
  } from '@/src/lib/integrations/omnichannel';

  const PROGRESS_MESSAGES: Record<string, string> = {
    marketing: 'فريق التسويق يعمل على استراتيجيتك...',
    product: 'فريق المنتج يحلّل احتياجاتك...',
    finance: 'فريق المالية يبني النموذج المالي...',
    sales: 'فريق المبيعات يجهّز قمع البيع...',
    support: 'فريق خدمة العملاء يجهز الردود...',
    hr: 'فريق الموارد البشرية يصمم الهيكل...',
    legal: 'الفريق القانوني يراجع الالتزامات...',
    monitoring: 'فريق المراقبة يتحقق من الأداء والتكاليف...',
  };

  export interface ReceptionistResponse {
    text: string;
    intent?: string;
    taskId?: string;
    departments?: string[];
    progressMessages?: string[];
  }

  /**
   * استقبال رسائل من قنوات خارجية (واتساب/تيليجرام/بريد) وتمريرها إلى وكيل
   * الاستقبال بنفس الواجهة الموحّدة. تحلّ هوية المستخدم عبر بوابة القنوات.
   */
  export async function receptionistHandleChannelMessage(args: {
    channel: Channel;
    senderId: string;
    text: string;
    raw?: unknown;
  }) {
    const inbound = await receiveChannelMessage(args.channel, { text: args.text, raw: args.raw }, args.senderId);
    const userId = inbound.userId || `${args.channel}:${args.senderId}`;
    const response = await receptionistRespond({ userId, message: args.text });
    // أرسل الردّ مرة أخرى عبر نفس القناة (best-effort).
    sendChannelMessage(args.channel, { text: response.text }, args.senderId).catch(() => {});
    return response;
  }

  export async function receptionistRespond(args: {
    userId: string;
    message: string;
    uiContext?: Record<string, unknown>;
    segment?: unknown;
    threadId?: string;
  }): Promise<ReceptionistResponse> {
    // 1. Pull shared-memory context
    const { contextSummary } = await getAgentContext(args.userId);

    // 2. Quick intent triage with Lite model — decide if delegation is needed.
    const { text: triage } = await generateText({
      model: MODELS.LITE,
      system: `أنت وكيل الاستقبال في كلميرون تو. أجب بكلمة واحدة فقط:
  DELEGATE — إذا كان الطلب يحتاج فريقًا متخصصًا (تحليل، خطة، استراتيجية، عقد، تمويل، حملة...).
  DIRECT — إذا كان السؤال عام أو ترحيب أو معلومة سريعة.`,
      prompt: `السياق:\n${contextSummary || '(لا يوجد سياق سابق)'}\nالرسالة: ${args.message}`,
    });

    const route = triage.toUpperCase().includes('DELEGATE') ? 'DELEGATE' : 'DIRECT';

    if (route === 'DIRECT') {
      const { text } = await generateText({
        model: MODELS.LITE,
        system: `أنت كلميرون، المساعد الذكي لرواد الأعمال المصريين. ردّ بإيجاز ولطف بالعربية.
  إذا كانت لديك معلومات في السياق فاستخدمها.`,
        prompt: `السياق:\n${contextSummary}\nالرسالة: ${args.message}`,
      });
      // Update shared memory in background
      observe(args.userId, `${args.message}\n${text}`).then(facts => reflect(args.userId, facts)).catch(()=>{});
      return { text, intent: 'DIRECT' };
    }

    // 3. Delegate to Global Orchestrator
    const { taskId, plan, results } = await orchestrate({
      userId: args.userId,
      message: args.message,
      uiContext: args.uiContext,
      segment: args.segment,
      threadId: args.threadId,
    });

    const progressMessages = plan.departments.map(d => PROGRESS_MESSAGES[d] || `فريق ${d} يعمل...`);

    // 4. Compose final response
    const summary = await generateText({
      model: MODELS.FLASH,
      system: `أنت كلميرون. اجمع نتائج الفرق التالية في رد واحد منظّم بالعربية، مع عناوين فرعية لكل قسم.
  كن عمليًا ومباشرًا، وقدّم خطوات قابلة للتنفيذ.`,
      prompt: `الطلب الأصلي: ${args.message}
  السياق: ${contextSummary}
  نتائج الفرق:
  ${JSON.stringify(results, null, 2).slice(0, 3000)}`,
    });

    observe(args.userId, `${args.message}\n${summary.text}`).then(facts => reflect(args.userId, facts)).catch(()=>{});

    return {
      text: summary.text,
      intent: 'ORCHESTRATED',
      taskId,
      departments: plan.departments,
      progressMessages,
    };
  }
  