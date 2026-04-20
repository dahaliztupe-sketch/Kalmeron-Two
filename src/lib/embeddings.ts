// @ts-nocheck
'use server';
import { cache } from 'react';
import { embed } from 'ai';
import { google } from '@ai-sdk/google';

export const getCachedEmbedding = cache(async (text: string) => {
  'use cache';
  const { embedding } = await embed({
    model: google.embedding('gemini-embedding-2-preview'),
    value: text,
  });
  return embedding;
});
