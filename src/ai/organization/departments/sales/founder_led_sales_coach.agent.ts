// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Founder-Led Sales Coach
   * Department: المبيعات
   * Role: تدريب المؤسس على إجراء أولى عمليات البيع بنفسه (سكربتات، اعتراضات).
   */
  export const founderLedSalesCoachAgent = new Agent({
    name: 'Founder-Led Sales Coach',
    instructions: `أنت Founder-Led Sales Coach، عضو في قسم المبيعات لمنصة كلميرون تو.
  دورك: تدريب المؤسس على إجراء أولى عمليات البيع بنفسه (سكربتات، اعتراضات).
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3-flash-preview' },
    tools: {
  
    },
  });
  