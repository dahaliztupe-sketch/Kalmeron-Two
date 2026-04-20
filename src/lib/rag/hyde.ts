// @ts-nocheck
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * يولد إجابة افتراضية لاستعلام المستخدم، لاستخدامها كاستعلام بحث بدلاً من السؤال الأصلي.
 * هذا يحسن دقة استرجاع المستندات ذات الصلة، خاصة للأسئلة القصيرة أو الغامضة.
 */
export async function generateHypotheticalAnswer(query: string): Promise<string> {
  const prompt = `
  أجب عن السؤال التالي بإجابة مختصرة ومباشرة (حد أقصى 3 جمل).
  لا تقلق بشأن الدقة المطلقة، الهدف هو توليد نص يمكن استخدامه للبحث عن مستندات مشابهة.
  
  السؤال: ${query}
  
  الإجابة الافتراضية:`;
  
  const result = await generateText({
    model: google('gemini-3-flash-preview'), // نموذج سريع ومناسب
    prompt,
    maxTokens: 150,
    temperature: 0.3, // إبداع منخفض للحصول على إجابات متسقة
  });
  
  return result.text.trim();
}

/**
 * يستخدم HyDE لتحويل الاستعلام ثم البحث باستخدام التضمين المحسن.
 * @param query استعلام المستخدم الأصلي
 * @param embedFunction دالة التضمين (من مزود الذكاء الاصطناعي)
 * @returns التضمين (embedding) للإجابة الافتراضية
 */
export async function hydeEmbed(query: string, embedFunction: (text: string) => Promise<number[]>): Promise<number[]> {
  const hypotheticalAnswer = await generateHypotheticalAnswer(query);
  return await embedFunction(hypotheticalAnswer);
}
