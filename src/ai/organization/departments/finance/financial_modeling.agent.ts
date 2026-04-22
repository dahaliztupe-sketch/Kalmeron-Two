// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Financial Modeling Specialist
   * Department: المالية والاستراتيجية
   * Role: بناء نماذج مالية تنبؤية (3-5 سنوات) ومحاكاة سيناريوهات.
   */
  export const financialModelingAgent = new Agent({
    name: 'Financial Modeling Specialist',
    instructions: `أنت Financial Modeling Specialist، عضو في قسم المالية والاستراتيجية لمنصة كلميرون تو.
  دورك: بناء نماذج مالية تنبؤية (3-5 سنوات) ومحاكاة سيناريوهات.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-pro' },
    tools: {
  
    },
  });
  