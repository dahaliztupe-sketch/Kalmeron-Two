// @ts-nocheck
/**
 * Swarm Intelligence — Virtual Meetings between cross-department agents.
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { instrumentAgent } from '@/src/lib/observability/instrumentation';

export interface MeetingOpinion {
  departmentId: string;
  agentName: string;
  opinion: string;
  confidence: number;
}

export interface MeetingResult {
  id: string;
  topic: string;
  departmentIds: string[];
  opinions: MeetingOpinion[];
  synthesis: string;
  decisions: string[];
  createdAt: number;
}

const DEPT_AGENT: Record<string, string> = {
  marketing: 'مدير التسويق',
  product: 'رئيس المنتج',
  finance: 'المدير المالي',
  sales: 'رئيس المبيعات',
  support: 'مدير خدمة العملاء',
  hr: 'مدير الموارد البشرية',
  legal: 'المستشار القانوني',
  monitoring: 'مسؤول المراقبة',
};

async function askDepartment(
  departmentId: string,
  topic: string,
  context: Record<string, any>
): Promise<MeetingOpinion> {
  const agentName = DEPT_AGENT[departmentId] || `وكيل ${departmentId}`;
  const { text } = await generateText({
    model: MODELS.FLASH,
    system: `أنت ${agentName} في شركة كلميرون تو. شارك رأيك المهني الصريح في الموضوع التالي من منظور قسمك فقط.
أجب بصيغة JSON: {"opinion": "...", "confidence": 0.0-1.0}`,
    prompt: `الموضوع: ${topic}\nالسياق: ${JSON.stringify(context)}`,
  });
  let opinion = text;
  let confidence = 0.6;
  try {
    const j = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    opinion = j.opinion || text;
    confidence = typeof j.confidence === 'number' ? j.confidence : 0.6;
  } catch { /* keep raw */ }
  return { departmentId, agentName, opinion, confidence };
}

export async function conveneMeeting(
  topic: string,
  departmentIds: string[],
  context: Record<string, any> = {},
  hookMeta: { workspaceId?: string; userId?: string } = {}
): Promise<MeetingResult> {
  const result = await instrumentAgent(
    'virtual_meeting',
    () => conveneMeetingInner(topic, departmentIds, context),
    { task: topic, input: { departmentIds }, workspaceId: hookMeta.workspaceId }
  );
  if (hookMeta.workspaceId) {
    const { afterAgentRun } = await import('@/src/lib/agents/hooks');
    afterAgentRun({
      workspaceId: hookMeta.workspaceId,
      userId: hookMeta.userId,
      agent: 'virtual_meeting',
      event: 'meeting.completed',
      payload: { id: result.id, topic: result.topic, decisions: result.decisions },
      notification: {
        type: 'meeting.completed',
        title: 'انتهى الاجتماع الافتراضي',
        body: `${result.topic} — ${result.decisions.length} قرار`,
        href: `/meetings`,
      },
    }).catch(() => {});
  }
  return result;
}

async function conveneMeetingInner(
  topic: string,
  departmentIds: string[],
  context: Record<string, any> = {}
): Promise<MeetingResult> {
  const opinions = await Promise.all(
    departmentIds.map((id) => askDepartment(id, topic, context).catch((e) => ({
      departmentId: id,
      agentName: DEPT_AGENT[id] || id,
      opinion: `تعذّر الحصول على رأي: ${e?.message || e}`,
      confidence: 0,
    })))
  );

  const { text: synthesisText } = await generateText({
    model: MODELS.FLASH,
    system: `أنت المنسق العام لاجتماع تنفيذي. اجمع آراء الأقسام في: (1) ملخص تنفيذي موجز، (2) قائمة قرارات قابلة للتنفيذ.
أجب JSON: {"synthesis": "...", "decisions": ["...", "..."]}`,
    prompt: `الموضوع: ${topic}\nالآراء: ${JSON.stringify(opinions)}`,
  });

  let synthesis = synthesisText;
  let decisions: string[] = [];
  try {
    const j = JSON.parse(synthesisText.slice(synthesisText.indexOf('{'), synthesisText.lastIndexOf('}') + 1));
    synthesis = j.synthesis || synthesisText;
    decisions = Array.isArray(j.decisions) ? j.decisions : [];
  } catch { /* keep raw */ }

  const record: MeetingResult = {
    id: `meet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    topic,
    departmentIds,
    opinions,
    synthesis,
    decisions,
    createdAt: Date.now(),
  };

  try {
    await adminDb.collection('virtual_meetings').doc(record.id).set({
      ...record,
      createdAtTs: FieldValue.serverTimestamp(),
    });
  } catch {}

  return record;
}

export interface CollabOpportunity {
  taskIds: string[];
  departments: string[];
  reason: string;
  score: number;
}

/**
 * تحلّل المهام الجارية وتبحث عن فرص تعاون بين أقسام مختلفة.
 * المصدر: مجموعة `tasks` في Firestore بحالة in-progress.
 */
export async function detectCollaborationOpportunity(
  workspaceId?: string,
  limit = 20
): Promise<CollabOpportunity[]> {
  try {
    let q: any = adminDb.collection('tasks').where('status', 'in', ['in_progress', 'queued']);
    if (workspaceId) q = q.where('workspaceId', '==', workspaceId);
    const snap = await q.limit(limit).get();
    if (snap.empty) return [];

    const tasks = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    const { text } = await generateText({
      model: MODELS.FLASH,
      system: `أنت منسق استراتيجي. حلّل قائمة المهام الحالية وحدد فرص التعاون بين أقسام مختلفة.
أجب JSON: {"opportunities": [{"taskIds":["..."], "departments":["..."], "reason":"...", "score":0.0-1.0}]}`,
      prompt: JSON.stringify(tasks).slice(0, 8000),
    });
    const j = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    return Array.isArray(j.opportunities) ? j.opportunities : [];
  } catch (err: any) {
    console.warn('[virtual-meeting:detectCollab]', err?.message || err);
    return [];
  }
}
