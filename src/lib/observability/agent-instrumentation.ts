/**
 * أداة تغليف موحّدة (instrumentation wrapper) لربط أي وكيل بكلٍ من:
 *   - Drift Detector (drift-detector.ts) — لقياس الانجراف عبر الزمن.
 *   - Langfuse (langfuse.ts)            — لتتبّع كل استدعاء كـ trace.
 *
 * الاستخدام داخل وكيل:
 *   return instrumentAgent('cfo_agent', async () => { ...invoke logic... });
 *
 * أي وكيل يلتفّ بهذه الدالة يبدأ فوراً بتغذية لوحة الحوكمة.
 */
import { recordDriftSample } from './drift-detector';
import { logAgentGeneration } from './langfuse';
import { recordInvocation } from '@/src/ai/organization/compliance/monitor';
import { addEntity, isKnowledgeGraphEnabled } from '@/src/lib/memory/knowledge-graph';
import { updateOKRProgress } from '@/src/lib/okr/okr-store';
import {
  loadRelevantSkills,
  extractSkillFromTask,
  saveSkill,
  updateSkillFeedback,
  formatSkillsForPrompt,
  type LearnedSkill,
} from '@/src/lib/learning/loop';
import {
  getCurrentLearningContext,
  setCurrentLearnedSkills,
  clearCurrentLearnedSkills,
  markFeedbackRecorded,
  runWithBootstrapAddon,
} from '@/src/lib/learning/context';
import { getBootstrapSkillsAddon } from '@/src/lib/agent-skills/runtime-loader';

export interface InstrumentOptions {
  model?: string;
  input?: unknown;
  toolsUsed?: string[];
  trace?: unknown;
  /** اختياري: تسجيل المخرجات تلقائياً في الدماغ المشترك */
  userId?: string;
  /** اختياري: نوع الكيان الذي ينتج عن نجاح الاستدعاء */
  findingType?: string;
  /** اختياري: ربط النتيجة بنتيجة رئيسية */
  okrUpdate?: { okrId: string; krIndex: number; delta?: number; current?: number };
  /** اختياري: نص المهمة (لاستخدامه في تلقيح الذاكرة بمهارات مُتعلَّمة) */
  task?: string;
  /** مطلوب لتفعيل دورة التعلم — يضمن العزل بين مساحات العمل. */
  workspaceId?: string;
  /** اختياري: تعطيل دورة التعلم لهذا الاستدعاء */
  disableLearning?: boolean;
  /** يتم حقنها بواسطة withLearnedSkills قبل التنفيذ */
  loadedSkills?: LearnedSkill[];
}

/**
 * يحمّل المهارات المُتعلَّمة الأنسب قبل تنفيذ الوكيل ويرجعها كنص جاهز
 * للحقن في system prompt. استخدمه قبل بناء الـ system message.
 */
export async function withLearnedSkills(
  workspaceId: string,
  agentName: string,
  task: string,
  limit = 5
): Promise<{ skills: LearnedSkill[]; promptAddon: string }> {
  if (!task || !workspaceId) return { skills: [], promptAddon: '' };
  try {
    const skills = await loadRelevantSkills(workspaceId, agentName, task, limit);
    return { skills, promptAddon: formatSkillsForPrompt(skills) };
  } catch {
    return { skills: [], promptAddon: '' };
  }
}

