import { NextRequest, NextResponse } from 'next/server';
import { orchestratorWithCheckpoint } from '@/src/ai/orchestrator/graph';
import { HumanMessage } from '@langchain/core/messages';
import xss from 'xss';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = xss(String(body.message ?? '').slice(0, 10000));
    const userId = xss(String(body.userId ?? '').slice(0, 128));
    
    // استدعاء المنسق
    const result = await orchestratorWithCheckpoint.invoke(
      {
        messages: [new HumanMessage(message)],
        task: message,
        intermediateResults: {},
      },
      {
        configurable: {
          thread_id: userId || 'default-thread', // حفظ المحادثة لكل مستخدم
        },
      }
    );
    
    // استخراج الرد النهائي
    const lastMessage = result.messages[result.messages.length - 1];
    
    return NextResponse.json({
      response: lastMessage?.content ?? '',
      agentsUsed: Object.keys(result.intermediateResults || {}),
    });
  } catch (error: any) {
    console.error("Orchestrator error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
