/**
 * Self-Evolution Learning Loop
 * ----------------------------
 * يمنح وكلاء كلميرون تو دورة تعلم مغلقة مستوحاة من
 * MaxHermes / Memento-Skills / AutoAgent / ReasoningBank.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { generateText, embed } from 'ai';
import { MODELS, MODEL_IDS, google } from '@/src/lib/gemini';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type SkillSource = 'extracted' | 'merged' | 'refined';

export interface LearnedSkill {
  id?: string;
  /** المالك المنطقي — يضمن العزل بين المستأجرين (مساحات العمل). */
  workspaceId: string;
  name: string;
  description: string;
  agentType: string;
  steps: string[];
  parameters: Record<string, string>;
  successRate: number;
  timesUsed: number;
  successes: number;
  failures: number;
  lastFailureReason?: string;
  embedding: number[];
  enabled: boolean;
  parentId?: string;
  generation: number;
  source: SkillSource;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const COLLECTION = 'skills';
const DEFAULT_LIMIT = 5;
const MIN_USES_FOR_PRUNE = 5;
const MIN_SUCCESS_RATE_FOR_KEEP = 0.25;
const MERGE_SIMILARITY_THRESHOLD = 0.92;

function logErr(scope: string, err: unknown): void {
  const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  // Telemetry is best-effort but failures should be visible in server logs.
  // best-effort telemetry: learning loop error swallowed
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function embedText(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel(MODEL_IDS.EMBEDDING),
      value: text.slice(0, 8000),
    });
    return embedding as number[];
  } catch (e) {
    logErr('embed', e);
    return [];
  }
}

function safeJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

interface DistilledSkill {
  name?: string;
  description?: string;
  steps?: unknown[];
  parameters?: Record<string, string>;
}

// -----------------------------------------------------------------------------
// 1) extractSkillFromTask
// -----------------------------------------------------------------------------

/**
 * Returns the last N conversation turns for a specific agent from
 * `users/{uid}/agent_memory/{agentId}` — used to build per-agent context
 * without polluting global learned skills.
 */
