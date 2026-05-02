// @ts-nocheck
import { Agent } from '@mastra/core';
import { google } from '@ai-sdk/google';
import { DIGITAL_TWIN_PROMPT } from './prompt';

export const documentExtractorAgent = new Agent({
  name: 'Document Extractor Agent',
  instructions: `${DIGITAL_TWIN_PROMPT}

## التخصص: استخراج المعرفة من المستندات
مهمتك: تحليل المستندات المرفوعة من قبل المستخدم، واستخراج المعلومات المهيكلة لبناء أو تحديث التوأم الرقمي لشركته.

أنواع المستندات: خطط العمل (PDF، DOCX) | ملفات Excel (بيانات مالية، توقعات) | عروض تقديمية (Pitch Decks) | أبحاث السوق

قواعد الاستخراج:
- استخدم Code Interpreter Agent لتحليل ملفات Excel
- نظّم المعلومات المستخرجة وفقاً لهيكل الأنطولوجيا
- كل رقم مالي يجب أن يأتي مع وحدة ومصدر وتاريخ
- قيّم مصداقية كل مصدر: خطة عمل رسمية > محادثة > تخمين`,
  model: google('gemini-2.5-pro'),
});
