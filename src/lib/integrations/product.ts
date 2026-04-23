// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const HINT = 'LOVABLE_API_KEY';
export const productTools = {
  generate_mvp: defineNotConfigured('generate_mvp',
    'توليد MVP كامل بالذكاء الاصطناعي بناءً على المواصفات.',
    z.object({ name: z.string(), spec: z.string(), stack: z.enum(['nextjs', 'react-native', 'fullstack']).default('nextjs') }),
    HINT),
  deploy_app: defineNotConfigured('deploy_app',
    'نشر التطبيق على بيئة الإنتاج.',
    z.object({ projectId: z.string(), environment: z.enum(['staging', 'production']).default('staging') }),
    HINT),
  iterate_on_feedback: defineNotConfigured('iterate_on_feedback',
    'دمج ملاحظات المستخدمين وتحديث MVP.',
    z.object({ projectId: z.string(), feedback: z.array(z.string()) }),
    HINT),
};
