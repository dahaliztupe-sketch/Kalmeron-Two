import { NextRequest } from 'next/server';
import xss from 'xss';
import { intelligentOrchestrator } from '@/src/ai/orchestrator/supervisor';
import { HumanMessage } from '@langchain/core/messages';
import { CreditManager } from '@/src/lib/billing/credit-manager';
import { trackAgentUsage } from '@/src/lib/billing/usage-tracker';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';
import { createRequestLogger } from '@/src/lib/logger';

export const runtime = 'nodejs';

// خريطة عقد الـ LangGraph إلى نصوص عربية تُعرض في ThoughtChain
const PHASE_MAP: Record<string, string> = {
  router: 'تحليل نيتك وتوجيه الطلب...',
  idea_validator_node: 'تقييم فكرتك من عدة زوايا...',
  plan_builder_node: 'بناء خطة العمل التفصيلية...',
  mistake_shield_node: 'فحص الأخطاء القاتلة في السوق المصري...',
  success_museum_node: 'استدعاء قصص نجاح مشابهة...',
  opportunity_radar_node: 'مسح فرص التمويل والفعاليات...',
  cfo_agent_node: 'إجراء تحليل مالي تفصيلي...',
  legal_guide_node: 'مراجعة الجوانب القانونية والتنظيمية...',
  real_estate_node: 'بحث في بيانات السوق العقاري...',
  admin_node: 'تنفيذ مهمة إدارية...',
  general_chat_node: 'صياغة الرد بأفضل صيغة...',
};

function sseEncode(event: string, data: any) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const log = createRequestLogger(requestId);
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  const { messages, isGuest, threadId, uiContext } = payload;

  const authHeader = req.headers.get('Authorization');
  let userId = 'guest-system';
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await adminAuth.verifyIdToken(token!);
      userId = decoded.uid;
    } catch {
      log.warn({ msg: 'Invalid token, defaulting to guest' });
    }
  }

  if (userId !== 'guest-system') {
    const creditManager = new CreditManager(userId);
    const creditResult = await creditManager.consumeCredits(5, 'Supervisor', 'gemini-2.5-flash');
    if (!creditResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          message: creditResult.message,
          suggestion: 'ترقية الحساب أو شراء أرصدة إضافية من صفحة الفوترة.',
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const lastMessage = messages?.[messages.length - 1];
  const rawContent = lastMessage?.content || '';
  const cleanMessage = xss(rawContent);
  if (!cleanMessage.trim()) {
    return new Response(JSON.stringify({ error: 'Message cannot be empty.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const langchainMessages = messages.map((m: any) => new HumanMessage(xss(m.content)));
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        try {
          controller.enqueue(encoder.encode(sseEncode(event, data)));
        } catch {
          /* stream closed */
        }
      };

      // مرحلة افتتاحية فورية
      send('phase', { id: 'router', label: PHASE_MAP.router });

      try {
        const eventStream = await intelligentOrchestrator.streamEvents(
          {
            messages: langchainMessages,
            isGuest: !!isGuest,
            messageCount: isGuest ? messages.length : 0,
            uiContext: uiContext || {},
          },
          {
            version: 'v2',
            configurable: { thread_id: threadId || `thread-${userId}` },
          }
        );

        const seenPhases = new Set<string>(['router']);
        let finalText = '';
        let finalIntent = '';

        for await (const ev of eventStream as AsyncIterable<any>) {
          // عقد LangGraph تظهر كـ on_chain_start مع name = اسم العقدة
          if (ev.event === 'on_chain_start' && ev.name && PHASE_MAP[ev.name] && !seenPhases.has(ev.name)) {
            seenPhases.add(ev.name);
            send('phase', { id: ev.name, label: PHASE_MAP[ev.name] });
          }

          // التقاط رموز LLM المتدفّقة كدلتا نصية للعرض المباشر
          if (ev.event === 'on_chat_model_stream') {
            const chunk = ev.data?.chunk;
            const piece =
              typeof chunk?.content === 'string'
                ? chunk.content
                : Array.isArray(chunk?.content)
                  ? chunk.content
                      .map((c: any) => (typeof c === 'string' ? c : c?.text || ''))
                      .join('')
                  : '';
            if (piece) {
              finalText += piece;
              send('delta', { text: piece });
            }
          }

          // الحالة النهائية للجراف
          if (ev.event === 'on_chain_end' && (ev.name === 'LangGraph' || ev.name === 'supervisorWorkflow')) {
            const out = ev.data?.output;
            if (out?.intent) finalIntent = out.intent;
            const last = out?.messages?.[out.messages.length - 1];
            const content =
              typeof last?.content === 'string'
                ? last.content
                : Array.isArray(last?.content)
                  ? last.content.map((c: any) => (typeof c === 'string' ? c : c?.text || '')).join('')
                  : '';
            if (content && !finalText) {
              finalText = content;
              send('delta', { text: content });
            }
          }
        }

        if (userId !== 'guest-system') {
          await trackAgentUsage(userId, 'Supervisor', 'gemini-2.5-flash', 1000);
          const creditManager = new CreditManager(userId);
          await creditManager.checkAndNotifyThreshold();
        }

        send('done', { intent: finalIntent, length: finalText.length });
      } catch (error: any) {
        log.error({ msg: 'Chat SSE error', error: error?.message, stack: error?.stack });
        send('error', { message: 'عذراً، كالميرون بيواجه مشكلة فنية حالياً.' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
