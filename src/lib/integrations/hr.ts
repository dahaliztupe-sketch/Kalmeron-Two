// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const HINT = 'DEEL_API_KEY';
export const hrTools = {
  onboard_employee: defineNotConfigured('onboard_employee',
    'بدء عملية تأهيل موظف جديد.',
    z.object({ name: z.string(), email: z.string().email(), country: z.string(), role: z.string() }),
    HINT),
  run_payroll: defineNotConfigured('run_payroll',
    'تشغيل دورة رواتب.',
    z.object({ period: z.string(), payrollGroupId: z.string().optional() }),
    HINT),
  manage_benefits: defineNotConfigured('manage_benefits',
    'إدارة المزايا (تأمين، إجازات).',
    z.object({ employeeId: z.string(), action: z.enum(['add', 'update', 'remove']), benefit: z.any() }),
    HINT),
  track_time_off: defineNotConfigured('track_time_off',
    'تسجيل الإجازات وتتبع الرصيد.',
    z.object({ employeeId: z.string(), startDate: z.string(), days: z.number() }),
    HINT),
};
