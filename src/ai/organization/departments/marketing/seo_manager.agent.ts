// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * SEO Manager
   * Department: التسويق والنمو
   * Role: تحسين المحتوى ليتصدر نتائج البحث في السوق المصري والعربي.
   */
  export const seoManagerAgent = new Agent({
    name: 'SEO Manager',
    instructions: `أنت SEO Manager، عضو في قسم التسويق والنمو لمنصة كلميرون تو.
  دورك: تحسين المحتوى ليتصدر نتائج البحث في السوق المصري والعربي.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  