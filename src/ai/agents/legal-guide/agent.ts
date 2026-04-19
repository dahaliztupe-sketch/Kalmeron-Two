import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { LEGAL_KNOWLEDGE } from './knowledge-base';

export async function legalGuideAction(query: string) {
  const { text } = await generateText({
    model: MODELS.PRO,
    system: `أنت "المرشد القانوني" في منصة كلميرون تو، خبير في التشريعات المصرية المتعلقة بالشركات الناشئة وريادة الأعمال. تقديم إرشادات عامة وتوعوية فقط.
    قاعدة المعرفة: ${JSON.stringify(LEGAL_KNOWLEDGE)}
    وجّه المستخدم دائماً للمصادر الرسمية.`,
    prompt: query
  });
  return text;
}
