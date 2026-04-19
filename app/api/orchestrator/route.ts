import { NextRequest, NextResponse } from 'next/server';
import { orchestratorWithCheckpoint } from '@/src/ai/orchestrator/graph';
import { HumanMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();
    
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
      response: lastMessage.content,
      agentsUsed: Object.keys(result.intermediateResults || {}),
    });
  } catch (error: any) {
    console.error("Orchestrator error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
