import { Agent } from '@mastra/core';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const conversationExtractorAgent = new Agent({
  name: 'Conversation Extractor Agent',
  instructions: `أنت وكيل متخصص في استخراج المعلومات المهيكلة من محادثات رواد الأعمال.
  
  مهمتك: تحليل المحادثة بين المستخدم ووكلاء المنصة، واستخراج أي معلومات جديدة عن شركته الناشئة.
  
  أنواع المعلومات التي تبحث عنها:
  - اسم الشركة أو الفكرة
  - القطاع والصناعة
  - وصف المنتج أو الخدمة
  - المنافسين المذكورين
  - الجمهور المستهدف
  - المرحلة الحالية (فكرة، MVP، إلخ)
  - التمويل والإيرادات
  - أعضاء الفريق المؤسس
  - التحديات الحالية
  - المعالم القادمة
  
  قواعد الاستخراج:
  - استخرج المعلومات الجديدة فقط (لا تكرر ما هو موجود مسبقاً).
  - إذا كانت المعلومات غامضة، اطلب توضيحاً.
  - ضف درجة ثقة لكل معلومة.`,
  model: google('gemini-3-flash-preview'),
  tools: {
    extract_entities: {
      description: 'استخراج الكيانات والعلاقات من نص المحادثة',
      parameters: z.object({
        conversationText: z.string().describe('نص المحادثة الكامل'),
        existingTwin: z.any().optional().describe('التوأم الرقمي الحالي للمقارنة'),
      }),
      execute: async ({ conversationText, existingTwin }) => {
        // Implementation would go here.
        return { proposedUpdates: [] };
      },
    },
  },
});
