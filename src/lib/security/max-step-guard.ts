/**
 * Max-step guard for agent loops (Task Path Collapse mitigation).
 *
 * Long-running LangGraph / Mastra workflows can collapse into infinite cycles
 * when an agent keeps re-routing back to itself. This primitive enforces a
 * hard ceiling on the number of steps a single execution may take.
 *
 * Usage inside an orchestrator node:
 *   const budget = createStepBudget({ max: 12, label: 'plan-builder-loop' });
 *   for (...) {
 *     budget.tick();
 *   }
 *
 * Or guard a section that may recurse:
 *   await budget.assertWithinBudget();
 *
 * The guard emits a structured warn log on every overflow so we can spot
 * pathological agents in observability before users do.
 */
import { logger } from '@/src/lib/logger';

export class StepBudgetExceededError extends Error {
  readonly code = 'step_budget_exceeded';
  constructor(public readonly label: string, public readonly max: number) {
    super(`Step budget exceeded: "${label}" reached ${max} steps`);
    this.name = 'StepBudgetExceededError';
  }
}

export interface StepBudget {
  /** Increment the counter; throws StepBudgetExceededError when over `max`. */
  tick(): void;
  /** Read-only view of how many steps remain before the next overflow. */
  remaining(): number;
  /** Current count (number of `tick()` calls so far). */
  used(): number;
  /** Throw if the counter has exceeded the budget without ticking. */
  assertWithinBudget(): void;
  /** Reset for re-use (rare; mostly tests). */
  reset(): void;
}

export interface StepBudgetOptions {
  /** Maximum number of steps allowed. Default: 16. */
  max?: number;
  /** Human-readable identifier surfaced in logs and errors. */
  label: string;
  /**
   * Whether to throw on overflow (default true) or silently degrade. The
   * silent mode is useful when an agent should keep responding to the user
   * but stop iterating internally.
   */
  throwOnOverflow?: boolean;
}

const DEFAULT_MAX = 16;

export function createStepBudget(opts: StepBudgetOptions): StepBudget {
  const max = Math.max(1, opts.max ?? DEFAULT_MAX);
  const label = opts.label;
  const throwOnOverflow = opts.throwOnOverflow !== false;
  let count = 0;

  const log = logger.child({ component: 'step-budget', label, max });

  const fail = () => {
    log.warn({ event: 'step_budget_exceeded', used: count }, 'step_budget_exceeded');
    if (throwOnOverflow) {
      throw new StepBudgetExceededError(label, max);
    }
  };

  return {
    tick() {
      count += 1;
      if (count > max) fail();
    },
    remaining() {
      return Math.max(0, max - count);
    },
    used() {
      return count;
    },
    assertWithinBudget() {
      if (count > max) fail();
    },
    reset() {
      count = 0;
    },
  };
}
