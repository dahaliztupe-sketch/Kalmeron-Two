// @ts-nocheck
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * يقيم مدى صلة المستندات المسترجعة بالاستعلام الأصلي.
 * @returns درجة ثقة بين 0 و 1
 */
export async function evaluateRetrievalRelevance(query: string, documents: string[]): Promise<number> {
  if (documents.length === 0) return 0;
  
  const prompt = `
  قيم مدى صلة المستندات التالية بالاستعلام. أعد فقط رقمًا بين 0 و 1 (مثال: 0.85).
  
  الاستعلام: ${query}
  
  المستندات:
  ${documents.map((doc, i) => `${i+1}. ${doc.substring(0, 500)}`).join('\n\n')}
  
  درجة الصلة (0-1):`;
  
  const result = await generateText({
    model: google('gemini-2.5-flash-lite'), // نموذج خفيف وسريع للتقييم
    prompt,
    maxTokens: 10,
    temperature: 0,
  });
  
  const score = parseFloat(result.text.trim());
  return isNaN(score) ? 0.5 : Math.min(1, Math.max(0, score));
}

/**
 * يعيد صياغة الاستعلام لتحسين نتائج البحث.
 */
export async function rewriteQuery(originalQuery: string, feedback?: string): Promise<string> {
  const prompt = `
  أعد صياغة الاستعلام التالي لجعله أكثر تحديدًا ووضوحًا للبحث عن معلومات.
  ${feedback ? `ملاحظة: ${feedback}` : ''}
  
  الاستعلام الأصلي: ${originalQuery}
  
  الاستعلام المعاد صياغته:`;
  
  const result = await generateText({
    model: google('gemini-2.5-flash'),
    prompt,
    maxTokens: 200,
    temperature: 0.4,
  });
  
  return result.text.trim();
}

/**
 * ينفذ مسار CRAG الكامل.
 * 1. يسترجع المستندات (باستخدام دالة استرجاع يمررها المستخدم).
 * 2. يقيم الصلة.
 * 3. إذا كانت الصلة منخفضة (< 0.7)، يعيد صياغة الاستعلام ويحاول مرة أخرى.
 */
export async function cragRetrieve(
  query: string,
  retrieveFn: (q: string) => Promise<string[]>,
  maxAttempts: number = 2
): Promise<{ documents: string[]; finalQuery: string; confidence: number }> {
  let currentQuery = query;
  let documents: string[] = [];
  let confidence = 0;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    documents = await retrieveFn(currentQuery);
    confidence = await evaluateRetrievalRelevance(query, documents);
    
    if (confidence >= 0.7) {
      return { documents, finalQuery: currentQuery, confidence };
    }
    
    // إعادة صياغة الاستعلام للمحاولة التالية
    const feedback = `نتائج البحث السابقة لم تكن ذات صلة كافية (ثقة: ${confidence})`;
    currentQuery = await rewriteQuery(query, feedback);
  }
  
  return { documents, finalQuery: currentQuery, confidence };
}
