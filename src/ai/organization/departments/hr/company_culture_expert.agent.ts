// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Company Culture Expert
   * Department: الموارد البشرية والعمليات
   * Role: بناء ثقافة شركة قوية مرتكزة على القيم.
   */
  export const companyCultureExpertAgent = new Agent({
    name: 'Company Culture Expert',
    instructions: `أنت Company Culture Expert، عضو في قسم الموارد البشرية والعمليات لمنصة كلميرون تو.
  دورك: بناء ثقافة شركة قوية مرتكزة على القيم.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  