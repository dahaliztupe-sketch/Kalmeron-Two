/**
 * Kalmeron Microcopy Library
 * ---------------------------
 * Every short string the user reads (CTAs, badges, tooltips, empty states,
 * errors, success messages) lives here. Pages and components import from this
 * file — no inline strings.
 *
 * Each CTA is annotated with the behavioral principle it leverages.
 */

import { LEXICON } from "./lexicon";

// ────────────── CTAs الأساسية ──────────────
export const CTA = {
  /** Hero رئيسي — Friction Reduction */
  primarySignup: "جرّب كلميرون مجاناً — بدون بطاقة ائتمان",
  /** Hero ثانوي — Curiosity Gap */
  watchDemo: "شاهد كلميرون يعمل (دقيقتان)",
  /** نهاية الصفحة — Goal-Gradient */
  buildFirstDept: "ابنِ قسمك الأوّل خلال 5 دقائق",
  /** التسعير — Endowment + Trial Anchor */
  startTrial: `خُذ ${LEXICON.brand.canonical} نمو 14 يوماً — تجربة كاملة`,
  /** استرجاع المستخدم — Loss Aversion */
  returnLogin: "عملك بانتظارك في كلميرون",
  /** نموذج الاتصال — Specificity */
  bookCall: "احجز مكالمتك",
  /** زر مساعد عام */
  learnMore: "اعرف أكثر",
  /** زر العرض */
  viewPricing: "اطّلع على الأسعار",
  /** زر إلغاء */
  cancel: "إلغاء",
  /** زر الحفظ */
  save: "حفظ",
  /** زر الرجوع */
  back: "رجوع",
} as const;

// ────────────── Badges / Eyebrows ──────────────
export const BADGE = {
  newFeature: "جديد في كلميرون",
  comingSoon: "قريباً",
  beta: "تجريبي",
  popular: "الأكثر اختياراً",
  recommended: "موصى به",
  pivotalFeature: "ميزة محورية",
  free: "مجاناً",
} as const;

// ────────────── Trust Bar ──────────────
export const TRUST = {
  label: "موثوق به من قِبل مؤسّسين في 12 دولة عربية",
  noCard: "بدون بطاقة ائتمان",
  cancelAnytime: "ألغِ متى شئت",
  arabicNative: "عربي أصيل، لا ترجمة",
  privateData: "بياناتك خاصّة بك وحدك",
  gdprReady: "متوافق مع GDPR",
} as const;

// ────────────── Empty States ──────────────
export const EMPTY = {
  noProjects: {
    title: "لم تبدأ مشروعك بعد",
    body: "ابدأ من قسمك الأوّل، وسنرافقك خطوة بخطوة.",
    cta: "ابنِ قسمك الأوّل",
  },
  noConversations: {
    title: "لا توجد محادثات حتى الآن",
    body: "اسأل أيّ مساعد ذكي عن أيّ شيء يخصّ شركتك — جوابه فوري.",
    cta: "ابدأ محادثتك الأولى",
  },
  noNotifications: {
    title: "كل شيء هادئ",
    body: "سننبّهك حين تظهر فرصة أو يستجدّ شيء يستحقّ انتباهك.",
    cta: undefined,
  },
} as const;

// ────────────── Error / Success ──────────────
export const FEEDBACK = {
  saved: "تمّ الحفظ",
  deleted: "تمّ الحذف",
  copied: "تمّ النسخ",
  generic: "حدث خطأ غير متوقّع. حاول مجدّداً.",
  network: "تحقّق من اتصالك بالإنترنت ثم حاول مجدّداً.",
  unauthorized: "هذه الصفحة تتطلّب تسجيل الدخول.",
  notFound: "لم نجد ما تبحث عنه.",
} as const;

// ────────────── الإيقاع الثلاثي للوعد الرئيسي ──────────────
export const PROMISE_TRIPLET = {
  ar: ["أسرع", "أذكى", "أرخص"],
  context: "الوعد الجوهري لكلميرون — Reber et al. 2004 triadic recall",
} as const;

// ────────────── أوصاف موحّدة للأقسام ──────────────
export const DEPARTMENT_DESCRIPTIONS = {
  brain: "ذاكرة شركتك الجامعة. تحتفظ بكل قرار وكل سياق وتربط الأفكار تلقائياً.",
  team: "فريق متكامل من المساعدين الأذكياء. كل واحد متخصّص في مجاله.",
  marketLab: "اختبر فكرتك مع عملاء افتراضيين قبل أن تنفق ريالاً واحداً.",
  cfo: "نماذج مالية احترافية وتوقّعات سيولة في دقائق — جاهزة للمستثمرين.",
  legal: "عقود ونماذج متوافقة مع تشريعات بلدك. تأسيس، ضرائب، شراكات.",
  opportunities: "تنبيهات لحظية بأحدث جولات التمويل والمسابقات والفعاليات.",
  mistakeShield: "يحذّرك من الأخطاء القاتلة قبل وقوعها — من تجارب مئات المؤسّسين.",
} as const;
