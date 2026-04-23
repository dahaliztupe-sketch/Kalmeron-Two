export type PlanId = 'free' | 'pro' | 'founder' | 'enterprise';

export interface Plan {
  id: PlanId;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  priceMonthlyEgp: number;
  priceMonthlyUsd: number;
  dailyCredits: number;
  monthlyCredits: number;
  unlimited: boolean;
  highlighted?: boolean;
  featuresAr: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    nameAr: 'المجاني',
    nameEn: 'Free',
    taglineAr: 'ابدأ رحلتك بدون أي تكلفة',
    priceMonthlyEgp: 0,
    priceMonthlyUsd: 0,
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
  pro: {
    id: 'pro',
    nameAr: 'المحترف',
    nameEn: 'Pro',
    taglineAr: 'لرواد الأعمال الجادين الذين يبنون شركتهم القادمة',
    priceMonthlyEgp: 499,
    priceMonthlyUsd: 19,
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
    priceMonthlyEgp: 1999,
    priceMonthlyUsd: 79,
    dailyCredits: 10000,
    monthlyCredits: 200000,
    unlimited: false,
    featuresAr: [
      '10,000 رسالة يومياً',
      '200,000 رسالة شهرياً',
      'كل وكلاء كلميرون الـ 50+ بأعلى أولوية',
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

export const PLAN_ORDER: PlanId[] = ['free', 'pro', 'founder', 'enterprise'];

export function getPlan(id: string | null | undefined): Plan {
  if (!id) return PLANS.free;
  return PLANS[id as PlanId] || PLANS.free;
}
