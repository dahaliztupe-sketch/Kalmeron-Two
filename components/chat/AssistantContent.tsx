"use client";

/**
 * <AssistantContent> — chat-surface gateway
 * -----------------------------------------
 * Looks at an assistant message and decides how to render it:
 *
 *   1. If the trimmed content parses as JSON with a top-level
 *      `blocks: AgentBlockData[]`, render via <AgentBlockStream>.
 *   2. If the content holds a fenced ```json ... ``` block whose
 *      payload has `blocks`, render that block via <AgentBlockStream>
 *      and keep any surrounding prose as Markdown (block first, then prose).
 *   3. Otherwise fall back to the existing ReactMarkdown surface.
 *
 * Invalid blocks render a silent "unknown block" placeholder rather than
 * crashing — see <AgentBlock> shape guards.
 *
 * This is the wiring step that turns Wave-3/Wave-6 <AgentBlock> work
 * into actual agentic UI in the chat: any agent that emits valid
 * structured JSON gets richer visuals at zero plumbing cost.
 */

import ReactMarkdown from "react-markdown";
import { AgentBlockStream } from "@/components/agent/AgentBlock";

interface ParsedAgentPayload {
  blocks: unknown[];
}

function tryParseJsonBlocks(raw: string): ParsedAgentPayload | null {
  const t = raw.trim();
  if (!t.startsWith("{") || !t.endsWith("}")) return null;
  try {
    const obj = JSON.parse(t);
    if (obj && Array.isArray(obj.blocks)) return obj as ParsedAgentPayload;
    return null;
  } catch {
    return null;
  }
}

function tryParseFencedJsonBlocks(raw: string): { prose: string; payload: ParsedAgentPayload } | null {
  const m = raw.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[1]);
    if (!obj || !Array.isArray(obj.blocks)) return null;
    const prose = (raw.slice(0, m.index ?? 0) + raw.slice((m.index ?? 0) + m[0].length)).trim();
    return { prose, payload: obj as ParsedAgentPayload };
  } catch {
    return null;
  }
}

export function AssistantContent({
  content,
  locale = "ar",
}: {
  content: string;
  locale?: "ar" | "en";
}) {
  // Pure JSON payload → render only as blocks.
  const pure = tryParseJsonBlocks(content);
  if (pure) {
    return <AgentBlockStream blocks={pure.blocks} locale={locale} />;
  }

  // Fenced JSON inside Markdown prose → render blocks above prose.
  const fenced = tryParseFencedJsonBlocks(content);
  if (fenced) {
    return (
      <div className="space-y-3">
        <AgentBlockStream blocks={fenced.payload.blocks} locale={locale} />
        {fenced.prose && (
          <div className="prose prose-sm prose-invert max-w-none" dir="auto">
            <ReactMarkdown>{fenced.prose}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  // Plain Markdown fallback (existing behaviour).
  return (
    <div className="prose prose-sm prose-invert max-w-none" dir="auto">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
