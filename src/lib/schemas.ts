// @ts-nocheck
import { z } from 'zod';

// مخطط فكرة مشروع
export const IdeaSchema = z.object({
  title: z.string().min(1, "عنوان الفكرة مطلوب").max(200),
  description: z.string().min(10, "وصف الفكرة قصير جداً").max(5000),
  industry: z.enum(['fintech', 'ecommerce', 'healthtech', 'edtech', 'logistics', 'other']),
});

export type Idea = z.infer<typeof IdeaSchema>;

// مخطط تحليل SWOT (للتحقق من مخرجات الوكيل)
export const SWOTAnalysisSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
});

// مخطط خطة عمل مختصرة
export const BusinessPlanMetadataSchema = z.object({
  ideaId: z.string(),
  executiveSummary: z.string(),
  targetMarket: z.string(),
});
