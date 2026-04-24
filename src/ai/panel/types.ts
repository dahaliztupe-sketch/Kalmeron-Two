import { z } from 'zod';

/**
 * النية التي يُصنّفها الـ Router الداخلي للمجلس.
 * تُحدّد أي مجموعة من الخبراء المتخصصين سيتم تفعيلها.
 */
export const PanelDomainSchema = z.enum([
  'strategic',
  'technical',
  'marketing',
  'mixed',
]);
export type PanelDomain = z.infer<typeof PanelDomainSchema>;

/**
 * تصنيف المهمة الذي ينتجه الـ Router الداخلي للمجلس.
 */
export const PanelRouteSchema = z.object({
  domain: PanelDomainSchema,
  rationale: z.string().min(1).max(500),
  experts: z.array(z.string()).min(2).max(5),
});
export type PanelRoute = z.infer<typeof PanelRouteSchema>;

/**
 * مخرج موحّد لكل وكلاء كلميرون (مجلس الخبراء).
 * يُلزم النموذج بإنتاج نفس التنسيق دائماً.
 */
export const CouncilOptionSchema = z.object({
  title: z.string().min(2).max(160),
  pros: z.array(z.string().min(1).max(280)).min(1).max(5),
  cons: z.array(z.string().min(1).max(280)).min(1).max(5),
});

export const CouncilOutputSchema = z.object({
  diagnosis: z.string().min(20).max(2500),
  options: z.array(CouncilOptionSchema).length(3),
  recommendation: z.string().min(20).max(1500),
  confidence: z.number().int().min(0).max(100),
  implementationSteps: z.array(z.string().min(1).max(400)).min(3).max(10),
  qualityNotes: z
    .object({
      clarity: z.number().int().min(0).max(100),
      accuracy: z.number().int().min(0).max(100),
      completeness: z.number().int().min(0).max(100),
      actionability: z.number().int().min(0).max(100),
      relevance: z.number().int().min(0).max(100),
      ethicalReview: z.string().min(1).max(500),
    })
    .optional(),
});
export type CouncilOutput = z.infer<typeof CouncilOutputSchema>;

export interface CouncilMeta {
  domain: PanelDomain;
  experts: string[];
  routeRationale: string;
  durationMs: number;
  routerCostUsd?: number;
  councilCostUsd?: number;
}

export interface CouncilResult {
  output: CouncilOutput;
  markdown: string;
  meta: CouncilMeta;
}
