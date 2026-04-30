/**
 * Circuit-breaker tests — verifies trip-after-N-failures, cool-down, and
 * recovery via the half-open probe path.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  isProviderOpen,
  recordFailure,
  recordSuccess,
  __resetCircuits,
  __FOR_TESTS,
} from '../src/lib/llm/circuit-breaker';

beforeEach(() => __resetCircuits());

describe('circuit-breaker', () => {
  it('starts closed', () => {
    expect(isProviderOpen('gemini')).toBe(false);
  });

  it('trips to open after THRESHOLD failures', () => {
    for (let i = 0; i < __FOR_TESTS.THRESHOLD; i++) recordFailure('gemini');
    expect(isProviderOpen('gemini')).toBe(true);
  });

  it('does not trip when failures are below threshold', () => {
    for (let i = 0; i < __FOR_TESTS.THRESHOLD - 1; i++) recordFailure('gemini');
    expect(isProviderOpen('gemini')).toBe(false);
  });

  it('moves to half_open after the cool-down window elapses', () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < __FOR_TESTS.THRESHOLD; i++) recordFailure('gemini');
      expect(isProviderOpen('gemini')).toBe(true);
      vi.advanceTimersByTime(__FOR_TESTS.OPEN_MS + 10);
      // half_open is treated as "not open" so the next call probes upstream.
      expect(isProviderOpen('gemini')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a successful call closes the circuit and resets failures', () => {
    for (let i = 0; i < __FOR_TESTS.THRESHOLD; i++) recordFailure('openrouter');
    expect(isProviderOpen('openrouter')).toBe(true);
    recordSuccess('openrouter');
    expect(isProviderOpen('openrouter')).toBe(false);
    // Subsequent failures should need the full threshold again.
    for (let i = 0; i < __FOR_TESTS.THRESHOLD - 1; i++) recordFailure('openrouter');
    expect(isProviderOpen('openrouter')).toBe(false);
  });

  it('a half_open probe failure re-opens immediately', () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < __FOR_TESTS.THRESHOLD; i++) recordFailure('groq');
      vi.advanceTimersByTime(__FOR_TESTS.OPEN_MS + 10);
      // Trigger transition to half_open.
      expect(isProviderOpen('groq')).toBe(false);
      // Probe fails → straight back to open.
      recordFailure('groq');
      expect(isProviderOpen('groq')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

afterEach(() => __resetCircuits());
