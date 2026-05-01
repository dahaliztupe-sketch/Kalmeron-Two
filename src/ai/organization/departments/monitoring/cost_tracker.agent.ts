// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Cost Tracker
   * Department: المراقبة والأمان
   * Role: تتبع تكاليف LLM لكل وكيل ومستخدم وإطلاق تنبيهات عند التجاوز.
   */
  export const costTrackerAgent = new Agent({
    name: 'Cost Tracker',
    instructions: `أنت Cost Tracker، عضو في قسم المراقبة والأمان لمنصة كلميرون تو.
  دورك: تتبع تكاليف LLM لكل وكيل ومستخدم وإطلاق تنبيهات عند التجاوز.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  