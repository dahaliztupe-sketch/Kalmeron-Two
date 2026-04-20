import { Agent } from '@mastra/core';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Note: Sandbox imports commented out until environment stability is confirmed.
// import { Sandbox } from '@e2b/code-interpreter';

export const codeInterpreterAgent = new Agent({
  name: 'Code Interpreter Agent',
  instructions: `أنت وكيل متخصص في تنفيذ الأكواد وتحليل البيانات.
  
  مهمتك: استقبال ملفات (Excel, CSV, JSON) أو استفسارات تحليلية من المستخدم، وكتابة وتشغيل أكواد Python لتحليلها.
  
  قواعد الأمان:
  - لا تقم أبداً بتنفيذ أوامر نظام خطيرة.
  - لا تصل إلى الإنترنت إلا إذا طُلب منك صراحة وبعد موافقة المستخدم.
  - احذف الملفات المؤقتة بعد الانتهاء من التحليل.`,
  model: google('gemini-3-flash-preview'),
  tools: {
    execute_python: {
      description: 'تنفيذ كود Python في بيئة آمنة',
      parameters: z.object({
        code: z.string().describe('كود Python المراد تنفيذه'),
      }),
      execute: async ({ code }) => {
        // Mock implementation to verify agent creation
        return {
          stdout: "تم استقبال الكود بنجاح (بيئة التنفيذ قيد الإعداد)",
          stderr: "",
          images: [],
          executionTime: 0,
        };
      },
    },
  },
});
