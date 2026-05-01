// @ts-nocheck
import { createGateway } from '@vercel/ai-gateway';

// Note: gemini-2.5-flash-lite is NOT available via Replit AI proxy.
// Using gemini-2.5-flash for all tiers when proxy is active.
export const gateway = createGateway({
  routes: [
    {
      condition: (task) => task.complexity === 'simple',
      model: 'gemini-2.5-flash',
      provider: 'google',
    },
    {
      condition: (task) => task.complexity === 'medium',
      model: 'gemini-2.5-flash',
      provider: 'google',
    },
    {
      condition: (task) => task.complexity === 'complex',
      model: 'gemini-2.5-pro',
      provider: 'google',
    },
  ],
  observability: {
    enabled: true,
    metrics: ['tokens', 'cost', 'latency'],
  },
  alerts: {
    dailyBudget: 50,
    perRequestBudget: 2,
  },
});
