// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const HINT = 'DOMO_API_KEY أو LOOKER_CLIENT_ID/SECRET';
export const strategyTools = {
  track_competitors: defineNotConfigured('track_competitors',
    'متابعة منافسين (تحديثات، أسعار، حملات).',
    z.object({ domains: z.array(z.string()) }),
    HINT),
  analyze_market_trends: defineNotConfigured('analyze_market_trends',
    'تحليل اتجاهات السوق ضمن قطاع.',
    z.object({ industry: z.string(), region: z.string().optional(), horizon: z.string().default('quarter') }),
    HINT),
  generate_bi_report: defineNotConfigured('generate_bi_report',
    'توليد تقرير ذكاء أعمال.',
    z.object({ topic: z.string(), period: z.string() }),
    HINT),
  create_dashboard: defineNotConfigured('create_dashboard',
    'إنشاء لوحة تحليلات جديدة.',
    z.object({ name: z.string(), widgets: z.array(z.any()) }),
    HINT),
};
