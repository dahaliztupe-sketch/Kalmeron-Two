/**
 * Budget enforcement — verifies per-model and per-provider caps and that
 * an over-budget call is correctly denied.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { enforceBudget, recordSpend, __resetBudget, getBudgetSnapshot } from '../src/lib/llm/budget';

const ORIG = { ...process.env };

beforeEach(() => {
  __resetBudget();
  delete process.env.MODEL_BUDGETS;
});
afterEach(() => { process.env = { ...ORIG }; __resetBudget(); });

describe('budget', () => {
  it('allows everything when no caps are set', () => {
    const d = enforceBudget('gpt-5', 'openai', 100);
    expect(d.allow).toBe(true);
    expect(d.capUsd).toBe(Infinity);
  });

  it('denies a call that would exceed a per-model cap', () => {
    process.env.MODEL_BUDGETS = JSON.stringify({ 'claude-opus-4-5': 1 });
    __resetBudget();
    recordSpend('claude-opus-4-5', 0.95);
    const d = enforceBudget('claude-opus-4-5', 'anthropic', 0.10);
    expect(d.allow).toBe(false);
    expect(d.reason).toMatch(/exceeds cap/);
  });

  it('uses per-provider cap as a fallback when no per-model cap is set', () => {
    process.env.MODEL_BUDGETS = JSON.stringify({ openai: 0.5 });
    __resetBudget();
    recordSpend('gpt-5-nano', 0.40);
    const d = enforceBudget('gpt-5-nano', 'openai', 0.20);
    expect(d.allow).toBe(false);
  });

  it('reports a snapshot ordered by utilisation %', () => {
    process.env.MODEL_BUDGETS = JSON.stringify({ 'a': 1, 'b': 1 });
    __resetBudget();
    recordSpend('a', 0.10);
    recordSpend('b', 0.80);
    const snap = getBudgetSnapshot();
    expect(snap[0].model).toBe('b');
    expect(snap[0].pct).toBeGreaterThan(snap[1].pct);
  });
});
