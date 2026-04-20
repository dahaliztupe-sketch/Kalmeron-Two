// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';

export async function analyzeInterviewResults(ideaDescription: string, results: any[]) {
  const { text } = await generateText({
    model: MODELS.PRO,
    system: `أنت محلل أبحاث سوق. مهمتك هي تحليل ردود الشخصيات الافتراضية على فكرة منتج ما، واستخلاص رؤى قابلة للتنفيذ. ركز على: الاهتمامات المشتركة، الاعتراضات الرئيسية، الشرائح الأكثر تقبلاً، وتوصيات لتحسين الفكرة.`,
    prompt: `فكرة المنتج: "${ideaDescription}"
    ردود الشخصيات الافتراضية: ${JSON.stringify(results)}
    
    قم بتقديم تحليل مفصل يتضمن:
    1. ملخص الانطباعات العامة.
    2. قائمة الاعتراضات المتكررة.
    3. ما الذي أعجب الشخصيات أكثر.
    4. 3-5 توصيات ملموسة لتحسين الفكرة.`
  });
  
  return text;
}