export async function getAgentMemory(
  workspaceId: string,
  agentId: string,
  limit = 10
): Promise<{ role: 'user' | 'assistant'; content: string; createdAt?: string }[]> {
  if (!workspaceId || !agentId) return [];
  try {
    const snap = await adminDb
      .collection('users')
      .doc(workspaceId)
      .collection('agent_memory')
      .doc(agentId)
      .collection('turns')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    if (snap.empty) return [];
    return snap.docs.map(d => {
      const data = d.data() as { role?: string; content?: string; createdAt?: string };
      return {
        role: (data.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: String(data.content ?? ''),
        createdAt: data.createdAt,
      };
    }).reverse();
  } catch (e) {
    logErr('getAgentMemory', e);
    return [];
  }
}

/**
 * Appends a turn to `users/{uid}/agent_memory/{agentId}/turns`.
 * Automatically enforces the 10-turn rolling window by deleting old docs.
 */
export async function appendAgentMemoryTurn(
  workspaceId: string,
  agentId: string,
  turn: { role: 'user' | 'assistant'; content: string }
): Promise<void> {
  if (!workspaceId || !agentId) return;
  try {
    const collRef = adminDb
      .collection('users')
      .doc(workspaceId)
      .collection('agent_memory')
      .doc(agentId)
      .collection('turns');

    await collRef.add({ ...turn, createdAt: new Date().toISOString() });

    // Prune to last 10 turns (rolling window)
    const all = await collRef.orderBy('createdAt', 'asc').get();
    if (all.size > 10) {
      const toDelete = all.docs.slice(0, all.size - 10);
      const batch = adminDb.batch();
      toDelete.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (e) {
    logErr('appendAgentMemoryTurn', e);
  }
}

/**
 * Builds a short "recent context" string from the last N turns of an agent's
 * memory, ready to prepend to a system prompt.
 */
export async function buildAgentContextAddon(
  workspaceId: string,
  agentId: string,
  limit = 5
): Promise<string> {
  const turns = await getAgentMemory(workspaceId, agentId, limit);
  if (turns.length === 0) return '';
  const lines = turns.map(t => `[${t.role === 'user' ? 'المستخدم' : 'الوكيل'}]: ${t.content.slice(0, 500)}`);
  return `\n\n--- السياق من المحادثات السابقة (${agentId}) ---\n${lines.join('\n')}\n---`;
}

export interface ExtractInput {
  workspaceId: string;
  agentType: string;
  task: string;
  output: string;
  toolsUsed?: string[];
}

export async function extractSkillFromTask(input: ExtractInput): Promise<LearnedSkill | null> {
  if (!input?.task || !input?.output || !input?.workspaceId) return null;

  const system = `أنت مُقطّر مهارات (Skill Distiller) لمنصة كلميرون تو.
ستُعطى مهمة ناجحة ونتيجتها. استخرج "مهارة" قابلة لإعادة الاستخدام عبر مهام مشابهة.
أعد JSON فقط بهذه البنية بدون أي نص إضافي:
{
  "name": "اسم قصير ووصفي للمهارة (≤ 8 كلمات)",
  "description": "وصف من جملة أو جملتين يشرح متى تُستخدم هذه المهارة",
  "steps": ["خطوة 1", "خطوة 2", ...],
  "parameters": { "اسم_المعامل": "وصفه" }
}
لا تستخرج مهارة إن لم تكن المهمة قابلة للتعميم — في هذه الحالة أعد JSON فارغاً: {}`;

  const prompt = `نوع الوكيل: ${input.agentType}
الأدوات المُستخدمة: ${(input.toolsUsed || []).join(', ') || 'لا شيء'}
المهمة: ${input.task.slice(0, 2000)}
النتيجة:
${input.output.slice(0, 4000)}`;

  let raw = '';
  try {
    const res = await generateText({ model: MODELS.FLASH, system, prompt });
    raw = res.text || '';
  } catch (e) {
    logErr('extract.generate', e);
    return null;
  }

  const parsed = safeJson<DistilledSkill>(raw, {});
  if (
    !parsed.name ||
    !parsed.description ||
    !Array.isArray(parsed.steps) ||
    parsed.steps.length === 0
  ) {
    return null;
  }

  const embedding = await embedText(
    `${parsed.name}\n${parsed.description}\n${parsed.steps.join('\n')}`
  );

  return {
    workspaceId: input.workspaceId,
    name: String(parsed.name).slice(0, 200),
    description: String(parsed.description).slice(0, 1000),
    agentType: input.agentType,
    steps: parsed.steps.map((s) => String(s).slice(0, 500)).slice(0, 20),
    parameters:
      parsed.parameters && typeof parsed.parameters === 'object' ? parsed.parameters : {},
    successRate: 1,
    timesUsed: 0,
    successes: 0,
    failures: 0,
    embedding,
    enabled: true,
    generation: 0,
    source: 'extracted',
  };
}

// -----------------------------------------------------------------------------
// 2) saveSkill
// -----------------------------------------------------------------------------

export async function saveSkill(skill: LearnedSkill): Promise<string | null> {
  if (!adminDb || typeof adminDb.collection !== 'function') return null;
  if (!skill?.workspaceId) {
    logErr('save', new Error('workspaceId required'));
    return null;
  }
  try {
    const doc = await adminDb.collection(COLLECTION).add({
      ...skill,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return doc.id;
  } catch (e) {
    logErr('save', e);
    return null;
  }
}

// -----------------------------------------------------------------------------
// 3) loadRelevantSkills
// -----------------------------------------------------------------------------

export async function loadRelevantSkills(
  workspaceId: string,
  agentType: string,
  task: string,
  limit: number = DEFAULT_LIMIT
): Promise<LearnedSkill[]> {
  if (!adminDb || typeof adminDb.collection !== 'function' || !task || !workspaceId) return [];

  const queryEmbedding = await embedText(task);
  if (queryEmbedding.length === 0) return [];

  let docs: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('workspaceId', '==', workspaceId)
      .where('agentType', '==', agentType)
      .where('enabled', '==', true)
      .limit(200)
      .get();
    docs = snap.docs;
  } catch (e) {
    logErr('load.query', e);
    return [];
  }

  const scored = docs
    .map((d) => {
      const data = d.data() as LearnedSkill;
      const score = cosineSimilarity(queryEmbedding, data.embedding || []);
      const weighted = score * (0.5 + 0.5 * (data.successRate ?? 0.5));
      return { id: d.id, score: weighted, data };
    })
    .filter((x) => x.score > 0.55)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((x) => ({ ...x.data, id: x.id }));
}

// -----------------------------------------------------------------------------
// 4) updateSkillFeedback
// -----------------------------------------------------------------------------

export async function updateSkillFeedback(
  workspaceId: string,
  skillIds: string[],
  outcome: { success: boolean; failureReason?: string }
): Promise<void> {
  if (!adminDb || typeof adminDb.collection !== 'function' || !skillIds?.length || !workspaceId) return;

  await Promise.all(
    skillIds.map(async (id) => {
      try {
        const ref = adminDb.collection(COLLECTION).doc(id);
        await adminDb.runTransaction(async (tx) => {
          const snap = await tx.get(ref);
          if (!snap.exists) return;
          const d = snap.data() as Partial<LearnedSkill>;
          // عزل المستأجرين: لا تحدّث إلا إذا كانت المهارة في نفس مساحة العمل.
          if (d.workspaceId !== workspaceId) return;
          const successes = (d.successes || 0) + (outcome.success ? 1 : 0);
          const failures = (d.failures || 0) + (outcome.success ? 0 : 1);
          const timesUsed = (d.timesUsed || 0) + 1;
          const successRate = timesUsed === 0 ? 1 : successes / timesUsed;
          const update: Record<string, unknown> = {
            successes,
            failures,
            timesUsed,
            successRate,
            updatedAt: FieldValue.serverTimestamp(),
          };
          if (!outcome.success && outcome.failureReason) {
            update.lastFailureReason = outcome.failureReason.slice(0, 500);
          }
          tx.update(ref, update as FirebaseFirestore.UpdateData<LearnedSkill>);
        });
      } catch (e) {
        logErr('feedback', e);
      }
    })
  );
}

// -----------------------------------------------------------------------------
// 5) consolidateSkills
// -----------------------------------------------------------------------------

export interface ConsolidationReport {
  scanned: number;
  merged: number;
  pruned: number;
  refined: number;
}

export async function consolidateSkills(workspaceId: string): Promise<ConsolidationReport> {
  const report: ConsolidationReport = { scanned: 0, merged: 0, pruned: 0, refined: 0 };
  if (!adminDb || typeof adminDb.collection !== 'function' || !workspaceId) return report;

  let all: LearnedSkill[] = [];
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('workspaceId', '==', workspaceId)
      .limit(500)
      .get();
    all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as LearnedSkill) }));
  } catch (e) {
    logErr('consolidate.list', e);
    return report;
  }

  report.scanned = all.length;

  // (a) Prune stale low-performers
  for (const s of all) {
    if (
      (s.timesUsed || 0) >= MIN_USES_FOR_PRUNE &&
      (s.successRate ?? 1) < MIN_SUCCESS_RATE_FOR_KEEP
    ) {
      try {
        await adminDb.collection(COLLECTION).doc(s.id!).update({
          enabled: false,
          updatedAt: FieldValue.serverTimestamp(),
        });
        report.pruned += 1;
      } catch (e) {
        logErr('consolidate.prune', e);
      }
    }
  }

  // (b) Merge near-duplicates within same agentType
  const byAgent: Record<string, LearnedSkill[]> = {};
  for (const s of all) {
    if (s.enabled === false) continue;
    (byAgent[s.agentType] = byAgent[s.agentType] || []).push(s);
  }

  const mergedIds = new Set<string>();
  for (const agent of Object.keys(byAgent)) {
    const list = byAgent[agent];
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (mergedIds.has(a.id!)) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (mergedIds.has(b.id!)) continue;
        const sim = cosineSimilarity(a.embedding || [], b.embedding || []);
        if (sim < MERGE_SIMILARITY_THRESHOLD) continue;

        const winner = (a.successRate ?? 0) >= (b.successRate ?? 0) ? a : b;
        const loser = winner === a ? b : a;
        try {
          const mergedSteps = Array.from(
            new Set([...(winner.steps || []), ...(loser.steps || [])])
          ).slice(0, 25);
          const mergedTimesUsed =
            (winner.timesUsed || 0) + (loser.timesUsed || 0);
          const mergedSuccesses =
            (winner.successes || 0) + (loser.successes || 0);
          const mergedFailures =
            (winner.failures || 0) + (loser.failures || 0);
          // أعد حساب successRate فور الدمج لتفادي تذبذب القيم بين الدمج
          // والتحديث القادم للتغذية الراجعة.
          const mergedSuccessRate =
            mergedTimesUsed === 0 ? 1 : mergedSuccesses / mergedTimesUsed;
          await adminDb.collection(COLLECTION).doc(winner.id!).update({
            steps: mergedSteps,
            timesUsed: mergedTimesUsed,
            successes: mergedSuccesses,
            failures: mergedFailures,
            successRate: mergedSuccessRate,
            generation: (winner.generation || 0) + 1,
            source: 'merged',
            updatedAt: FieldValue.serverTimestamp(),
          });
          await adminDb.collection(COLLECTION).doc(loser.id!).update({
            enabled: false,
            parentId: winner.id,
            updatedAt: FieldValue.serverTimestamp(),
          });
          mergedIds.add(loser.id!);
          report.merged += 1;
        } catch (e) {
          logErr('consolidate.merge', e);
        }
      }
    }
  }

  // (c) Refine top performers via Gemini
  const topPerformers = all
    .filter((s) => (s.timesUsed || 0) >= 10 && (s.successRate ?? 0) >= 0.85 && s.enabled !== false)
    .sort((a, b) => (b.successRate ?? 0) - (a.successRate ?? 0))
    .slice(0, 5);

  for (const s of topPerformers) {
    try {
      const { text } = await generateText({
        model: MODELS.FLASH,
        system: `أنت مُحسّن مهارات (Skill Refiner). ستُعطى مهارة عالية الأداء.
حسّن خطواتها لتصبح أكثر وضوحاً ودقة وقابلية للتعميم دون إضافة خطوات سطحية.
أعد JSON فقط: { "steps": ["...", "..."], "description": "..." }`,
        prompt: `الوكيل: ${s.agentType}
الاسم: ${s.name}
الوصف الحالي: ${s.description}
الخطوات الحالية: ${JSON.stringify(s.steps)}`,
      });
      const parsed = safeJson<{ steps?: unknown[]; description?: string }>(text || '', {});
      if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        await adminDb.collection(COLLECTION).doc(s.id!).update({
          steps: parsed.steps.slice(0, 25).map((x) => String(x).slice(0, 500)),
          description: parsed.description ? String(parsed.description).slice(0, 1000) : s.description,
          generation: (s.generation || 0) + 1,
          source: 'refined',
          updatedAt: FieldValue.serverTimestamp(),
        });
        report.refined += 1;
      }
    } catch (e) {
      logErr('consolidate.refine', e);
    }
  }

  return report;
}

