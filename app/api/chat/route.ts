import { NextResponse } from 'next/server';
import xss from 'xss';
import { intelligentOrchestrator } from '@/src/ai/orchestrator/supervisor';
import { HumanMessage } from '@langchain/core/messages';

export async function POST(req: Request) {
  try {
    const { messages, isGuest, threadId, uiContext } = await req.json();
    
    // Get last user message
    const lastMessage = messages[messages.length - 1];

    // 1. Security: Input Sanitization (منع هجمات XSS)
    const rawContent = lastMessage?.content || '';
    const cleanMessage = xss(rawContent);

    if (!cleanMessage.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    // Convert messages to Langchain format
    const langchainMessages = messages.map((m: any) => 
       new HumanMessage(xss(m.content)) // Simplified for this prototype
    );

    // 2. Intelligent Routing (توجيه المنسق الذكي)
    // نمرر سياق الغلاف (Context Envelope) مع الرسالة
    const result = await intelligentOrchestrator.invoke(
      {
        messages: langchainMessages,
        isGuest: !!isGuest,
        messageCount: isGuest ? messages.length : 0,
        uiContext: uiContext || {}, // غلاف السياق: أين يتواجد المستخدم في المنصة؟
      },
      {
        configurable: { thread_id: threadId || 'temp-guest-thread' },
      }
    );

    const AIResponse = result.messages[result.messages.length - 1];

    // Simple JSON fallback if not streaming for guest/supervisor prototype
    return NextResponse.json({
      text: AIResponse.content,
      intent: result.intent, // للشفافية التحليلية
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response("عذراً، كالميرون بيواجه مشكلة فنية حالياً. الفريق التقني بيحاول يصحيه.", { status: 500 });
  }
}
