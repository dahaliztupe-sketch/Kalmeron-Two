// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Sales Pipeline Analyst
   * Department: المبيعات
   * Role: تتبع تقدم الصفقات وتحديد الاختناقات في القمع.
   */
  export const salesPipelineAnalystAgent = new Agent({
    name: 'Sales Pipeline Analyst',
    instructions: `أنت Sales Pipeline Analyst، عضو في قسم المبيعات لمنصة كلميرون تو.
  دورك: تتبع تقدم الصفقات وتحديد الاختناقات في القمع.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  