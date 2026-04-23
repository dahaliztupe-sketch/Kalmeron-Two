import { describe, it, expect, vi } from 'vitest';

vi.mock('@/src/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false }),
        set: async () => {},
      }),
      add: async () => ({ id: 'expert-1' }),
      where: () => ({ where: () => ({ limit: () => ({ get: async () => ({ docs: [] }) }) }) }),
      limit: () => ({ get: async () => ({ docs: [] }) }),
    }),
  },
}));

vi.mock('@/src/lib/gemini', () => ({ MODELS: { FLASH: 'flash-stub' } }));

vi.mock('ai', () => ({
  generateText: vi.fn(async () => ({
    text: `{"name":"خبير تسويق","domain":"marketing","systemPrompt":"كن خبير تسويق...","tools":["browse_web","search_memory","invalid_tool"],"temperature":0.5,"examples":[{"q":"س","a":"ج"}]}`,
  })),
  embed: vi.fn(),
}));

describe('expert-factory', () => {
  it('creates an expert from description and sanitizes tools', async () => {
    const { createExpertFromDescription } = await import('@/src/ai/experts/expert-factory');
    const e = await createExpertFromDescription('خبير تسويق مصري', 'creator-1');
    expect(e.name).toBe('خبير تسويق');
    expect(e.domain).toBe('marketing');
    expect(e.tools).toContain('browse_web');
    expect(e.tools).toContain('search_memory');
    expect(e.tools).not.toContain('invalid_tool');
    expect(e.temperature).toBe(0.5);
    expect(e.examples).toHaveLength(1);
  });

  it('falls back safely when LLM returns non-JSON', async () => {
    const { generateText } = await import('ai');
    (generateText as any).mockResolvedValueOnce({ text: 'not json at all' });
    const { createExpertFromDescription } = await import('@/src/ai/experts/expert-factory');
    const e = await createExpertFromDescription('وصف عام', 'creator-1');
    expect(e.name).toBeDefined();
    expect(e.tools).toEqual([]);
  });

  it('saves expert and returns id', async () => {
    const { saveExpert } = await import('@/src/ai/experts/expert-factory');
    const id = await saveExpert({
      creatorId: 'c',
      name: 'n',
      domain: 'd',
      description: 'desc',
      systemPrompt: 'sp',
      tools: [],
      model: 'gemini-2.5-flash',
      temperature: 0.4,
      examples: [],
    });
    expect(id).toBe('expert-1');
  });
});
