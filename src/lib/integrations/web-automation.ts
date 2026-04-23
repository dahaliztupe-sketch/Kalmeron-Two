// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const HINT = 'PLAYWRIGHT_BROWSER_WS أو CLOUDFLARE_BROWSER_RUN_ENDPOINT';
export const webAutomationTools = {
  browse_web: defineNotConfigured('browse_web',
    'فتح صفحة ويب وتنفيذ سيناريو (نقر، تعبئة، استخراج).',
    z.object({
      url: z.string().url(),
      steps: z.array(z.object({
        action: z.enum(['click', 'type', 'extract', 'wait']),
        selector: z.string().optional(),
        value: z.string().optional(),
      })),
    }),
    HINT),
};
