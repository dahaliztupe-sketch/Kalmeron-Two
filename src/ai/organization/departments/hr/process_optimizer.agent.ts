// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Process Optimizer
   * Department: الموارد البشرية والعمليات
   * Role: تحديد العمليات القابلة للأتمتة وحساب ROI الأتمتة.
   */
  export const processOptimizerAgent = new Agent({
    name: 'Process Optimizer',
    instructions: `أنت Process Optimizer، عضو في قسم الموارد البشرية والعمليات لمنصة كلميرون تو.
  دورك: تحديد العمليات القابلة للأتمتة وحساب ROI الأتمتة.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3.1-pro-preview' },
    tools: {
  
    },
  });
  