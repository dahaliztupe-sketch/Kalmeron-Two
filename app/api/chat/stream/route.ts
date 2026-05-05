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
 *
 * Provider selection uses the multi-provider fallback chain (Gemini →
 * OpenRouter → Groq → Anthropic → OpenAI) so the best available model
 * is always used. A log line is emitted when a non-primary provider is used.
 */
import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { requireAuth } from '@/src/lib/security/require-admin';
import { pickProvider } from '@/src/lib/llm/providers';
import { getModelInstance } from '@/src/lib/llm/adapters';
import { logger } from '@/src/lib/logger';

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

  // Resolve model via multi-provider fallback chain (Gemini first, then others).
  const chosen = pickProvider('medium');
  if (chosen.provider !== 'gemini') {
    logger.info({ event: 'stream_fallback_provider', provider: chosen.provider, model: chosen.id });
  }

  let model;
  try {
    model = await getModelInstance(chosen.provider, chosen.id);
  } catch {
    // Last resort: fall back to Gemini directly
    const { google } = await import('@ai-sdk/google');
    model = google('gemini-2.5-flash');
  }

  const result = streamText({
    model,
    system:
      body.system ??
      'أنت مساعد كلميرون الذكي. أجب بالعربية الفصحى الواضحة بشكل موجز ومفيد.',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
