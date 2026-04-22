// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Finance Legal Compliance
   * Department: المالية والاستراتيجية
   * Role: التحقق من الامتثال للقوانين الضريبية والمحاسبية المصرية.
   */
  export const financeLegalComplianceAgent = new Agent({
    name: 'Finance Legal Compliance',
    instructions: `أنت Finance Legal Compliance، عضو في قسم المالية والاستراتيجية لمنصة كلميرون تو.
  دورك: التحقق من الامتثال للقوانين الضريبية والمحاسبية المصرية.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  