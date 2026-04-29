export type PlanId = 'free' | 'starter' | 'pro' | 'founder' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export interface StripePriceIds {
  /** Stripe Price ID for the monthly plan (USD). Read from env at runtime. */
  monthlyUsd?: string;
  /** Stripe Price ID for the annual plan (USD). */
  annualUsd?: string;
  /** Stripe Price ID for the monthly plan in EGP, if configured. */
  monthlyEgp?: string;
  /** Stripe Price ID for the annual plan in EGP, if configured. */
  annualEgp?: string;
}

export interface Plan {
  id: PlanId;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  priceMonthlyEgp: number;
  priceMonthlyUsd: number;
  /** Annual price (per month, when paying yearly) — already discounted. */
  priceAnnualMonthlyEgp: number;
  priceAnnualMonthlyUsd: number;
  dailyCredits: number;
  monthlyCredits: number;
  unlimited: boolean;
  highlighted?: boolean;
  featuresAr: string[];
  /** Stripe identifiers, resolved from env vars. Empty for `free`/`enterprise`. */
  stripe?: StripePriceIds;
}

/**
 * Resolves Stripe price IDs for a given plan from environment variables.
 * Naming convention: STRIPE_PRICE_<PLAN>_<CYCLE>_<CURRENCY>
 *   e.g. STRIPE_PRICE_PRO_MONTHLY_USD, STRIPE_PRICE_FOUNDER_ANNUAL_EGP
 */
export function getStripePriceIds(planId: PlanId): StripePriceIds {
  const u = planId.toUpperCase();
  return {
    monthlyUsd: process.env[`STRIPE_PRICE_${u}_MONTHLY_USD`],
    annualUsd:  process.env[`STRIPE_PRICE_${u}_ANNUAL_USD`],
    monthlyEgp: process.env[`STRIPE_PRICE_${u}_MONTHLY_EGP`],
    annualEgp:  process.env[`STRIPE_PRICE_${u}_ANNUAL_EGP`],
  };
}

/** Map a Stripe Price ID back to a (planId, cycle) pair, for webhook handling. */
export function planFromStripePriceId(priceId: string): { planId: PlanId; cycle: BillingCycle } | null {
  const order: PlanId[] = ['starter', 'pro', 'founder', 'free', 'enterprise'];
  for (const planId of order) {
    const ids = getStripePriceIds(planId);
    if (ids.monthlyUsd === priceId || ids.monthlyEgp === priceId) return { planId, cycle: 'monthly' };
    if (ids.annualUsd === priceId || ids.annualEgp === priceId) return { planId, cycle: 'annual' };
  }
  return null;
}

/** Annual savings discount. 33% mirrors the strategic plan recommendation. */
export const ANNUAL_DISCOUNT_PCT = 33;