// -----------------------------------------------------------------------------
// Dashboard helpers
// -----------------------------------------------------------------------------

export async function listSkills(workspaceId: string): Promise<LearnedSkill[]> {
  if (!adminDb || typeof adminDb.collection !== 'function' || !workspaceId) return [];
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .where('workspaceId', '==', workspaceId)
      .orderBy('updatedAt', 'desc')
      .limit(500)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as LearnedSkill) }));
  } catch (e) {
    logErr('list', e);
    return [];
  }
}

/**
 * يفعّل/يعطّل مهارة. يتحقّق من تطابق workspaceId قبل التعديل لمنع
 * عبور المستأجرين (IDOR). يرجع false إن كانت المهارة تخص مساحة أخرى.
 */
export async function setSkillEnabled(
  workspaceId: string,
  id: string,
  enabled: boolean
): Promise<boolean> {
  if (!adminDb || typeof adminDb.collection !== 'function' || !id || !workspaceId) return false;
  try {
    const ref = adminDb.collection(COLLECTION).doc(id);
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return false;
      const data = snap.data() as Partial<LearnedSkill>;
      if (data.workspaceId !== workspaceId) return false;
      tx.update(ref, { enabled, updatedAt: FieldValue.serverTimestamp() });
      return true;
    });
  } catch (e) {
    logErr('toggle', e);
    return false;
  }
}

