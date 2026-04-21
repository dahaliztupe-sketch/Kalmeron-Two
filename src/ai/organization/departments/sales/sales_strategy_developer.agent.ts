// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Sales Strategy Developer
   * Department: المبيعات
   * Role: تصميم استراتيجية مبيعات شاملة (Outbound + Inbound + Channel).
   */
  export const salesStrategyDeveloperAgent = new Agent({
    name: 'Sales Strategy Developer',
    instructions: `أنت Sales Strategy Developer، عضو في قسم المبيعات لمنصة كلميرون تو.
  دورك: تصميم استراتيجية مبيعات شاملة (Outbound + Inbound + Channel).
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3.1-pro-preview' },
    tools: {
  
    },
  });
  