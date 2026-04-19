// @ts-nocheck
import { createGateway } from '@vercel/ai-gateway';

export const gateway = createGateway({
  routes: [
    {
      // المهام البسيطة (تصنيف، تلخيص قصير) ← نموذج رخيص
      condition: (task) => task.complexity === 'simple',
      model: 'gemini-3.1-flash-lite-preview',
      provider: 'google',
    },
    {
      // المهام المتوسطة (محادثة، تحليل متوسط) ← نموذج متوازن
      condition: (task) => task.complexity === 'medium',
      model: 'gemini-3-flash-preview',
      provider: 'google',
    },
    {
      // المهام المعقدة (تحليل فكرة، بناء خطة) ← نموذج قوي
      condition: (task) => task.complexity === 'complex',
      model: 'gemini-3.1-pro-preview',
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
