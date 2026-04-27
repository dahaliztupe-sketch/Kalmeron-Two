// @ts-nocheck
/**
 * Recipe runner — يأخذ وصفة + قيم المستخدم لكل خطوة، ويرتّبها كسلسلة
 * إجراءات في الـ registry. كل خطوة بحاجة موافقة → تذهب لصندوق الموافقات،
 * كل خطوة فورية → تُنفَّذ مباشرة. تُتتبَّع تحت `recipe_runs/{id}`.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { requestAction, getAction } from '@/src/ai/actions/registry';
import { getRecipe } from './registry';

export interface RunRecipeArgs {
  userId: string;
  recipeId: string;
  steps: { stepId: string; input: unknown }[];
  rationale: string;
}

export async function runRecipe(args: RunRecipeArgs) {
  const recipe = getRecipe(args.recipeId);
  if (!recipe) return { ok: false, error: 'recipe_not_found' };
  if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };

  const inputByStep = new Map(args.steps.map((s) => [s.stepId, s.input]));

  const runRef = await adminDb.collection('recipe_runs').add({
    userId: args.userId,
    recipeId: recipe.id,
    title: recipe.title,
    rationale: args.rationale,
    status: 'running',
    totalSteps: recipe.steps.length,
    completedSteps: 0,
    pendingApprovals: 0,
    createdAt: new Date(),
  });

  const stepResults: unknown[] = [];
  let pendingApprovals = 0;
  let completed = 0;

  for (const step of recipe.steps) {
    const input = { ...(step.defaults || {}), ...((inputByStep.get(step.id) as object) || {}) };
    const action = getAction(step.actionId);
    if (!action) {
      stepResults.push({ stepId: step.id, ok: false, error: 'action_unknown', actionId: step.actionId });
      continue;
    }
    try {
      const r = await requestAction({
        userId: args.userId,
        actionId: step.actionId,
        input,
        rationale: `[وصفة: ${recipe.title} → ${step.title}] ${step.rationale}`,
        requestedBy: 'recipe_runner',
      });
      if (r.status === 'pending') pendingApprovals += 1;
      else completed += 1;
      stepResults.push({
        stepId: step.id,
        ok: true,
        actionId: step.actionId,
        actionDocId: r.id,
        status: r.status,
      });
      // Link the action doc back to this run for the operations room
      if (adminDb?.collection) {
        await adminDb
          .collection('action_requests')
          .doc(r.id)
          .update({ recipeRunId: runRef.id, recipeStepId: step.id })
          .catch(() => {});
      }
    } catch (e: unknown) {
      stepResults.push({ stepId: step.id, ok: false, error: (e as Error)?.message || 'enqueue_failed' });
    }
  }

  await runRef.update({
    status: pendingApprovals > 0 ? 'awaiting_approvals' : 'all_dispatched',
    pendingApprovals,
    completedSteps: completed,
    stepResults,
    updatedAt: new Date(),
  });

  return {
    ok: true,
    runId: runRef.id,
    pendingApprovals,
    autoExecuted: completed,
    steps: stepResults,
  };
}
