'use server';
import { cache } from 'react';

const EMBEDDINGS_WORKER_URL = process.env.EMBEDDINGS_WORKER_URL || 'http://localhost:8099';
const _usingReplitProxy = !!process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

/**
 * getCachedEmbedding
 *
 * When the Replit AI proxy is active (AI_INTEGRATIONS_GEMINI_BASE_URL set),
 * we delegate to the local embeddings-worker sidecar (port 8099) which uses
 * fastembed / sentence-transformers — no Gemini API needed for embeddings.
 *
 * When a direct API key is available, falls back to @ai-sdk/google
 * textEmbeddingModel (gemini-embedding-001).
 */
export const getCachedEmbedding = cache(async (text: string): Promise<number[]> => {
  if (_usingReplitProxy) {
    const res = await fetch(`${EMBEDDINGS_WORKER_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error(`embeddings-worker error: ${res.status} ${await res.text()}`);
    }
    const data = await res.json() as { embedding: number[] };
    return data.embedding;
  }

  // Direct API key path — use Gemini embedding model
  const { embed } = await import('ai');
  const { google } = await import('@ai-sdk/google');
  const { embedding } = await embed({
    model: google.textEmbeddingModel('gemini-embedding-001'),
    value: text,
  });
  return embedding;
});
