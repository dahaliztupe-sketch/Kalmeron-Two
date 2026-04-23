/**
 * Self-Evolution Learning Loop — public entry point at the expected audit path.
 * Re-exports the full implementation that lives under `src/lib/learning/loop.ts`.
 */
export {
  extractSkillFromTask,
  saveSkill,
  loadRelevantSkills,
  updateSkillFeedback,
  consolidateSkills,
  listSkills,
  setSkillEnabled,
  listWorkspaceIdsWithSkills,
  formatSkillsForPrompt,
} from '@/src/lib/learning/loop';

export type {
  LearnedSkill,
  SkillSource,
  ExtractInput,
  ConsolidationReport,
} from '@/src/lib/learning/loop';
