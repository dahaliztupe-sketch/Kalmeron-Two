/**
 * Streaming chat endpoint — Anthropic/OpenAI-style token streaming.
 *
 * Uses the Vercel AI SDK `streamText` helper so the client `useChat` hook
 * can render tokens as they arrive (parity with claude.ai / chatgpt.com).
 *
 * The non-streaming orchestrator at `app/api/chat/route.ts` still handles
 * the rich multi-agent supervisor flow; this endpoint is the lightweight
 * "talk to a single model" path used for follow-ups, regenerations, and
 * the Quick Ask box.
 */
import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { requireAuth } from '@/src/lib/security/require-admin';
import { getOrchestratorModel } from '@/src/lib/model-router';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: { messages?: UIMessage[]; system?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: 'no_messages' }, { status: 400 });
  }

  const model = getOrchestratorModel('chat');

  const result = streamText({
    model,
    system:
      body.system ??
      'أنت مساعد كلميرون الذكي. أجب بالعربية الفصحى الواضحة بشكل موجز ومفيد.',
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
