// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const HINT = 'MONEYPIT_API_KEY أو STRIPE/QUICKBOOKS credentials';
export const financeTools = {
  create_invoice: defineNotConfigured('create_invoice',
    'إنشاء فاتورة لعميل.',
    z.object({ customerId: z.string(), items: z.array(z.object({ description: z.string(), amount: z.number() })), dueDate: z.string().optional() }),
    HINT),
  track_expenses: defineNotConfigured('track_expenses',
    'تسجيل/استرجاع المصروفات الشهرية.',
    z.object({ month: z.string(), category: z.string().optional() }),
    HINT),
  reconcile_accounts: defineNotConfigured('reconcile_accounts',
    'مطابقة الحركات البنكية مع السجلات المحاسبية.',
    z.object({ accountId: z.string(), period: z.string() }),
    HINT),
  prepare_tax_filing: defineNotConfigured('prepare_tax_filing',
    'تجهيز الإقرار الضريبي.',
    z.object({ year: z.number(), country: z.string() }),
    HINT),
};
