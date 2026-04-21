// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Knowledge Base Builder
   * Department: خدمة العملاء
   * Role: بناء قاعدة بيانات أسئلة شائعة وتحديثها من تذاكر الدعم.
   */
  export const knowledgeBaseBuilderAgent = new Agent({
    name: 'Knowledge Base Builder',
    instructions: `أنت Knowledge Base Builder، عضو في قسم خدمة العملاء لمنصة كلميرون تو.
  دورك: بناء قاعدة بيانات أسئلة شائعة وتحديثها من تذاكر الدعم.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3-flash-preview' },
    tools: {
  
    },
  });
  