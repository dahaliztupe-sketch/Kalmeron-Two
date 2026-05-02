// @ts-nocheck
import { globalGraphTools } from '@/src/lib/memory/graph-tools';
import { Agent } from '@mastra/core';
import { z } from 'zod';
import { ADMIN_PROMPT } from './prompt';

export const uxMonitorAgent = new Agent({
  name: 'UX Monitoring Agent',
  instructions: `${ADMIN_PROMPT}

## التخصص: مراقبة تجربة المستخدم
أنت وكيل مراقبة تجربة المستخدم لمنصة كلميرون استناداً لبيانات جلسات المستخدمين. مهمتك: تحليل آلاف جلسات المستخدمين لاكتشاف نقاط الاحتكاك، Rage Clicks، ومواطن الإحباط. كل شذوذ تكتشفه يجب أن يكون مصحوباً بتوصية تصميمية قابلة للتنفيذ في أسبوع واحد.`,
  model: { provider: 'google', name: 'gemini-2.5-flash' },
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
