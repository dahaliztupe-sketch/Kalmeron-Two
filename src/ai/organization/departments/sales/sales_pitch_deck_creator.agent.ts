// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Sales Pitch Deck Creator
   * Department: المبيعات
   * Role: بناء عروض مبيعات مخصصة لكل عميل محتمل.
   */
  export const salesPitchDeckCreatorAgent = new Agent({
    name: 'Sales Pitch Deck Creator',
    instructions: `أنت Sales Pitch Deck Creator، عضو في قسم المبيعات لمنصة كلميرون تو.
  دورك: بناء عروض مبيعات مخصصة لكل عميل محتمل.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3-flash-preview' },
    tools: {
  
    },
  });
  