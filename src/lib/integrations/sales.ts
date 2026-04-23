// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const HINT = 'REPLY_IO_API_KEY (Reply.io / Jason AI)';
export const salesTools = {
  find_leads: defineNotConfigured('find_leads',
    'البحث عن عملاء محتملين بمعايير محددة.',
    z.object({ industry: z.string(), country: z.string().optional(), titles: z.array(z.string()).optional(), limit: z.number().default(50) }),
    HINT),
  send_email_sequence: defineNotConfigured('send_email_sequence',
    'إرسال سلسلة إيميلات متابعة آلياً.',
    z.object({ leadIds: z.array(z.string()), sequenceTemplate: z.string() }),
    HINT),
  make_call: defineNotConfigured('make_call',
    'إجراء مكالمة صوتية آلية مع تحويل النص إلى صوت.',
    z.object({ leadId: z.string(), script: z.string() }),
    HINT),
  sync_with_crm: defineNotConfigured('sync_with_crm',
    'مزامنة العملاء مع CRM خارجي.',
    z.object({ provider: z.enum(['hubspot', 'salesforce', 'pipedrive']), payload: z.any() }),
    HINT),
};
