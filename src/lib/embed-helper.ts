/**
 * embed-helper — مساعد التضمين الموحّد
 *
 * الطريق الوحيد للتضمين هو Gemini embedding model عبر @ai-sdk/google.
 * لا يوجد تفرعة لـ embeddings-worker — الخدمة قد تكون شغّالة لأغراض أخرى
 * لكن طبقة TypeScript لا توجّه إليها طلبات التضمين.
 */

/** تضمين نص واحد — يُرجع مصفوفة أرقام (الـ embedding vector). */
export async function embedOne(text: string): Promise<number[]> {
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
  const { embedMany } = await import('ai');
  const { google } = await import('@ai-sdk/google');
  const { embeddings } = await embedMany({
    model: google.textEmbeddingModel('gemini-embedding-001'),
    values: texts,
  });
  return embeddings;
}