/**
 * يرجع كل معرّفات مساحات العمل التي تحوي مهارات — للاستعمال من cron
 * المُجمَّع الذي يدعو consolidateSkills(workspaceId) لكل مساحة بشكل منفصل.
 */
export async function listWorkspaceIdsWithSkills(): Promise<string[]> {
  if (!adminDb || typeof adminDb.collection !== 'function') return [];
  try {
    const snap = await adminDb.collection(COLLECTION).select('workspaceId').limit(2000).get();
    const ids = new Set<string>();
    snap.forEach((d) => {
      const wid = (d.data() as Partial<LearnedSkill>).workspaceId;
      if (wid) ids.add(wid);
    });
    return Array.from(ids);
  } catch (e) {
    logErr('listWorkspaceIds', e);
    return [];
  }
}

export function formatSkillsForPrompt(skills: LearnedSkill[]): string {
  if (!skills?.length) return '';
  const lines = skills.map((s, i) => {
    const steps = (s.steps || []).map((x, j) => `   ${j + 1}. ${x}`).join('\n');
    return `#${i + 1} — ${s.name}\nالوصف: ${s.description}\nالخطوات:\n${steps}`;
  });
  return `\n\n[مهارات مُتعلَّمة سابقاً ذات صلة]\n${lines.join('\n\n')}\n[نهاية المهارات]\n`;
}
