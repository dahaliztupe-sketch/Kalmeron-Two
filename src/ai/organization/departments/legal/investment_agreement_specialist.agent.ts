// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Investment Agreement Specialist
   * Department: الشؤون القانونية والملكية الفكرية
   * Role: شرح بنود اتفاقيات التمويل (SAFE، Convertible Note، Equity).
   */
  export const investmentAgreementSpecialistAgent = new Agent({
    name: 'Investment Agreement Specialist',
    instructions: `أنت Investment Agreement Specialist، عضو في قسم الشؤون القانونية والملكية الفكرية لمنصة كلميرون تو.
  دورك: شرح بنود اتفاقيات التمويل (SAFE، Convertible Note، Equity).
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-pro' },
    tools: {
  
    },
  });
  