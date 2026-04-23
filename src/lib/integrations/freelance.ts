// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const HINT = 'UPWORK_API_KEY أو RENTAHUMAN_API_KEY';
export const freelanceTools = {
  post_job: defineNotConfigured('post_job',
    'نشر مهمة على منصة عمل حر.',
    z.object({ title: z.string(), description: z.string(), budgetUsd: z.number(), skills: z.array(z.string()) }),
    HINT),
  evaluate_proposals: defineNotConfigured('evaluate_proposals',
    'تقييم العروض الواردة.',
    z.object({ jobId: z.string(), criteria: z.array(z.string()).optional() }),
    HINT),
  hire_freelancer: defineNotConfigured('hire_freelancer',
    'توظيف مستقل واحد بناءً على عرضه.',
    z.object({ jobId: z.string(), proposalId: z.string() }),
    HINT),
  review_deliverable: defineNotConfigured('review_deliverable',
    'مراجعة تسليم العمل.',
    z.object({ deliverableId: z.string(), notes: z.string().optional() }),
    HINT),
};
