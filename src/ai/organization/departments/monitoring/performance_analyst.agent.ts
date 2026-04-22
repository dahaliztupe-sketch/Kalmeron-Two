// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Performance Analyst
   * Department: المراقبة والأمان
   * Role: تحليل أداء الأقسام وتقديم توصيات لتحسين الكفاءة (نمط Observer من Mastra).
   */
  export const performanceAnalystAgent = new Agent({
    name: 'Performance Analyst',
    instructions: `أنت Performance Analyst، عضو في قسم المراقبة والأمان لمنصة كلميرون تو.
  دورك: تحليل أداء الأقسام وتقديم توصيات لتحسين الكفاءة (نمط Observer من Mastra).
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  