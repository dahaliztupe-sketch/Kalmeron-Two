import { describe, it, expect } from 'vitest';
import { evaluateBudget } from '@/src/lib/billing/budget-guard';

describe('evaluateBudget', () => {
  it('allows when below cap', () => {
    const r = evaluateBudget(40, 100);
    expect(r.ok).toBe(true);
    expect(r.blocked).toBe(false);
    expect(r.remainingUsd).toBe(60);
    expect(r.reason).toBe(null);
  });

  it('blocks when spend equals cap', () => {
    const r = evaluateBudget(100, 100);
    expect(r.ok).toBe(false);
    expect(r.blocked).toBe(true);
    expect(r.remainingUsd).toBe(0);
    expect(r.reason).toBe('over_budget');
  });

  it('blocks when over cap', () => {
    const r = evaluateBudget(150, 100);
    expect(r.blocked).toBe(true);
    expect(r.remainingUsd).toBe(0);
  });

  it('treats zero or non-finite budget as unlimited', () => {
    const z = evaluateBudget(999, 0);
    expect(z.blocked).toBe(false);
    expect(z.remainingUsd).toBe(Number.POSITIVE_INFINITY);

    const inf = evaluateBudget(999, Number.POSITIVE_INFINITY);
    expect(inf.blocked).toBe(false);
  });
});
