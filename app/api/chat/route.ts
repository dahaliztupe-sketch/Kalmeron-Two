import { NextRequest, NextResponse } from 'next/server';
import xss from 'xss';
import { intelligentOrchestrator } from '@/src/ai/orchestrator/supervisor';
import { HumanMessage } from '@langchain/core/messages';
import { CreditManager } from '@/src/lib/billing/credit-manager';
import { trackAgentUsage } from '@/src/lib/billing/usage-tracker';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();
  try {
    const { messages, isGuest, threadId, uiContext } = await req.json();
    
    // 0. Auth context (Admin SDK to get UID from token if available, or use a provided one)
    // For this prototype, we'll try to get it from headers or a cookie if provided, 
    // but typically it's better to verify the JWT.
    const authHeader = req.headers.get('Authorization');
    let userId = 'guest-system';
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = await adminAuth.verifyIdToken(token!);
        userId = decoded.uid;
      } catch (e) {
        console.warn("Invalid token, defaulting to guest");
      }
    }

    // 1. Credit Check (Skip for system/dev if needed, but here we enforce)
    const creditManager = new CreditManager(userId);
    // Base cost for supervisor interaction
    const cost = 5; 
    
    if (userId !== 'guest-system') {
      const creditResult = await creditManager.consumeCredits(cost, 'Supervisor', 'gemini-3.1-flash');
      if (!creditResult.success) {
        return NextResponse.json({ 
          error: 'Insufficient credits', 
          message: creditResult.message,
          suggestion: 'ترقية الحساب أو شراء أرصدة إضافية من صفحة الفوترة.'
        }, { status: 402 });
      }
    }

    // Get last user message
    const lastMessage = messages[messages.length - 1];
    const rawContent = lastMessage?.content || '';
    const cleanMessage = xss(rawContent);

    if (!cleanMessage.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const langchainMessages = messages.map((m: any) => 
       new HumanMessage(xss(m.content))
    );

    // 2. Intelligent Routing
    const result = await intelligentOrchestrator.invoke(
      {
        messages: langchainMessages,
        isGuest: !!isGuest,
        messageCount: isGuest ? messages.length : 0,
        uiContext: uiContext || {},
      },
      {
        configurable: { thread_id: threadId || `thread-${userId}` },
      }
    );

    const AIResponse = result.messages[result.messages.length - 1];

    // 3. Usage Tracking (OpenMeter)
    if (userId !== 'guest-system') {
      await trackAgentUsage(userId, 'Supervisor', 'gemini-3.1-flash', 1000); // Approximate tokens
      await creditManager.checkAndNotifyThreshold();
    }

    return NextResponse.json({
      text: AIResponse?.content ?? '',
      intent: result.intent,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response("عذراً، كالميرون بيواجه مشكلة فنية حالياً. الفريق التقني بيحاول يصحيه.", { status: 500 });
  }
}
