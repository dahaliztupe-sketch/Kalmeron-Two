// @ts-nocheck
import { createAI } from 'ai';
import { google } from '@ai-sdk/google';

// gemini-2.5-flash-lite not supported via Replit AI proxy — use gemini-2.5-flash
export const ai = (createAI as unknown)({
  model: google('gemini-2.5-flash'),
  experimental: {
    stopWhen: { stepCountIs: 5 },
  },
});
