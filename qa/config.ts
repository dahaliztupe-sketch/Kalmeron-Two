import { DEVICES, type DeviceKey } from './devices';

export const BASE_URL = process.env.QA_BASE_URL ?? 'http://localhost:5000';
export const AUTH_TOKEN = process.env.QA_AUTH_TOKEN ?? '';

export const PUBLIC_PAGES_TO_CHECK = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/pricing',
  '/demo',
  '/investors',
  '/affiliate',
  '/affiliate-terms',
  '/terms',
  '/privacy',
  '/compliance',
  '/changelog',
  '/first-100',
  '/opportunities',
  '/marketplace',
  '/success-museum',
];

export const PROTECTED_PAGES = [
  '/dashboard',
  '/dashboard/settings',
  '/profile',
  '/billing',
  '/ideas/analyze',
  '/admin',
  '/admin/metrics',
];

export const PUBLIC_PAGES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/pricing',
  '/demo',
  '/investors',
  '/affiliate',
  '/affiliate-terms',
  '/terms',
  '/privacy',
  '/compliance',
  '/changelog',
  '/first-100',
];

export const PERFORMANCE_THRESHOLDS = {
  lcp: { good: 2500, acceptable: 4000 },
  fcp: { good: 1800, acceptable: 3000 },
  totalLoad: { good: 3000, acceptable: 5000 },
  ttfb: { good: 200, acceptable: 600 },
  apiResponse: { good: 1000, acceptable: 3000 },
} as const;

export const AGENTS = [
  { id: 'general', name: 'المساعد العام' },
  { id: 'cfo', name: 'المدير المالي' },
  { id: 'legal', name: 'المستشار القانوني' },
  { id: 'marketing', name: 'مدير التسويق' },
  { id: 'sales', name: 'مدير المبيعات' },
  { id: 'hr', name: 'مدير الموارد البشرية' },
  { id: 'operations', name: 'مدير العمليات' },
  { id: 'product', name: 'مدير المنتج' },
  { id: 'investor', name: 'مستشار الاستثمار' },
  { id: 'customer-voice', name: 'صوت العملاء' },
  { id: 'idea-validator', name: 'مُحقِّق الأفكار' },
  { id: 'plan-builder', name: 'بناء الخطط' },
  { id: 'mistake-shield', name: 'درع الأخطاء' },
  { id: 'success-museum', name: 'متحف النجاح' },
  { id: 'opportunity-radar', name: 'رادار الفرص' },
  { id: 'real-estate', name: 'مستشار العقارات' },
] as const;

/**
 * يحلّل متغير البيئة QA_DEVICES لتحديد الأجهزة المراد فحصها.
 * - "all" أو غير محدد → كل الأجهزة
 * - قائمة مفصولة بفواصل: "desktop_std,iphone"
 */
export function getEnabledDevices(): Record<string, (typeof DEVICES)[DeviceKey]> {
  const env = process.env.QA_DEVICES?.trim();
  if (!env || env === 'all') {
    return { ...DEVICES };
  }
  const keys = env.split(',').map((k) => k.trim()) as DeviceKey[];
  const out: Record<string, (typeof DEVICES)[DeviceKey]> = {};
  for (const k of keys) {
    if (DEVICES[k]) out[k] = DEVICES[k];
  }
  return Object.keys(out).length > 0 ? out : { ...DEVICES };
}