export async function instrumentAgent<T>(
  agentName: string,
  exec: () => Promise<T>,
  opts: InstrumentOptions = {}
): Promise<T> {
  const start = Date.now();
  let success = true;
  let errorCode: string | undefined;
  let result: T | undefined;

  // ---- Learning loop: tenant-scoped via opts OR ambient AsyncLocalStorage ctx ----
  // Falling back to the ambient context lets us light up learning across ALL
  // agent files without modifying each one — the orchestrator entrypoint sets
  // the context once via runWithLearningContext().
  const ambient = getCurrentLearningContext();
  const effectiveWorkspaceId = opts.workspaceId || ambient?.workspaceId || '';
  const effectiveTask = opts.task || ambient?.task || '';
  const learningEnabled =
    !opts.disableLearning && !!effectiveWorkspaceId && !!effectiveTask;

  let preloadedSkills: LearnedSkill[] = opts.loadedSkills || [];
  if (learningEnabled && !preloadedSkills.length) {
    try {
      preloadedSkills = await loadRelevantSkills(
        effectiveWorkspaceId,
        agentName,
        effectiveTask,
        5
      );
    } catch { preloadedSkills = []; }
  }
  // اجعل المهارات مرئية للكود الداخلي (مثل بنّاء system prompt) عبر السياق،
  // وامسح أي قيمة قديمة من وكيل سابق إذا لم نجد مهارات لهذا الاستدعاء حتى
  // لا تتسرّب نصوص قديمة إلى prompt الوكيل التالي.
  //
  // نَدمج هنا مصدرين:
  //   1) المهارات البذريّة (Bootstrap) من ملفّات SKILL.md المُسجّلة لهذا
  //      الوكيل في `agent-skills/registry.ts` — تعمل دون الحاجة إلى
  //      workspaceId وتُحقن دائماً.
  //   2) المهارات المُتعلَّمة (LearnedSkill) من Firestore — تتطلّب
  //      workspaceId ومهمّة فعليّة.
  const bootstrapAddon = getBootstrapSkillsAddon(agentName);
  const learnedAddon = preloadedSkills.length
    ? formatSkillsForPrompt(preloadedSkills)
    : '';
  const combinedAddon = [bootstrapAddon, learnedAddon].filter(Boolean).join('\n\n');
  const combinedIds = preloadedSkills.map((s) => s.id!).filter(Boolean);

  // ملاحظة: إذا كان `learningEnabled=false` لا يوجد AsyncLocalStorage
  // فعّال للكتابة عليه؛ في هذه الحالة نُنشئ سياقاً خفيفاً حول التنفيذ
  // فقط ليصل البذريّ إلى `getCurrentLearnedSkillsAddon()` داخل الوكيل.
  if (learningEnabled) {
    if (combinedAddon) {
      setCurrentLearnedSkills(combinedAddon, combinedIds);
    } else {
      clearCurrentLearnedSkills();
    }
  }

  // إذا لم تكن دورة التعلّم مُفعّلة، نَلفّ exec بسياق خفيف يحمل البذريّ
  // فقط — حتى يصل `getCurrentLearnedSkillsAddon()` إلى المهارات داخل الوكيل.
  const runExec = () =>
    !learningEnabled && combinedAddon
      ? runWithBootstrapAddon(combinedAddon, combinedIds, exec)
      : exec();

  try {
    result = await runExec();
    return result;
  } catch (e: unknown) {
    success = false;
    const errObj = e as { code?: string; name?: string } | null | undefined;
    errorCode = errObj?.code || errObj?.name || 'unknown_error';
    throw e;
  } finally {
    const latencyMs = Date.now() - start;
    const responseLength = typeof result === 'string' ? result.length : JSON.stringify(result || '').length;
    void recordDriftSample({
      agent: agentName,
      toolsUsed: opts.toolsUsed || [],
      responseLength,
      latencyMs,
      success,
      errorCode,
    });
    try {
      recordInvocation(agentName, latencyMs, 0, success ? undefined : errorCode);
    } catch { /* never break call site */ }

    // Phase 6: optional auto-tracking of OKR + knowledge graph (best-effort, never throws)
    if (success && opts.userId && opts.findingType) {
      void (async () => {
        try {
          if (await isKnowledgeGraphEnabled()) {
            await addEntity(opts.userId!, opts.findingType!, {
              source: agentName,
              summary: typeof result === 'string' ? result.slice(0, 500) : undefined,
              latencyMs,
              createdAt: new Date().toISOString(),
            });
          }
        } catch { /* swallow */ }
      })();
    }
    if (success && opts.okrUpdate) {
      void (async () => {
        try {
          const next = opts.okrUpdate!.current
            ?? (opts.okrUpdate!.delta ? undefined : undefined);
          if (typeof next === 'number') {
            await updateOKRProgress(opts.okrUpdate!.okrId, opts.okrUpdate!.krIndex, next);
          } else if (typeof opts.okrUpdate!.delta === 'number') {
            // delta-based: requires read-modify-write inside the store layer
            const { getOKR } = await import('@/src/lib/okr/okr-store');
            const okr = await getOKR(opts.okrUpdate!.okrId) as { keyResults?: Array<{ current?: number }> } | null;
            const cur = okr?.keyResults?.[opts.okrUpdate!.krIndex]?.current || 0;
            await updateOKRProgress(opts.okrUpdate!.okrId, opts.okrUpdate!.krIndex, cur + opts.okrUpdate!.delta);
          }
        } catch { /* swallow */ }
      })();
    }

    void logAgentGeneration({
      trace: opts.trace as Parameters<typeof logAgentGeneration>[0]['trace'],
      agent: agentName,
      model: opts.model || 'unknown',
      input: opts.input,
      output: result,
      latencyMs,
      success,
    });

    // ---- Learning loop: feedback + skill extraction (tenant-scoped) ----
    if (learningEnabled) {
      const usedIds = (preloadedSkills || []).map((s) => s.id!).filter(Boolean);
      if (usedIds.length) {
        void updateSkillFeedback(effectiveWorkspaceId, usedIds, {
          success,
          failureReason: success ? undefined : errorCode,
        }).catch(() => {});
        // أعلم العقد العلوية (مثل synthesizer) أننا سجّلنا التغذية الراجعة
        // لهذه المعرّفات لتفادي العدّ المضاعف.
        markFeedbackRecorded(usedIds);
      }
      if (success) {
        const taskText = effectiveTask;
        const wid = effectiveWorkspaceId;
        void (async () => {
          try {
            const outputStr =
              typeof result === 'string' ? result : JSON.stringify(result || '').slice(0, 6000);
            const skill = await extractSkillFromTask({
              workspaceId: wid,
              agentType: agentName,
              task: taskText,
              output: outputStr,
              toolsUsed: opts.toolsUsed || [],
            });
            if (skill) await saveSkill(skill);
          } catch { /* swallow */ }
        })();
      }
    }
  }
}
