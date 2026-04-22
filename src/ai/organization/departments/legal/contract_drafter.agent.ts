// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Contract Drafter
   * Department: الشؤون القانونية والملكية الفكرية
   * Role: صياغة عقود العملاء والموردين والموظفين بالعربية والإنجليزية.
   */
  export const contractDrafterAgent = new Agent({
    name: 'Contract Drafter',
    instructions: `أنت Contract Drafter، عضو في قسم الشؤون القانونية والملكية الفكرية لمنصة كلميرون تو.
  دورك: صياغة عقود العملاء والموردين والموظفين بالعربية والإنجليزية.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  