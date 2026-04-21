// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Customer Profiling Specialist
   * Department: التسويق والنمو
   * Role: بناء شخصيات العملاء المثالية (Buyer Personas) بناءً على بيانات السوق المصري.
   */
  export const customerProfilingAgent = new Agent({
    name: 'Customer Profiling Specialist',
    instructions: `أنت Customer Profiling Specialist، عضو في قسم التسويق والنمو لمنصة كلميرون تو.
  دورك: بناء شخصيات العملاء المثالية (Buyer Personas) بناءً على بيانات السوق المصري.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3-flash-preview' },
    tools: {
  
    },
  });
  