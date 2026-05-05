/**
 * ai-sdk.ts — Typed model export for Vercel AI SDK.
 *
 * Note: The legacy `createAI` helper was removed from the `ai` package.
 * We export a configured LanguageModel instance instead, which is the
 * correct type for use with `generateText`, `streamText`, etc.
 */
import { google } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';

// gemini-2.5-flash-lite not supported via Replit AI proxy — use gemini-2.5-flash
export const ai: LanguageModel = google('gemini-2.5-flash');
