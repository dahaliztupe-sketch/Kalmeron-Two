'use server';
import { cache } from 'react';

/**
 * getCachedEmbedding
 *
 * Single canonical embedding path: Gemini embedding model via @ai-sdk/google.
 * The Python embeddings-worker sidecar may still run for other purposes,
 * but the TypeScript layer always uses Gemini directly.
 */
export const getCachedEmbedding = cache(async (text: string): Promise<number[]> => {
  const { embed } = await import('ai');
  const { google } = await import('@ai-sdk/google');
  const { embedding } = await embed({
    model: google.textEmbeddingModel('gemini-embedding-001'),
    value: text,
  });
  return embedding;
});
