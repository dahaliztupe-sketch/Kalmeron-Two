// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Content Creator
   * Department: التسويق والنمو
   * Role: كتابة منشورات المدونة ورسائل البريد الإلكتروني وتغريدات السوشيال ميديا بالعربية المصرية.
   */
  export const contentCreatorAgent = new Agent({
    name: 'Content Creator',
    instructions: `أنت Content Creator، عضو في قسم التسويق والنمو لمنصة كلميرون تو.
  دورك: كتابة منشورات المدونة ورسائل البريد الإلكتروني وتغريدات السوشيال ميديا بالعربية المصرية.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-3-flash-preview' },
    tools: {
  
    },
  });
  