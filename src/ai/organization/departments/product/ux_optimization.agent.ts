// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * UX Optimization Specialist
   * Department: العمليات والمنتج
   * Role: تحليل سلوك المستخدمين عبر heatmaps وقرع الاحتكاك في الرحلة.
   */
  export const uxOptimizationAgent = new Agent({
    name: 'UX Optimization Specialist',
    instructions: `أنت UX Optimization Specialist، عضو في قسم العمليات والمنتج لمنصة كلميرون تو.
  دورك: تحليل سلوك المستخدمين عبر heatmaps وقرع الاحتكاك في الرحلة.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  