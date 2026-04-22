// @ts-nocheck
import { createAI } from 'ai';
import { google } from '@ai-sdk/google';

export const ai = (createAI as any)({
  model: google('gemini-2.5-flash-lite'),
  // استخدام stopWhen للحد من عدد الخطوات
  experimental: {
    stopWhen: { stepCountIs: 5 },  // حتى 5 استدعاءات متسلسلة للأدوات
  },
});
