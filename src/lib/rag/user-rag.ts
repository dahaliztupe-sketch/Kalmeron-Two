/**
 * Per-user RAG store.
 * Documents are chunked, embedded with `gemini-embedding-001`, and stored
 * in Firestore collection `rag_chunks` tagged with `userId` for per-tenant
 * isolation. Search uses Firestore native vector search (findNearest) —
 * no document fetching loop, no in-memory cosine similarity.
 *
 * Firestore batch limit is 500 operations per commit. Large documents are
 * split into multiple batch writes automatically.
 */
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { embedOne, embedBatch } from '@/src/lib/embed-helper';

const COLLECTION = 'rag_chunks';
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
    const embeddings = await embedBatch(batch);
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
        embedding: FieldValue.vector(allEmbeddings[idx]),
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

  const q = await embedOne(opts.query);

  // Use Firestore native vector search — no full-collection scan.
  // distanceMeasure COSINE: distance = 1 - cosine_similarity.
  // We fetch topK * 3 candidates to allow post-filtering by minSimilarity.
  const vectorQuery = adminDb
    .collection(COLLECTION)
    .where('userId', '==', opts.userId)
    .findNearest({
      vectorField: 'embedding',
      queryVector: FieldValue.vector(q),
      limit: topK * 3,
      distanceMeasure: 'COSINE',
      distanceResultField: 'vector_distance',
    });

  const snap = await vectorQuery.get().catch(() => null);
  if (!snap || snap.empty) return [];

  const results: RagCitation[] = [];
  snap.forEach((d: DocumentSnapshot) => {
    const data = d.data();
    if (!data) return;
    // COSINE distance = 1 - similarity; clamp to [0, 1]
    const distance = typeof data['vector_distance'] === 'number' ? data['vector_distance'] : 1;
    const similarity = Math.max(0, Math.min(1, 1 - distance));
    if (similarity < minSim) return;
    results.push({
      documentId: data['documentId'] as string,
      documentName: data['documentName'] as string,
      chunkIndex: data['chunkIndex'] as number,
      text: data['text'] as string,
      similarity,
    });
  });

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
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
