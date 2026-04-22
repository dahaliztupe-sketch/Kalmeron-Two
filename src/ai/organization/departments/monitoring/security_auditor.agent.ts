// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Security Auditor
   * Department: المراقبة والأمان
   * Role: كشف محاولات الوصول غير المصرح وتسرب البيانات بين الوكلاء (الرسائل المخفية).
   */
  export const securityAuditorAgent = new Agent({
    name: 'Security Auditor',
    instructions: `أنت Security Auditor، عضو في قسم المراقبة والأمان لمنصة كلميرون تو.
  دورك: كشف محاولات الوصول غير المصرح وتسرب البيانات بين الوكلاء (الرسائل المخفية).
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-pro' },
    tools: {
  
    },
  });
  