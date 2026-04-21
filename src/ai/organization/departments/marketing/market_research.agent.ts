// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Market Research Specialist
   * Department: التسويق والنمو
   * Role: تحليل حجم السوق المصري والمنافسة وتحديد فرص الاختراق.
   */
  export const marketResearchAgent = new Agent({
    name: 'Market Research Specialist',
    instructions: `أنت Market Research Specialist، عضو في قسم التسويق والنمو لمنصة كلميرون تو.
  دورك: تحليل حجم السوق المصري والمنافسة وتحديد فرص الاختراق.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3.1-pro-preview' },
    tools: {
  
    },
  });
  