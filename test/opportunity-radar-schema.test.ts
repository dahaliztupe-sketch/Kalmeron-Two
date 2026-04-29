import { describe, it, expect } from 'vitest';
import { OpportunitySchema } from '@/src/agents/opportunity-radar/agent';
import { z } from 'zod';

describe('OpportunitySchema', () => {
  const valid = {
    id: 'opp-001',
    title: 'Flat6Labs Batch 2026',
    type: 'accelerator' as const,
    description: 'برنامج تسريع للشركات التقنية في مرحلة البداية',
    organizer: 'Flat6Labs Cairo',
    deadline: '2026-06-01',
    location: 'القاهرة',
    isOnline: false,
    link: 'https://flat6labs.com/apply',
    relevanceScore: 85,
    tags: ['تقنية', 'seed', 'مصر'],
  };

  it('validates a correct opportunity object', () => {
    expect(() => OpportunitySchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid relevanceScore (above 100)', () => {
    expect(() =>
      OpportunitySchema.parse({ ...valid, relevanceScore: 105 }),
    ).toThrow();
  });

  it('rejects negative relevanceScore', () => {
    expect(() =>
      OpportunitySchema.parse({ ...valid, relevanceScore: -1 }),
    ).toThrow();
  });

  it('rejects unknown opportunity type', () => {
    expect(() =>
      OpportunitySchema.parse({ ...valid, type: 'unknown_type' }),
    ).toThrow();
  });

  it('rejects invalid URL in link field', () => {
    expect(() =>
      OpportunitySchema.parse({ ...valid, link: 'not-a-url' }),
    ).toThrow();
  });

  it('accepts all valid opportunity types', () => {
    const types = ['hackathon', 'competition', 'accelerator', 'conference', 'workshop', 'grant'] as const;
    for (const type of types) {
      expect(() => OpportunitySchema.parse({ ...valid, type })).not.toThrow();
    }
  });

  it('validates an array of opportunities with z.array', () => {
    const arr = [valid, { ...valid, id: 'opp-002', title: 'ITIDA Grant' }];
    const result = z.array(OpportunitySchema).parse(arr);
    expect(result).toHaveLength(2);
  });

  it('accepts غير محدد as a deadline string', () => {
    const opp = OpportunitySchema.parse({ ...valid, deadline: 'غير محدد' });
    expect(opp.deadline).toBe('غير محدد');
  });
});
