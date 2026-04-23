import { NextRequest, NextResponse } from 'next/server';
import { orchestratorWithCheckpoint } from '@/src/ai/orchestrator/graph';
import { HumanMessage } from '@langchain/core/messages';
import { runWithLearningContext } from '@/src/lib/learning/context';
import xss from 'xss';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = xss(String(body.message ?? '').slice(0, 10000));
    const userId = xss(String(body.userId ?? '').slice(0, 128));
    const workspaceId = xss(String(body.workspaceId ?? '').slice(0, 128));

    // كل التنفيذ — بما فيه استدعاءات الوكلاء المتداخلة — يجري داخل سياق
    // التعلم؛ هذا يضمن أن instrumentAgent يستطيع تحميل المهارات وحفظ
    // التغذية الراجعة واستخراج المهارات الجديدة لكل وكيل تلقائياً، بدون
    // تعديل كل ملف وكيل على حدة.
    const result = await runWithLearningContext(
      { workspaceId, task: message },
      () =>
        orchestratorWithCheckpoint.invoke(
          {
            messages: [new HumanMessage(message)],
            task: message,
            workspaceId,
            intermediateResults: {},
          },
          {
            configurable: {
              thread_id: userId || 'default-thread',
            },
          }
        )
    );
    
    // استخراج الرد النهائي
    const lastMessage = result.messages[result.messages.length - 1];
    
    return NextResponse.json({
      response: lastMessage?.content ?? '',
      agentsUsed: Object.keys(result.intermediateResults || {}),
    });
  } catch (error: any) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: error }, 'Orchestrator error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
