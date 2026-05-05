/**
 * RAG (Retrieval-Augmented Generation) index.
 * Re-exports core retrieval utilities and provides the unified searchKnowledge API.
 */
export { cragRetrieve, evaluateRetrievalRelevance, rewriteQuery } from './crag';
export { selfRAGRetrieve, reflectOnRetrieval, generateHonestDontKnow } from './self-rag';
export { generateHypotheticalAnswer, hydeEmbed } from './hyde';
export { discoRAG, analyzeDiscourse, buildRhetoricalGraph, discoGenerateAnswer } from './disco-rag';
export { searchUserKnowledge, ingestDocument, listUserDocuments, chunkText } from './user-rag';
export type { RagChunk, RagCitation } from './user-rag';
export type { DiscourseAnalysis, RhetoricalGraph } from './disco-rag';

/**
 * Unified knowledge search entry-point used by agents.
 * Falls back gracefully to an empty string if no relevant content is found.
 */
export async function searchKnowledge(query: string): Promise<string> {
  try {
    const { searchUserKnowledge } = await import('./user-rag');
    const citations = await searchUserKnowledge({ query, userId: 'system', topK: 3 });
    if (!Array.isArray(citations) || citations.length === 0) return '';
    return citations.map((c) => c.text).join('\n\n');
  } catch {
    return '';
  }
}
