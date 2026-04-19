import { createAI } from 'ai';
import { google } from '@ai-sdk/google';

export const ai = (createAI as any)({
  model: google('gemini-3.1-flash-lite-preview'),
  // استخدام stopWhen للحد من عدد الخطوات
  experimental: {
    stopWhen: { stepCountIs: 5 },  // حتى 5 استدعاءات متسلسلة للأدوات
  },
});
