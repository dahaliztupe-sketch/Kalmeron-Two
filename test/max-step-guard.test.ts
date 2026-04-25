import { describe, it, expect } from 'vitest';
import {
  createStepBudget,
  StepBudgetExceededError,
} from '@/src/lib/security/max-step-guard';

describe('createStepBudget', () => {
  it('allows up to `max` ticks then throws on overflow', () => {
    const budget = createStepBudget({ label: 'test', max: 3 });
    budget.tick();
    budget.tick();
    budget.tick();
    expect(budget.used()).toBe(3);
    expect(budget.remaining()).toBe(0);
    expect(() => budget.tick()).toThrow(StepBudgetExceededError);
  });

  it('throwOnOverflow=false degrades silently', () => {
    const budget = createStepBudget({ label: 'soft', max: 1, throwOnOverflow: false });
    budget.tick();
    expect(() => budget.tick()).not.toThrow();
    expect(budget.used()).toBeGreaterThan(1);
  });

  it('reset returns the counter to zero', () => {
    const budget = createStepBudget({ label: 'r', max: 2 });
    budget.tick();
    budget.tick();
    budget.reset();
    expect(budget.used()).toBe(0);
    expect(budget.remaining()).toBe(2);
    expect(() => budget.tick()).not.toThrow();
  });

  it('default max is at least 1', () => {
    const budget = createStepBudget({ label: 'd', max: 0 });
    budget.tick();
    expect(() => budget.tick()).toThrow(StepBudgetExceededError);
  });
});
