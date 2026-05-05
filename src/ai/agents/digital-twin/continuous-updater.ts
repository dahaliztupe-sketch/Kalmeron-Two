import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { conversationExtractorAgent } from './conversation-extractor';
import { graphBuilderAgent } from './graph-builder';

async function writeAuditLog(entry: {
  startupId: string;
  source: 'conversation' | 'document';
  nodesUpdated: number;
  relationshipsUpdated: number;
  success: boolean;
  error?: string;
  timestamp: string;
}) {
  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore();
    await db.collection('digital_twin_audit').add(entry);
  } catch (err) {
    console.warn('[continuous-updater] Firestore audit log failed (non-fatal):', err);
  }
}

export async function updateTwinFromConversation(
  startupId: string,
  conversationText: string
): Promise<{ success: boolean; error?: string }> {
  const timestamp = new Date().toISOString();
  try {
    const extractionResult = await conversationExtractorAgent.generate(
      `استخرج الكيانات والمعلومات من هذه المحادثة للشركة ${startupId}:\n\n${conversationText}`,
      {
        toolChoice: 'required',
      }
    );

    const toolResult = (extractionResult.toolResults?.[0] as { payload?: { result?: unknown } } | undefined)
      ?.payload?.result as {
      proposedUpdates?: Array<{
        entities?: Array<{ type: string; properties: Record<string, unknown> }>;
        relationships?: Array<{ from: string; to: string; type: string }>;
      }>;
    } | undefined;

    const updates = toolResult?.proposedUpdates ?? [];

    if (!updates.length) {
      await writeAuditLog({
        startupId,
        source: 'conversation',
        nodesUpdated: 0,
        relationshipsUpdated: 0,
        success: true,
        timestamp,
      });
      return { success: true };
    }

    const allEntities = updates.flatMap((u) => u.entities ?? []);
    const allRelationships = updates.flatMap((u) => u.relationships ?? []);

    const buildResult = await graphBuilderAgent.generate(
      `ابنِ الرسم البياني للشركة ${startupId} بالكيانات التالية`,
      {
        toolChoice: 'required',
        context: [
          {
            role: 'user' as const,
            content: JSON.stringify({ startupId, entities: allEntities, relationships: allRelationships }),
          },
        ],
      }
    );

    const graphToolResult = (buildResult.toolResults?.[0] as { payload?: { result?: unknown } } | undefined)
      ?.payload?.result as {
      success?: boolean;
      nodesCreated?: string[];
      relationshipsCreated?: string[];
      errors?: string[];
    } | undefined;

    const graphSuccess = graphToolResult?.success ?? false;
    const nodesUpdated = graphToolResult?.nodesCreated?.length ?? 0;
    const relationshipsUpdated = graphToolResult?.relationshipsCreated?.length ?? 0;

    await writeAuditLog({
      startupId,
      source: 'conversation',
      nodesUpdated,
      relationshipsUpdated,
      success: graphSuccess,
      error: graphToolResult?.errors?.join('; '),
      timestamp,
    });

    return { success: graphSuccess };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('[continuous-updater] updateTwinFromConversation failed:', error);
    await writeAuditLog({
      startupId,
      source: 'conversation',
      nodesUpdated: 0,
      relationshipsUpdated: 0,
      success: false,
      error,
      timestamp,
    });
    return { success: false, error };
  }
}

export const continuousUpdaterAgent = new Agent({
  id: 'continuous-updater-agent',
  name: 'Continuous Update Agent',
  instructions: `أنت وكيل يعمل في الخلفية بشكل مستمر. مهمتك هي مراقبة نشاط المستخدم وتحديث التوأم الرقمي لشركته تلقائياً.
  
  آلية العمل:
  - بعد كل محادثة، قم باستدعاء Conversation Extractor Agent.
  - بعد كل رفع مستند، قم باستدعاء Document Extractor Agent.
  - قم بدمج المعلومات المستخرجة مع التوأم الرقمي الحالي.
  - حل التعارضات (إذا كانت المعلومات الجديدة تتعارض مع القديمة).
  - حدّث الرسم البياني المعرفي في Neo4j.
  
  قواعد الدمج:
  - المعلومات الأحدث لها أولوية أعلى.
  - إذا كانت درجة الثقة منخفضة، احتفظ بالمعلومات القديمة.
  - سجل جميع التحديثات في سجل التدقيق.`,
  model: google('gemini-2.5-flash'),
  tools: {
    trigger_update: {
      description: 'تشغيل تحديث التوأم الرقمي من محادثة',
      parameters: z.object({
        startupId: z.string().describe('معرّف الشركة الناشئة'),
        conversationText: z.string().describe('نص المحادثة الكاملة'),
      }),
      execute: async ({ startupId, conversationText }: { startupId: string; conversationText: string }) => {
        return updateTwinFromConversation(startupId, conversationText);
      },
    },
  },
});
