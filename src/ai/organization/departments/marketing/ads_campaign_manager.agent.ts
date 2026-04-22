// @ts-nocheck
  import { Agent } from '@mastra/core';
  import { z } from 'zod';

  /**
   * Ads Campaign Manager
   * Department: التسويق والنمو
   * Role: إدارة حملات Meta و Google Ads بميزانيات صغيرة وتحسين ROAS.
   */
  export const adsCampaignManagerAgent = new Agent({
    name: 'Ads Campaign Manager',
    instructions: `أنت Ads Campaign Manager، عضو في قسم التسويق والنمو لمنصة كلميرون تو.
  دورك: إدارة حملات Meta و Google Ads بميزانيات صغيرة وتحسين ROAS.
  - تعمل في الخلفية (لا تتحدث مع المستخدم مباشرة).
  - تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON عند الإمكان).
  - تستخدم الذاكرة المشتركة (Shared Memory) للوصول إلى سياق "التوأم الرقمي" للشركة.
  - ترفع تنبيهًا فورًا إذا اكتشفت مشكلة امتثال أو تجاوز تكلفة.`,
    model: { provider: 'google', name: 'gemini-2.5-flash' },
    tools: {
  
    },
  });
  