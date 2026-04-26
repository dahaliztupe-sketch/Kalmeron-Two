/**
 * Unit tests للـ semantic prompt cache.
 *
 * نستخدم مُضمِّن (embedder) وهمي بسيط: يُنتج متجهاً ثابتاً من 8 قيم بناءً
 * على bag-of-tokens — كافٍ لاختبار منطق التشابه ودورة L1 دون استدعاء أي API.
 */
import { describe, it, expect, beforeEach } from 'vitest';

import {
  cosineSimilarity,
  getSemanticCached,
  setSemanticCached,
  setSemanticEmbedder,
  _clearSemanticL1,
  getSemanticCacheStats,
} from '@/src/lib/llm/semantic-cache';

// ---------- مُضمِّن وهمي حتمي ----------
const VOCAB = ['kalmeron', 'كلميرون', 'what', 'is', 'ما', 'هو', 'how', 'كيف', 'invest', 'استثمار'];

function fakeEmbedder(text: string): Promise<number[]> {
  const lower = text.toLowerCase();
  const vec = VOCAB.map(t => (lower.includes(t) ? 1 : 0));
  // أضف ضوضاء ثابتة بسيطة لتجنّب صفر مطلق
  vec.push(text.length / 1000);
  return Promise.resolve(vec);
}

beforeEach(() => {
  _clearSemanticL1();
  setSemanticEmbedder(fakeEmbedder);
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 0, 1], [1, 0, 1])).toBeCloseTo(1, 5);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 5);
  });

  it('returns 0 for empty or mismatched vectors', () => {
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });

  it('handles negative values', () => {
    expect(cosineSimilarity([1, -1], [-1, 1])).toBeCloseTo(-1, 5);
  });
});

describe('Semantic Cache — basic flow', () => {
  it('returns null when nothing is cached', async () => {
    const hit = await getSemanticCached({
      scope: 'faq', provider: 'google', model: 'flash', tier: 'lite',
      prompt: 'ما هو كلميرون؟',
    });
    expect(hit).toBeNull();
  });

  it('stores then retrieves an exact prompt', async () => {
    await setSemanticCached(
      { scope: 'faq', provider: 'google', model: 'flash', tier: 'lite', prompt: 'ما هو كلميرون؟' },
      { text: 'منصة ذكاء أعمال للمستثمرين', promptTokens: 10, completionTokens: 20 },
    );

    const hit = await getSemanticCached({
      scope: 'faq', provider: 'google', model: 'flash', tier: 'lite',
      prompt: 'ما هو كلميرون؟',
    });
    expect(hit).not.toBeNull();
    expect(hit?.response.text).toBe('منصة ذكاء أعمال للمستثمرين');
    expect(hit?.similarity).toBeGreaterThan(0.99);
  });

  it('retrieves semantically similar prompt above threshold', async () => {
    await setSemanticCached(
      { scope: 'faq', provider: 'google', model: 'flash', tier: 'lite', prompt: 'ما هو كلميرون؟' },
      { text: 'cached', promptTokens: 5, completionTokens: 5 },
    );

    // تحوي نفس tokens (ما، هو، كلميرون) لكن صيغة مختلفة
    const hit = await getSemanticCached(
      { scope: 'faq', provider: 'google', model: 'flash', tier: 'lite', prompt: 'هو كلميرون ما؟' },
      0.85,
    );
    expect(hit).not.toBeNull();
    expect(hit?.response.text).toBe('cached');
  });

  it('isolates by scope (different agent = different cache)', async () => {
    await setSemanticCached(
      { scope: 'faq', provider: 'google', model: 'flash', tier: 'lite', prompt: 'ما هو كلميرون؟' },
      { text: 'in faq scope', promptTokens: 1, completionTokens: 1 },
    );

    const hit = await getSemanticCached({
      scope: 'cfo', provider: 'google', model: 'flash', tier: 'lite',
      prompt: 'ما هو كلميرون؟',
    });
    expect(hit).toBeNull();
  });

  it('isolates by model (different model = different cache)', async () => {
    await setSemanticCached(
      { scope: 'faq', provider: 'google', model: 'flash', tier: 'lite', prompt: 'kalmeron what?' },
      { text: 'flash answer', promptTokens: 1, completionTokens: 1 },
    );

    const hit = await getSemanticCached({
      scope: 'faq', provider: 'google', model: 'pro', tier: 'pro',
      prompt: 'kalmeron what?',
    });
    expect(hit).toBeNull();
  });

  it('returns null when similarity is below threshold', async () => {
    await setSemanticCached(
      { scope: 'faq', provider: 'google', model: 'flash', tier: 'lite', prompt: 'how to invest استثمار' },
      { text: 'investment guide', promptTokens: 1, completionTokens: 1 },
    );

    const hit = await getSemanticCached(
      { scope: 'faq', provider: 'google', model: 'flash', tier: 'lite', prompt: 'كيف نطبخ الأرز' },
      0.9,
    );
    expect(hit).toBeNull();
  });

  it('stats reflect L1 usage', async () => {
    const before = getSemanticCacheStats();
    await setSemanticCached(
      { scope: 'a', provider: 'google', model: 'flash', tier: 'lite', prompt: 'kalmeron' },
      { text: 'x', promptTokens: 1, completionTokens: 1 },
    );
    const after = getSemanticCacheStats();
    expect(after.l1Size).toBeGreaterThan(before.l1Size);
    expect(after.defaultThreshold).toBeGreaterThan(0);
  });

  it('skips cache silently when no embedder is configured', async () => {
    setSemanticEmbedder(null as any);
    const hit = await getSemanticCached({
      scope: 'faq', provider: 'google', model: 'flash', tier: 'lite',
      prompt: 'anything',
    });
    expect(hit).toBeNull();
  });
});
