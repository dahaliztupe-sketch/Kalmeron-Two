/**
 * Learning Loop Execution Context (AsyncLocalStorage)
 *
 * Carries `workspaceId` and the originating user `task` across nested async
 * calls without forcing every agent file to thread these values manually.
 *
 * Usage (set once at the entrypoint — HTTP route or orchestrator runner):
 *
 *   await runWithLearningContext({ workspaceId, task }, async () => {
 *     // …all agent invocations underneath inherit this context
 *   });
 *
 * Inside `instrumentAgent` (or any agent body) you can read the active
 * context via `getCurrentLearningContext()`. After `instrumentAgent` loads
 * the relevant skills, it injects the formatted addon back into the context
 * so inner agent code can read it via `getCurrentLearnedSkillsAddon()` and
 * append it to its system prompt.
 *
 * Crucially this does NOT bypass tenant isolation: the workspaceId set here
 * is only used as a fallback when explicit opts.workspaceId is missing, and
 * every Firestore operation in `loop.ts` still validates ownership.
 */
import { AsyncLocalStorage } from 'node:async_hooks';

export interface LearningContext {
  workspaceId: string;
  task: string;
  /** Formatted addon string injected by instrumentAgent for inner reads. */
  learnedSkillsAddon?: string;
  /** IDs of skills currently loaded — used for downstream feedback. */
  learnedSkillIds?: string[];
  /**
   * IDs whose feedback was already recorded by a per-agent instrumentAgent
   * call. Used by the orchestrator's synthesizer to avoid double-counting.
   */
  recordedFeedbackIds?: Set<string>;
}

const storage = new AsyncLocalStorage<LearningContext>();

export function runWithLearningContext<T>(
  ctx: { workspaceId: string; task: string },
  fn: () => Promise<T> | T
): Promise<T> | T {
  if (!ctx.workspaceId || !ctx.task) {
    return fn();
  }
  return storage.run({ workspaceId: ctx.workspaceId, task: ctx.task }, fn);
}

export function getCurrentLearningContext(): LearningContext | undefined {
  return storage.getStore();
}

/**
 * Returns the formatted "learned skills" addon for the current execution, or
 * an empty string if none. Safe to call from any agent's prompt builder —
 * append it to your system prompt to make the agent aware of past lessons.
 */
export function getCurrentLearnedSkillsAddon(): string {
  return storage.getStore()?.learnedSkillsAddon || '';
}

/**
 * Mutates the active context's addon/ids in place. Used by instrumentAgent
 * after it loads relevant skills for the current agent so that nested code
 * (the agent's own body) can read them.
 */
export function setCurrentLearnedSkills(addon: string, ids: string[]): void {
  const store = storage.getStore();
  if (!store) return;
  store.learnedSkillsAddon = addon;
  store.learnedSkillIds = ids;
}

/**
 * Resets any addon/ids previously set in the current context. Call this when
 * a new agent runs and finds NO relevant skills, to prevent stale addon text
 * from a prior agent leaking into this agent's prompt.
 */
export function clearCurrentLearnedSkills(): void {
  const store = storage.getStore();
  if (!store) return;
  store.learnedSkillsAddon = '';
  store.learnedSkillIds = [];
}

/** Marks the given skill IDs as already-recorded for downstream dedupe. */
export function markFeedbackRecorded(ids: string[]): void {
  const store = storage.getStore();
  if (!store) return;
  if (!store.recordedFeedbackIds) store.recordedFeedbackIds = new Set<string>();
  for (const id of ids) store.recordedFeedbackIds.add(id);
}

export function isFeedbackRecorded(id: string): boolean {
  return !!storage.getStore()?.recordedFeedbackIds?.has(id);
}
