import { describe, it, expect } from 'vitest';
import { compactHistory, type CompactMessage } from '@/src/lib/memory/compress-context';

function turn(role: CompactMessage['role'], content: string): CompactMessage {
  return { role, content };
}

describe('compactHistory', () => {
  it('returns the input unchanged when below the recent window', async () => {
    const history: CompactMessage[] = [
      turn('system', 'You are helpful'),
      turn('user', 'hi'),
      turn('assistant', 'hello'),
    ];
    const out = await compactHistory(history, { recent: 8 });
    expect(out.length).toBe(history.length);
  });

  it('summarizes older turns into a single system message and keeps recent K verbatim', async () => {
    const sys = turn('system', 'You are helpful');
    const older: CompactMessage[] = Array.from({ length: 10 }, (_, i) =>
      turn(i % 2 === 0 ? 'user' : 'assistant', `msg-${i}`),
    );
    const recent: CompactMessage[] = Array.from({ length: 4 }, (_, i) =>
      turn(i % 2 === 0 ? 'user' : 'assistant', `recent-${i}`),
    );
    const out = await compactHistory([sys, ...older, ...recent], { recent: 4 });

    expect(out[0]).toEqual(sys);
    expect(out[1].role).toBe('system');
    expect(out[1].content).toMatch(/ملخص/);
    expect(out.slice(-4)).toEqual(recent);
  });

  it('falls back to heuristic when summarizer throws', async () => {
    const long: CompactMessage[] = Array.from({ length: 12 }, (_, i) => turn('user', `m${i}`));
    const out = await compactHistory(long, {
      recent: 2,
      summarize: async () => {
        throw new Error('llm down');
      },
    });
    expect(out.find((m) => m.role === 'system' && /ملخص/.test(m.content))).toBeTruthy();
    expect(out.slice(-2).map((m) => m.content)).toEqual(['m10', 'm11']);
  });

  it('uses LLM summarizer when supplied', async () => {
    const long: CompactMessage[] = Array.from({ length: 6 }, (_, i) => turn('user', `m${i}`));
    const out = await compactHistory(long, {
      recent: 2,
      summarize: async (older) => `LLM: compressed ${older.length}`,
    });
    const summary = out.find((m) => m.role === 'system');
    expect(summary?.content).toMatch(/LLM: compressed 4/);
  });
});
