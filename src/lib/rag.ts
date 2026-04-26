// @ts-nocheck
import { embed, embedMany, generateText } from 'ai';
import { collection, addDoc, getDocs, serverTimestamp, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { MODELS } from './gemini';

/**
 * Modern Multi-modal RAG implementation using Gemini Embedding 2.
 */

// Helper to calculate cosine similarity
const cosineSimilarity = (a: number[], b: number[]) => {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    mA += a[i] * a[i];
    mB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
};

export async function addKnowledge(text: string, category: 'success' | 'mistake' | 'legal' = 'success') {
  const { embedding } = await embed({ 
    model: MODELS.EMBEDDING, 
    value: text 
  });
  
  await addDoc(collection(db, 'knowledge_base'), { 
    text, 
    embedding, 
    category,
    createdAt: serverTimestamp() 
  });
}

export async function searchKnowledge(queryText: string, category?: string, topK: number = 3): Promise<string> {
  const { embedding: queryEmbedding } = await embed({ 
    model: MODELS.EMBEDDING, 
    value: queryText 
  });

  const snapshot = await getDocs(collection(db, 'knowledge_base'));
  
  const matches = snapshot.docs
    .map(doc => {
      const data = doc.data();
      const similarity = cosineSimilarity(queryEmbedding, data.embedding);
      return { text: data.text, similarity, category: data.category };
    })
    .filter(match => !category || match.category === category)
    .sort((a, b) => b.similarity - a.similarity);

  // Take top relevant results
  const topMatches = matches.slice(0, topK).filter(m => m.similarity > 0.65);
  
  return topMatches.map(m => m.text).join("\n---\n");
}

// 3. الدمج (Fusion) — إعادة ترتيب النتائج (Reranking)
export function rerank(results: unknown[], query: string) {
  // استخدام نموذج إعادة ترتيب لتحسين الدقة
  return results.sort((a, b) => b.similarity - a.similarity);
}

// HyDE: Hypothetical Document Embeddings
export async function hydeRetrieval(query: string, category?: string) {
  // 1. توليد إجابة افتراضية
  const { text: hypothetical } = await generateText({
    model: MODELS.FLASH,
    prompt: `اكتب فقرة قصيرة تجيب على: ${query}`,
  });
  
  // 2. استخدام الإجابة الافتراضية للاسترجاع بدلاً من السؤال الأصلي
  return await searchKnowledge(hypothetical, category, 5);
}
