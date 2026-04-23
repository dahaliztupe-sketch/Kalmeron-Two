// @ts-nocheck
import { globalGraphTools } from '@/src/lib/memory/graph-tools';
import { Agent } from '@mastra/core';
import { z } from 'zod';

export const dashboardMonitorAgent = new Agent({
  name: 'Dashboard Monitoring Agent',
  instructions: `أنت وكيل مراقبة لوحة التحكم لمنصة كلميرون تو.
  مهمتك: مراقبة المقاييس الرئيسية بشكل مستمر واكتشاف التغيرات الهامة (استناداً إلى Amplitude Analytics).
  عند اكتشاف تغير بنسبة >10% في عدد المستخدمين النشطين، الاحتفاظ، أو تكاليف الذكاء الاصطناعي، حقق في السبب.`,
  model: { provider: 'google', name: 'gemini-2.5-flash-lite' }, // Flash Lite for continuous fast monitoring
  tools: {
      ...globalGraphTools,
    analyze_metric_change: {
      description: 'تحليل تغير في مقياس محدد',
      parameters: z.object({
        metricName: z.string(),
        timeRange: z.enum(['24h', '7d', '30d']),
      }),
      execute: async () => {
        return { anomalyDetected: true, reason: "زيادة استهلاك الذكاء الاصطناعي بنسبة 15% بسبب إطلاق سرب المبيعات" };
      },
    },
  },
});
