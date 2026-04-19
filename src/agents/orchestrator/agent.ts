import { generateObject } from 'ai';
import { classifyTaskComplexity, selectModel } from '@/src/lib/model-router';
import { z } from 'zod';

export async function orchestrate(messages: any[], userMemory: string) {
  const lastMessage = messages[messages.length - 1].content;
  const complexity = classifyTaskComplexity(lastMessage);
  const model = selectModel(complexity);
  
  const prompt = `
بصفتك منسقاً ذكياً لمنصة "كلميرون تو"، حلل رسالة المستخدم وقرر التوجيه الأمثل.
رسالة المستخدم: "${lastMessage}"
سياق المستخدم السابق: "${userMemory}"

القواعد:
- PLAN_BUILDER: لطلب خطة عمل أو دراسة جدوى.
- IDEA_VALIDATOR: لتحليل فكرة مشروع جديدة.
- MISTAKE_SHIELD: للتحذير من أخطاء أو نصائح حماية.
- SUCCESS_MUSEUM: لقصص نجاح أو تحليل شركات.
- OPPORTUNITY_RADAR: للبحث عن مسابقات، تمويل، أو هاكاثونات.
- GENERAL_CHAT: لأي دردشة عامة أو سؤال لا يندرج تحت ما سبق.
`;

  const result = await generateObject({
    model: model,
    prompt: prompt,
    schema: z.object({
      intent: z.enum([
        'PLAN_BUILDER',
        'IDEA_VALIDATOR',
        'MISTAKE_SHIELD',
        'SUCCESS_MUSEUM',
        'OPPORTUNITY_RADAR',
        'GENERAL_CHAT'
      ]),
      reasoning: z.string().describe("سبب اختيار هذا التوجيه")
    }),
  });

  return result.object.intent;
}
