// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Lead Qualifier
   * Department: المبيعات
   * Role: تأهيل العملاء المحتملين باستخدام BANT/MEDDIC والمحادثات ثنائية الاتجاه.
   */
  export const leadQualifierAgent = new Agent({
    name: 'Lead Qualifier',
    instructions: `أنت Lead Qualifier، عضو في قسم المبيعات لمنصة كلميرون تو.
  دورك: تأهيل العملاء المحتملين باستخدام BANT/MEDDIC والمحادثات ثنائية الاتجاه.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3-flash-preview' },
    tools: {
  
    },
  });
  