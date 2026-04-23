// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const HINT = 'ALLIBEE_API_KEY';
export const legalTools = {
  review_contract: defineNotConfigured('review_contract',
    'مراجعة عقد قانوني واستخراج البنود الخطرة.',
    z.object({ documentText: z.string(), jurisdiction: z.string().optional() }),
    HINT),
  draft_document: defineNotConfigured('draft_document',
    'صياغة مستند قانوني (NDA, عقد عمل، شراكة).',
    z.object({ type: z.string(), parties: z.array(z.string()), terms: z.any() }),
    HINT),
  analyze_precedent: defineNotConfigured('analyze_precedent',
    'تحليل سوابق قضائية.',
    z.object({ query: z.string(), jurisdiction: z.string() }),
    HINT),
  check_regulatory_compliance: defineNotConfigured('check_regulatory_compliance',
    'فحص الامتثال التنظيمي لخدمة/منتج.',
    z.object({ industry: z.string(), country: z.string(), summary: z.string() }),
    HINT),
};
