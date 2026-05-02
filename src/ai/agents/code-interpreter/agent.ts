// @ts-nocheck
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { CODE_INTERPRETER_PROMPT } from './prompt';

export const codeInterpreterAgent = {
  name: 'Code Interpreter Agent',
  description: 'وكيل متخصص في تنفيذ الأكواد وتحليل البيانات (Excel, CSV, JSON)',
  instructions: CODE_INTERPRETER_PROMPT,

  tools: {
    execute_python: {
      description: 'تنفيذ كود Python في بيئة آمنة',
      parameters: z.object({
        code: z.string().describe('كود Python المراد تنفيذه'),
      }),
      execute: async ({ code }: { code: string }) => {
        return {
          stdout: 'تم استقبال الكود بنجاح (بيئة التنفيذ قيد الإعداد)',
          stderr: '',
          images: [],
          executionTime: 0,
        };
      },
    },
  },

  async run(prompt: string) {
    return instrumentAgent('code_interpreter', async () => {
      const result = await generateText({
        model: google('gemini-2.5-flash'),
        system: CODE_INTERPRETER_PROMPT,
        prompt,
      });
      return result.text;
    }, { model: 'gemini-2.5-flash', input: { prompt }, toolsUsed: ['execute_python'] });
  },
};
