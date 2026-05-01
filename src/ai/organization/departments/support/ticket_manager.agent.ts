// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Ticket Manager
   * Department: خدمة العملاء
   * Role: تصنيف وتوجيه التذاكر الواردة حسب الأولوية والاختصاص.
   */
  export const ticketManagerAgent = new Agent({
    name: 'Ticket Manager',
    instructions: `أنت Ticket Manager، عضو في قسم خدمة العملاء لمنصة كلميرون تو.
  دورك: تصنيف وتوجيه التذاكر الواردة حسب الأولوية والاختصاص.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  