// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Acquisition Strategist
   * Department: التسويق والنمو
   * Role: تصميم خطة اكتساب العملاء وحساب CAC و LTV.
   */
  export const acquisitionStrategistAgent = new Agent({
    name: 'Acquisition Strategist',
    instructions: `أنت Acquisition Strategist، عضو في قسم التسويق والنمو لمنصة كلميرون تو.
  دورك: تصميم خطة اكتساب العملاء وحساب CAC و LTV.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3.1-pro-preview' },
    tools: {
  
    },
  });
  