import { google } from '@ai-sdk/google';

export type TaskComplexity = 'simple' | 'medium' | 'complex';

/**
 * Classifies the complexity of a user task based on content keywords and length.
 * @param task - The user's input string.
 * @returns {TaskComplexity} The determined complexity level.
 */
export function classifyTaskComplexity(task: string): TaskComplexity {
  const complexitySignals = ['system', 'architecture', 'design', 'algorithm', 'refactor', 'optimize', 'debug', 'analyze', 'خطة', 'تحليل'];
  const simplicitySignals = ['write', 'test', 'fix', 'typo', 'format', 'simple', 'quick', 'تلخيص', 'تصنيف'];

  const hasComplex = complexitySignals.some(s => task.toLowerCase().includes(s));
  const hasSimple = simplicitySignals.some(s => task.toLowerCase().includes(s));
  const length = task.length;

  if (hasComplex || length > 500) return 'complex';
  if (hasSimple || length < 50) return 'simple';
  return 'medium';
}

/**
 * Selects the appropriate AI model based on task complexity.
 * @param complexity - The task complexity level.
 * @returns The selected Gemini model instance.
 */
export function selectModel(complexity: TaskComplexity) {
  switch (complexity) {
    case 'simple':
      return google('gemini-3.1-flash-lite-preview');
    case 'medium':
      return google('gemini-3-flash-preview');
    case 'complex':
      return google('gemini-3.1-pro-preview');
  }
}
