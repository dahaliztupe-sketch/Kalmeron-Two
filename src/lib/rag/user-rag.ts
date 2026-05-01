/**
 * Per-user RAG store.
 * Documents are chunked, embedded with `gemini-embedding-001`, and stored
 * in Firestore collection `rag_chunks` tagged with `userId` for per-tenant
 * isolation. Search performs cosine-similarity in-memory over the user's
 * own chunks (sufficient up to ~5k chunks/user; swap for pgvector later).
 *
 * Firestore batch limit is 500 operations per commit. Large documents are
 * split into multiple batch writes automatically.
 */
import { embed, embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { adminDb } from '@/src/lib/firebase-admin';
import type { DocumentSnapshot } from 'firebase-admin/firestore';

const COLLECTION = 'rag_chunks';
const EMBED_MODEL = google.textEmbeddingModel('gemini-embedding-001');
const FIRESTORE_BATCH_LIMIT = 499; // Firestore max is 500; keep one slot of safety

export interface RagChunk {
  id?: string;
  userId: string;
  documentId: string;
  documentName: string;
  source: 'pdf' | 'csv' | 'xlsx' | 'text';
  chunkIndex: number;
  text: string;
  embedding?: number[];
  createdAt?: Date | unknown;
}

export interface RagCitation {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  text: string;
  similarity: number;
}

const CHUNK_SIZE = 800;     // characters per chunk (~200 tokens)
const CHUNK_OVERLAP = 120;  // sliding-window overlap to preserve context

export function chunkText(text: string): string[] {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= CHUNK_SIZE) return clean ? [clean] : [];
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    out.push(clean.slice(i, i + CHUNK_SIZE));
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return out;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function ingestDocument(opts: {
  userId: string;
  documentId: string;
  documentName: string;
  source: RagChunk['source'];
  text: string;
}): Promise<{ chunks: number; documentId: string }> {
  if (!adminDb?.collection) throw new Error('firestore_not_configured');
  if (!opts.userId) throw new Error('userId_required');

  const pieces = chunkText(opts.text);
  if (pieces.length === 0) return { chunks: 0, documentId: opts.documentId };

  // Batch embed (Gemini supports up to 100 inputs / call).
  const batches: string[][] = [];
  for (let i = 0; i < pieces.length; i += 96) batches.push(pieces.slice(i, i + 96));

  const allEmbeddings: number[][] = [];
  for (const batch of batches) {
    const { embeddings } = await embedMany({ model: EMBED_MODEL, values: batch });
    allEmbeddings.push(...embeddings);
  }

  const ref = adminDb.collection(COLLECTION);

  // Split into Firestore-safe batches (max 499 ops each)
  for (let start = 0; start < pieces.length; start += FIRESTORE_BATCH_LIMIT) {
    const writer = adminDb.batch();
    const end = Math.min(start + FIRESTORE_BATCH_LIMIT, pieces.length);
    for (let idx = start; idx < end; idx++) {
      writer.set(ref.doc(), {
        userId: opts.userId,
        documentId: opts.documentId,
        documentName: opts.documentName,
        source: opts.source,
        chunkIndex: idx,
        text: pieces[idx],
        embedding: allEmbeddings[idx],
        createdAt: new Date(),
      });
    }
    await writer.commit();
  }

  return { chunks: pieces.length, documentId: opts.documentId };
}

export async function searchUserKnowledge(opts: {
  userId: string;
  query: string;
  topK?: number;
  minSimilarity?: number;
}): Promise<RagCitation[]> {
  if (!adminDb?.collection) return [];
  if (!opts.userId) return [];
  const topK = opts.topK ?? 4;
  const minSim = opts.minSimilarity ?? 0.55;

  const { embedding: q } = await embed({ model: EMBED_MODEL, value: opts.query });

  // Limit to 500 chunks per search for performance — sufficient for most users.
  // Users with larger knowledge bases should migrate to a vector DB.
  const snap = await adminDb
    .collection(COLLECTION)
    .where('userId', '==', opts.userId)
    .limit(500)
    .get()
    .catch(() => null);
  if (!snap || snap.empty) return [];

  const scored: RagCitation[] = [];
  snap.forEach((d: DocumentSnapshot) => {
    const data = d.data();
    if (!data || !Array.isArray(data['embedding'])) return;
    const sim = cosine(q, data['embedding'] as number[]);
    if (sim < minSim) return;
    scored.push({
      documentId: data['documentId'] as string,
      documentName: data['documentName'] as string,
      chunkIndex: data['chunkIndex'] as number,
      text: data['text'] as string,
      similarity: sim,
    });
  });
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

export async function listUserDocuments(
  userId: string
): Promise<Array<{ documentId: string; documentName: string; chunks: number; source: string }>> {
  if (!adminDb?.collection) return [];
  const snap = await adminDb
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .select('documentId', 'documentName', 'source')
    .limit(2000)
    .get()
    .catch(() => null);
  if (!snap || snap.empty) return [];
  const m = new Map<string, { documentId: string; documentName: string; chunks: number; source: string }>();
  snap.forEach((d: DocumentSnapshot) => {
    const x = d.data();
    if (!x) return;
    const docId = x['documentId'] as string;
    const cur = m.get(docId);
    if (cur) cur.chunks += 1;
    else m.set(docId, {
      documentId: docId,
      documentName: x['documentName'] as string,
      chunks: 1,
      source: x['source'] as string,
    });
  });
  return Array.from(m.values()).sort((a, b) => a.documentName.localeCompare(b.documentName));
}

export async function deleteUserDocument(userId: string, documentId: string): Promise<number> {
  if (!adminDb?.collection) return 0;
  const snap = await adminDb
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('documentId', '==', documentId)
    .limit(500)
    .get()
    .catch(() => null);
  if (!snap || snap.empty) return 0;

  // Split into Firestore-safe batches for deletion too
  let deleted = 0;
  const docs = snap.docs;
  for (let start = 0; start < docs.length; start += FIRESTORE_BATCH_LIMIT) {
    const writer = adminDb.batch();
    const end = Math.min(start + FIRESTORE_BATCH_LIMIT, docs.length);
    for (let i = start; i < end; i++) {
      writer.delete(docs[i].ref);
    }
    await writer.commit();
    deleted += end - start;
  }
  return deleted;
}
