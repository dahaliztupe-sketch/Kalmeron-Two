import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * نتيجة التأمل الذاتي
 */
interface ReflectionResult {
  needsMoreEvidence: boolean;
  missingInfo: string;
  confidence: number;
  canAnswer: boolean;
}

/**
 * يتأمل في مدى كفاية المستندات المسترجعة للإجابة على الاستعلام.
 */
export async function reflectOnRetrieval(query: string, documents: string[]): Promise<ReflectionResult> {
  const prompt = `
  أنت مقيم ذاتي. حدد ما إذا كانت المستندات التالية كافية للإجابة على الاستعلام بدقة.
  أعد تقييمك بتنسيق JSON:
  {
    "needsMoreEvidence": true/false,
    "missingInfo": "ما هي المعلومات الناقصة؟",
    "confidence": 0.0-1.0,
    "canAnswer": true/false
  }
  
  الاستعلام: ${query}
  
  المستندات المتاحة:
  ${documents.map((doc, i) => `${i+1}. ${doc.substring(0, 800)}`).join('\n\n')}
  
  تقييم JSON:`;
  
  const result = await generateText({
    model: google('gemini-3-flash-preview'),
    prompt,
    maxTokens: 300,
    temperature: 0,
  });
  
  try {
    // استخراج JSON من النص
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse reflection result:', e);
  }
  
  // افتراضي: غير كافٍ
  return { needsMoreEvidence: true, missingInfo: 'غير محدد', confidence: 0.3, canAnswer: false };
}

/**
 * يولد إجابة "لا أعرف" شفافة عندما تكون الأدلة غير كافية.
 */
export async function generateHonestDontKnow(query: string): Promise<string> {
  const prompt = `
  المستندات المتاحة غير كافية للإجابة على هذا الاستعلام بدقة.
  قم بصياغة رد مهني وشفاف يوضح أنه لا يمكن الإجابة حاليًا، ويقترح على المستخدم إعادة صياغة السؤال أو تقديم مزيد من السياق.
  
  الاستعلام: ${query}
  
  الرد:`;
  
  const result = await generateText({
    model: google('gemini-3-flash-preview'),
    prompt,
    maxTokens: 200,
    temperature: 0.3,
  });
  
  return result.text.trim();
}

/**
 * دالة Self-RAG الرئيسية: تسترجع، تتأمل، وتعيد المحاولة حتى تصبح الأدلة كافية أو يتم استنفاد المحاولات.
 */
export async function selfRAGRetrieve(
  query: string,
  retrieveFn: (q: string) => Promise<string[]>,
  maxIterations: number = 3
): Promise<{ documents: string[]; canAnswer: boolean; finalQuery: string; reflections: ReflectionResult[] }> {
  let currentQuery = query;
  let documents: string[] = [];
  const reflections: ReflectionResult[] = [];
  
  for (let i = 0; i < maxIterations; i++) {
    documents = await retrieveFn(currentQuery);
    const reflection = await reflectOnRetrieval(query, documents);
    reflections.push(reflection);
    
    if (reflection.canAnswer && reflection.confidence >= 0.7) {
      return { documents, canAnswer: true, finalQuery: currentQuery, reflections };
    }
    
    if (reflection.needsMoreEvidence) {
      // إعادة صياغة الاستعلام بناءً على المعلومات الناقصة
      const refinePrompt = `
      أعد صياغة الاستعلام التالي ليشمل المعلومات الناقصة: "${reflection.missingInfo}".
      الاستعلام الأصلي: ${currentQuery}
      الاستعلام المحسن:`;
      
      const refineResult = await generateText({
        model: google('gemini-3-flash-preview'),
        prompt: refinePrompt,
        maxTokens: 200,
        temperature: 0.4,
      });
      
      currentQuery = refineResult.text.trim();
    }
  }
  
  return { documents, canAnswer: false, finalQuery: currentQuery, reflections };
}
