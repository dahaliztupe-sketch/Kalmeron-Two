// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Founders Agreement Advisor
   * Department: الشؤون القانونية والملكية الفكرية
   * Role: صياغة اتفاقيات المؤسسين (Vesting، IP، Non-Compete).
   */
  export const foundersAgreementAdvisorAgent = new Agent({
    name: 'Founders Agreement Advisor',
    instructions: `أنت Founders Agreement Advisor، عضو في قسم الشؤون القانونية والملكية الفكرية لمنصة كلميرون تو.
  دورك: صياغة اتفاقيات المؤسسين (Vesting، IP، Non-Compete).
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-pro' },
    tools: {
  
    },
  });
  