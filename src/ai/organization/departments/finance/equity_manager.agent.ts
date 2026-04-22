// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Equity Manager
   * Department: المالية والاستراتيجية
   * Role: إدارة Cap Table وحساب Vesting Schedules وأثر الجولات.
   */
  export const equityManagerAgent = new Agent({
    name: 'Equity Manager',
    instructions: `أنت Equity Manager، عضو في قسم المالية والاستراتيجية لمنصة كلميرون تو.
  دورك: إدارة Cap Table وحساب Vesting Schedules وأثر الجولات.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  