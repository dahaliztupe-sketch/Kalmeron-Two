import { Agent } from '@mastra/core';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { DIGITAL_TWIN_PROMPT } from './prompt';

export const conversationExtractorAgent = new Agent({
  name: 'Conversation Extractor Agent',
  instructions: `${DIGITAL_TWIN_PROMPT}

## التخصص: استخراج المعلومات من المحادثات
مهمتك: تحليل المحادثة بين المستخدم ووكلاء المنصة، واستخراج أي معلومات جديدة عن شركته الناشئة لتحديث التوأم الرقمي.

أنواع المعلومات التي تبحث عنها:
- اسم الشركة أو الفكرة والقطاع والصناعة
- وصف المنتج أو الخدمة والمنافسين المذكورين
- الجمهور المستهدف والمرحلة الحالية
- التمويل والإيرادات وأعضاء الفريق المؤسس
- التحديات الحالية والمعالم القادمة

قواعد: استخرج المعلومات الجديدة فقط. أضف درجة ثقة لكل معلومة. إذا كانت المعلومات غامضة اطلب توضيحاً.`,
  model: google('gemini-2.5-flash'),
  tools: {
    extract_entities: {
      description: 'استخراج الكيانات والعلاقات من نص المحادثة',
      parameters: z.object({
        conversationText: z.string().describe('نص المحادثة الكامل'),
        existingTwin: z.any().optional().describe('التوأم الرقمي الحالي للمقارنة'),
      }),
      execute: async ({ conversationText, existingTwin }) => {
        return { proposedUpdates: [] };
      },
    },
  },
});
