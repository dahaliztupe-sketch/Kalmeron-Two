// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Valuation Expert
   * Department: المالية والاستراتيجية
   * Role: تقدير قيمة الشركة باستخدام DCF و Comparables و Berkus.
   */
  export const valuationExpertAgent = new Agent({
    name: 'Valuation Expert',
    instructions: `أنت Valuation Expert، عضو في قسم المالية والاستراتيجية لمنصة كلميرون تو.
  دورك: تقدير قيمة الشركة باستخدام DCF و Comparables و Berkus.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-pro' },
    tools: {
  
    },
  });
  