function applyAnnual(monthly: number): number {
  return Math.round(monthly * (1 - ANNUAL_DISCOUNT_PCT / 100));
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    nameAr: 'المجاني',
    nameEn: 'Free',
    taglineAr: 'ابدأ رحلتك بدون أي تكلفة',
    priceMonthlyEgp: 0,
    priceMonthlyUsd: 0,
    priceAnnualMonthlyEgp: 0,
    priceAnnualMonthlyUsd: 0,
    dailyCredits: 200,
    monthlyCredits: 3000,
    unlimited: false,
    featuresAr: [
      '200 رسالة يومياً مع كلميرون',
      '3,000 رسالة شهرياً',
      'وصول كامل لكل الأقسام السبعة',
      'تحاليل أفكار غير محدودة (داخل الحد الشهري)',
      'حفظ المحادثات وتاريخ كامل',
      'دعم عبر البريد الإلكتروني',
    ],
  },
  starter: {
    id: 'starter',
    nameAr: 'المبتدئ',
    nameEn: 'Starter',
    taglineAr: 'لكل رائد أعمال مصري يبدأ رحلته بميزانية واقعية',
    priceMonthlyEgp: 199,
    priceMonthlyUsd: 7,
    priceAnnualMonthlyEgp: applyAnnual(199),
    priceAnnualMonthlyUsd: applyAnnual(7),
    dailyCredits: 800,
    monthlyCredits: 12000,
    unlimited: false,
    featuresAr: [
      '800 رسالة يومياً (4× المجاني)',
      '12,000 رسالة شهرياً',
      'وصول كامل لكل الوكلاء',
      'تصدير PDF لخطط العمل',
      'دعم بالعربية عبر البريد',
      'الدفع بـ Fawry / فودافون كاش / بطاقة',
    ],
  },
  pro: {
    id: 'pro',
    nameAr: 'المحترف',
    nameEn: 'Pro',
    taglineAr: 'لرواد الأعمال الجادين الذين يبنون شركتهم القادمة',
    priceMonthlyEgp: 399,
    priceMonthlyUsd: 15,
    priceAnnualMonthlyEgp: applyAnnual(399),
    priceAnnualMonthlyUsd: applyAnnual(15),
    dailyCredits: 2000,
    monthlyCredits: 30000,
    unlimited: false,
    highlighted: true,
    featuresAr: [
      '2,000 رسالة يومياً (10× المجاني)',
      '30,000 رسالة شهرياً',
      'أولوية في النماذج الذكية الأسرع',
      'تصدير خطط العمل بصيغة PDF',
      'حفظ متعدد للمحادثات والمشاريع',
      'دعم فوري عبر الشات',
    ],
  },
  founder: {
    id: 'founder',
    nameAr: 'المؤسس',
    nameEn: 'Founder',
    taglineAr: 'لفريق التأسيس الذي يحتاج كل وكلاء كلميرون',
    priceMonthlyEgp: 999,
    priceMonthlyUsd: 39,
    priceAnnualMonthlyEgp: applyAnnual(999),
    priceAnnualMonthlyUsd: applyAnnual(39),
    dailyCredits: 10000,
    monthlyCredits: 200000,
    unlimited: false,
    featuresAr: [
      '10,000 رسالة يومياً',
      '200,000 رسالة شهرياً',
      'كل مساعدي كلميرون الـ 16 بأعلى أولوية',
      'تكاملات متقدمة (Stripe، Slack، Google)',
      'حساب فريق حتى 5 أعضاء',
      'مدير حساب مخصص',
    ],
  },
  enterprise: {
    id: 'enterprise',
    nameAr: 'المؤسسات',
    nameEn: 'Enterprise',
    taglineAr: 'حلول مخصصة للشركات والمؤسسات الكبرى',
    priceMonthlyEgp: 0,
    priceMonthlyUsd: 0,
    priceAnnualMonthlyEgp: 0,
    priceAnnualMonthlyUsd: 0,
    dailyCredits: 0,
    monthlyCredits: 0,
    unlimited: true,
    featuresAr: [
      'استخدام غير محدود',
      'نماذج ذكية مخصصة للمؤسسة',
      'استضافة خاصة (On-premise)',
      'SLA 99.9% مع دعم 24/7',
      'فريق غير محدود + SSO',
      'مدير نجاح مخصص',
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'starter', 'pro', 'founder', 'enterprise'];

/**
 * Plans that render in the main 4-column pricing grid (Egyptian-friendly tiering).
 * Enterprise is intentionally excluded — it appears as a separate banner
 * (it is sales-led with custom pricing, not self-serve).
 */
export const MAIN_PLAN_ORDER: PlanId[] = ['free', 'starter', 'pro', 'founder'];

/**
 * Returns true when at least one Stripe Price ID is configured for the
 * paid plans. Used by the pricing page to show a configuration warning
 * when self-serve billing is disabled.
 */
export function isStripeConfigured(): boolean {
  for (const id of ['starter', 'pro', 'founder'] as PlanId[]) {
    const ids = getStripePriceIds(id);
    if (ids.monthlyUsd || ids.annualUsd || ids.monthlyEgp || ids.annualEgp) return true;
  }
  return false;
}

export function getPlan(id: string | null | undefined): Plan {
  if (!id) return PLANS.free;
  return PLANS[id as PlanId] || PLANS.free;
}

export function getPlanPrice(plan: Plan, cycle: BillingCycle, currency: 'egp' | 'usd' = 'egp'): number {
  if (cycle === 'annual') {
    return currency === 'egp' ? plan.priceAnnualMonthlyEgp : plan.priceAnnualMonthlyUsd;
  }
  return currency === 'egp' ? plan.priceMonthlyEgp : plan.priceMonthlyUsd;
}

export function getAnnualSavings(plan: Plan, currency: 'egp' | 'usd' = 'egp'): number {
  if (plan.priceMonthlyEgp === 0) return 0;
  const monthly = currency === 'egp' ? plan.priceMonthlyEgp : plan.priceMonthlyUsd;
  const annualMonthly = currency === 'egp' ? plan.priceAnnualMonthlyEgp : plan.priceAnnualMonthlyUsd;
  return (monthly - annualMonthly) * 12;
}
