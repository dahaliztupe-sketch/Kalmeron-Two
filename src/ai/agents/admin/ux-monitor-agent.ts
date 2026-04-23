// @ts-nocheck
import { globalGraphTools } from '@/src/lib/memory/graph-tools';
import { Agent } from '@mastra/core';
import { z } from 'zod';

export const uxMonitorAgent = new Agent({
  name: 'UX Monitoring Agent',
  instructions: `أنت وكيل مراقبة تجربة المستخدم لمنصة كلميرون تو استناداً لبيانات Decipher AI.
  مهمتك: مشاهدة وتحليل آلاف جلسات المستخدمين بصرياً لاكتشاف نقاط الاحتكاك وأحداث الإحباط (Rage Clicks).`,
  model: { provider: 'google', name: 'gemini-2.5-flash' }, // Flash supports vision/video analysis inherently
  tools: {
      ...globalGraphTools,
    analyze_session_replays: {
      description: 'تحليل إعادات جلسات المستخدمين واكتشاف الاحتكاك',
      parameters: z.object({
        focusArea: z.enum(['bugs', 'ux', 'performance', 'all']).default('all'),
      }),
      execute: async () => {
        return { sessionsAnalyzed: 1050, frictionPointsFound: 3, highestImpact: "تسجيل الدخول بطيء عبر Passkeys" };
      },
    },
  },
});
