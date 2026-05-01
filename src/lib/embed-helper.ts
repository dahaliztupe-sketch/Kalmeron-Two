/**
 * embed-helper — مساعد التضمين الموحّد
 *
 * عندما يكون Replit AI Proxy نشطاً (AI_INTEGRATIONS_GEMINI_BASE_URL)
 * نوجّه استدعاءات التضمين إلى embeddings-worker (port 8099).
 * وإلا نستخدم gemini-embedding-001 مباشرةً عبر @ai-sdk/google.
 */

const WORKER = process.env.EMBEDDINGS_WORKER_URL ?? 'http://localhost:8099';
const USE_WORKER = !!process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

/** تضمين نص واحد — يُرجع مصفوفة أرقام (الـ embedding vector). */
export async function embedOne(text: string): Promise<number[]> {
  if (USE_WORKER) {
    const res = await fetch(`${WORKER}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`embeddings-worker /embed error: ${res.status}`);
    const data = await res.json() as { embedding: number[] };
    return data.embedding;
  }

  const { embed } = await import('ai');
  const { google } = await import('@ai-sdk/google');
  const { embedding } = await embed({
    model: google.textEmbeddingModel('gemini-embedding-001'),
    value: text,
  });
  return embedding;
}

/** تضمين دفعة من النصوص — يُرجع مصفوفة من المصفوفات. */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (USE_WORKER) {
    const res = await fetch(`${WORKER}/embed/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts }),
    });
    if (!res.ok) throw new Error(`embeddings-worker /embed/batch error: ${res.status}`);
    const data = await res.json() as { embeddings: number[][] };
    return data.embeddings;
  }

  const { embedMany } = await import('ai');
  const { google } = await import('@ai-sdk/google');
  const { embeddings } = await embedMany({
    model: google.textEmbeddingModel('gemini-embedding-001'),
    values: texts,
  });
  return embeddings;
}
