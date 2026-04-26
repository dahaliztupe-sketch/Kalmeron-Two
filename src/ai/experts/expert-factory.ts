// @ts-nocheck
/**
 * Expert Factory — يولّد خبراء متخصصين من وصف باللغة الطبيعية.
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export interface Expert {
  id?: string;
  workspaceId?: string;
  creatorId: string;
  name: string;
  domain: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  model: string;
  temperature: number;
  examples: Array<{ q: string; a: string }>;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const COLLECTION = 'experts';
const ALLOWED_TOOLS = [
  'browse_web',
  'read_file_from_vm',
  'write_file_to_vm',
  'send_email_from_vm',
  'search_memory',
  'query_rag',
  'run_code',
];

function sanitizeTools(tools: unknown[]): string[] {
  if (!Array.isArray(tools)) return [];
  return tools.filter((t) => typeof t === 'string' && ALLOWED_TOOLS.includes(t));
}

export async function createExpertFromDescription(
  description: string,
  creatorId: string,
  opts: { workspaceId?: string } = {}
): Promise<Expert> {
  const { text } = await generateText({
    model: MODELS.FLASH,
    system: `أنت مصنع خبراء. حوّل وصفاً باللغة الطبيعية إلى تعريف خبير رقمي متكامل.
أجب JSON فقط:
{
  "name": "اسم الخبير",
  "domain": "مجال التخصص",
  "systemPrompt": "موجه نظام عربي مخصص يصف الشخصية، الأسلوب، الحدود",
  "tools": ["اختر من: ${ALLOWED_TOOLS.join(', ')}"],
  "temperature": 0.0-1.0,
  "examples": [{"q":"...","a":"..."}, ...]
}`,
    prompt: description,
  });

  let parsed: unknown = {};
  try {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    parsed = JSON.parse(text.slice(first, last + 1));
  } catch {
    parsed = { name: 'Expert', domain: 'general', systemPrompt: description, tools: [], temperature: 0.4, examples: [] };
  }

  const expert: Expert = {
    creatorId,
    workspaceId: opts.workspaceId,
    name: String(parsed.name || 'Expert').slice(0, 80),
    domain: String(parsed.domain || 'general').slice(0, 80),
    description,
    systemPrompt: String(parsed.systemPrompt || description).slice(0, 8000),
    tools: sanitizeTools(parsed.tools),
    model: 'gemini-2.5-flash',
    temperature: typeof parsed.temperature === 'number' ? Math.max(0, Math.min(1, parsed.temperature)) : 0.4,
    examples: Array.isArray(parsed.examples) ? parsed.examples.slice(0, 10) : [],
  };
  return expert;
}

export async function saveExpert(expert: Expert): Promise<string> {
  const payload = {
    ...expert,
    createdAt: expert.createdAt ?? FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  let id: string;
  if (expert.id) {
    await adminDb.collection(COLLECTION).doc(expert.id).set(payload, { merge: true });
    id = expert.id;
  } else {
    const ref = await adminDb.collection(COLLECTION).add(payload);
    id = ref.id;
  }
  if (expert.workspaceId) {
    const { afterAgentRun } = await import('@/src/lib/agents/hooks');
    afterAgentRun({
      workspaceId: expert.workspaceId,
      userId: expert.creatorId,
      agent: 'expert_factory',
      event: 'expert.created',
      payload: { id, name: expert.name, domain: expert.domain },
      notification: {
        type: 'expert.created',
        title: 'تم إنشاء خبير جديد',
        body: `${expert.name} — ${expert.domain}`,
        href: `/experts`,
      },
      estimatedTokens: 1500,
    }).catch(() => {});
  }
  return id;
}

export async function loadExpert(expertId: string): Promise<Expert | null> {
  const snap = await adminDb.collection(COLLECTION).doc(expertId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Expert) };
}

export async function listExperts(filter: { workspaceId?: string; creatorId?: string } = {}): Promise<Expert[]> {
  let q: unknown = adminDb.collection(COLLECTION);
  if (filter.workspaceId) q = q.where('workspaceId', '==', filter.workspaceId);
  if (filter.creatorId) q = q.where('creatorId', '==', filter.creatorId);
  const snap = await q.limit(100).get();
  return snap.docs.map((d: unknown) => ({ id: d.id, ...d.data() }));
}

/** تُنفّذ استعلام المستخدم على خبير محفوظ (helper للاستخدام في الواجهة). */
export async function invokeExpert(expertId: string, userMessage: string): Promise<string> {
  const expert = await loadExpert(expertId);
  if (!expert) throw new Error(`Expert not found: ${expertId}`);
  const { text } = await generateText({
    model: MODELS.FLASH,
    system: expert.systemPrompt,
    prompt: userMessage,
  });
  return text;
}
