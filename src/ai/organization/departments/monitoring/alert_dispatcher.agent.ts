// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Alert Dispatcher
   * Department: المراقبة والأمان
   * Role: إرسال التنبيهات عبر القنوات المناسبة (لوحة التحكم، بريد، Slack).
   */
  export const alertDispatcherAgent = new Agent({
    name: 'Alert Dispatcher',
    instructions: `أنت Alert Dispatcher، عضو في قسم المراقبة والأمان لمنصة كلميرون تو.
  دورك: إرسال التنبيهات عبر القنوات المناسبة (لوحة التحكم، بريد، Slack).
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash-lite' },
    tools: {
  
    },
  });
  