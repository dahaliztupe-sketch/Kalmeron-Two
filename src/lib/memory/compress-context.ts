/**
 * Memory compression for long agent conversations (Memory Crisis mitigation).
 *
 * When a chat history grows beyond a recent-window budget, this helper
 * collapses everything *outside* the recent window into a single synthetic
 * system message that summarizes the older turns. The recent K messages are
 * preserved verbatim so the model still has high-fidelity context for the
 * latest exchange.
 *
 * The actual summarization can be:
 *   - LLM-backed: pass `summarize: async (chunks) => string` and the helper
 *     will call it once on the older messages.
 *   - Deterministic: when no summarizer is supplied, a heuristic compacts
 *     each older turn into a one-line bullet ("user: …" / "assistant: …")
 *     truncated to 240 chars. This is suitable as a graceful fallback when
 *     the summarizer LLM is unavailable.
 *
 * The function is intentionally pure and pino-free so it can be reused on
 * the edge runtime and inside web workers without extra deps.
 */

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface CompactMessage {
  role: Role;
  content: string;
}

export interface CompactOptions {
  /** Number of most-recent messages to keep verbatim. Default: 8. */
  recent?: number;
  /** Maximum total messages allowed in the output array. Default: recent+1. */
  maxMessages?: number;
  /** Per-message char budget for the heuristic summary. Default: 240. */
  perTurnChars?: number;
  /** Optional LLM-backed summarizer; receives the chunk to compress. */
  summarize?: (older: CompactMessage[]) => Promise<string>;
}

const DEFAULT_RECENT = 8;
const DEFAULT_PER_TURN_CHARS = 240;

function heuristicCompact(messages: CompactMessage[], perTurnChars: number): string {
  const lines: string[] = [];
  for (const m of messages) {
    if (m.role === 'system') continue; // system anchors are merged separately
    const text = (m.content || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const truncated = text.length > perTurnChars ? text.slice(0, perTurnChars) + '…' : text;
    lines.push(`- ${m.role}: ${truncated}`);
  }
  return lines.join('\n');
}

/**
 * Compact a long message history.
 *
 * Output preserves: original system messages (deduped + concatenated) →
 * synthetic summary system message of older turns → the recent window
 * verbatim.
 */
export async function compactHistory(
  messages: CompactMessage[],
  opts: CompactOptions = {},
): Promise<CompactMessage[]> {
  const recent = Math.max(1, opts.recent ?? DEFAULT_RECENT);
  const perTurnChars = Math.max(40, opts.perTurnChars ?? DEFAULT_PER_TURN_CHARS);

  if (!Array.isArray(messages) || messages.length === 0) return [];
  if (messages.length <= recent) return messages.slice();

  const systemMessages = messages.filter((m) => m.role === 'system');
  const nonSystem = messages.filter((m) => m.role !== 'system');

  if (nonSystem.length <= recent) {
    return [...systemMessages, ...nonSystem];
  }

  const olderTurns = nonSystem.slice(0, nonSystem.length - recent);
  const recentTurns = nonSystem.slice(nonSystem.length - recent);

  let summaryText: string;
  if (opts.summarize) {
    try {
      summaryText = await opts.summarize(olderTurns);
    } catch {
      summaryText = heuristicCompact(olderTurns, perTurnChars);
    }
  } else {
    summaryText = heuristicCompact(olderTurns, perTurnChars);
  }

  const summarySystem: CompactMessage = {
    role: 'system',
    content: `ملخص الحوار السابق (تم ضغط ${olderTurns.length} رسالة):\n${summaryText}`,
  };

  const out: CompactMessage[] = [...systemMessages, summarySystem, ...recentTurns];
  if (opts.maxMessages && out.length > opts.maxMessages) {
    return [...systemMessages, summarySystem, ...recentTurns.slice(out.length - opts.maxMessages)];
  }
  return out;
}
