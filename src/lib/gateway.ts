// @ts-nocheck
import { createGateway } from '@vercel/ai-gateway';

export const gateway = createGateway({
  routes: [
    {
      // المهام البسيطة (تصنيف، تلخيص قصير) ← نموذج رخيص
      condition: (task) => task.complexity === 'simple',
      model: 'gemini-2.5-flash-lite',
      provider: 'google',
    },
    {
      // المهام المتوسطة (محادثة، تحليل متوسط) ← نموذج متوازن
      condition: (task) => task.complexity === 'medium',
      model: 'gemini-2.5-flash',
      provider: 'google',
    },
    {
      // المهام المعقدة (تحليل فكرة، بناء خطة) ← نموذج قوي
      condition: (task) => task.complexity === 'complex',
      model: 'gemini-2.5-pro',
      provider: 'google',
    },
  ],
  // تتبع التكاليف والمراقبة
  observability: {
    enabled: true,
    metrics: ['tokens', 'cost', 'latency'],
  },
  // تنبيهات التكلفة
  alerts: {
    dailyBudget: 50, // $50 حد يومي
    perRequestBudget: 2, // $2 حد للطلب الواحد
  },
});
