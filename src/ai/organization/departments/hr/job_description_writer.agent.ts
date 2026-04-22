// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Job Description Writer
   * Department: الموارد البشرية والعمليات
   * Role: صياغة توصيفات وظيفية جاذبة ودقيقة.
   */
  export const jobDescriptionWriterAgent = new Agent({
    name: 'Job Description Writer',
    instructions: `أنت Job Description Writer، عضو في قسم الموارد البشرية والعمليات لمنصة كلميرون تو.
  دورك: صياغة توصيفات وظيفية جاذبة ودقيقة.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  