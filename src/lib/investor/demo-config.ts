/**
 * Investor Demo Configuration — Single source of truth for demo readiness.
 *
 * Used by:
 *  - /investor                  — investor metrics dashboard
 *  - /investor/health           — pre-demo health check
 *  - /investor/demo-mode        — demo mode toggle + management
 *  - components/investor/*      — investor-facing badges
 *
 * Rule of thumb: an agent appears in the demo path ONLY if it is
 * fully wired (UI + API + tested manually) and produces investor-grade output.
 */

export type DemoReadiness = "ready" | "beta" | "hidden";

export interface DemoAgentEntry {
  /** AgentRegistry slug */
  slug: string;
  /** Arabic display name */
  displayNameAr: string;
  /** Investor-facing one-liner */
  pitchAr: string;
  /** Direct chat quick-prompt for demo flow */
  demoPromptAr?: string;
  /** Route the demo will navigate to */
  href: string;
  readiness: DemoReadiness;
  /** Order on the demo path (lower = earlier) */
  order: number;
}

/**
 * The Investor Demo Path — the exact 6-step story we tell.
 * Only "ready" agents are shown to investors. "beta" agents appear with a badge.
 */
export const DEMO_PATH: DemoAgentEntry[] = [
  {
    slug: "idea-validator",
    displayNameAr: "محلّل الأفكار",
    pitchAr:
      "يحوّل فكرة في سطرين إلى تقرير SWOT كامل خلال أقل من 30 ثانية، مبني على بيانات السوق المصري.",
    demoPromptAr:
      "حلّل فكرة: تطبيق لتوصيل الوجبات الصحية للمكاتب في القاهرة بميزانية 200 ألف جنيه.",
    href: "/chat?q=" + encodeURIComponent("حلّل فكرة: تطبيق لتوصيل الوجبات الصحية للمكاتب في القاهرة"),
    readiness: "ready",
    order: 1,
  },
  {
    slug: "plan-builder",
    displayNameAr: "بنّاء خطة العمل",
    pitchAr:
      "يبني خطة عمل تفصيلية ودراسة جدوى مع توقعات مالية واقعية للسوق المصري.",
    demoPromptAr:
      "ابني لي خطة عمل لمشروع توصيل الوجبات الصحية للمكاتب.",
    href: "/plan",
    readiness: "ready",
    order: 2,
  },
  {
    slug: "cfo-agent",
    displayNameAr: "المدير المالي",
    pitchAr:
      "نمذجة مالية، تحليل سيناريوهات، وتنبؤ بالتدفق النقدي بدقّة محاسب — مدعوم بحسابات ضرائب مصرية حتمية.",
    demoPromptAr:
      "ابنِ نموذج مالي 3 سنوات مع 3 سيناريوهات للمشروع.",
    href: "/cfo",
    readiness: "ready",
    order: 3,
  },
  {
    slug: "legal-guide",
    displayNameAr: "المرشد القانوني",
    pitchAr:
      "مرشد قانوني متخصص في التشريعات المصرية للشركات الناشئة (تأسيس، عقود، ضرائب).",
    demoPromptAr:
      "ما الوثائق القانونية اللازمة لتأسيس شركة توصيل وجبات في مصر؟",
    href: "/chat?q=" + encodeURIComponent("ما الوثائق القانونية اللازمة لتأسيس شركة توصيل وجبات في مصر؟"),
    readiness: "ready",
    order: 4,
  },
  {
    slug: "opportunity-radar",
    displayNameAr: "رادار الفرص",
    pitchAr:
      "بحث آلي عن فرص تمويل ومسابقات وحاضنات أعمال مناسبة لقطاع المستخدم.",
    href: "/opportunities",
    readiness: "ready",
    order: 5,
  },
  {
    slug: "mistake-shield",
    displayNameAr: "حارس الأخطاء",
    pitchAr:
      "تحذيرات استباقية تمنع رائد الأعمال من تكرار الأخطاء القاتلة في السوق المصري.",
    href: "/mistake-shield",
    readiness: "ready",
    order: 6,
  },
  // Beta agents shown with a "تجريبي" badge
  {
    slug: "real-estate",
    displayNameAr: "خبير العقارات",
    pitchAr:
      "حساب ROI وتقييم صفقات العقارات الاستثمارية في المدن المصرية.",
    href: "/real-estate",
    readiness: "beta",
    order: 7,
  },
  {
    slug: "success-museum",
    displayNameAr: "متحف النجاح",
    pitchAr:
      "تحليل قصص نجاح الشركات المصرية والعالمية واستخلاص الدروس القابلة للتطبيق.",
    href: "/success-museum",
    readiness: "beta",
    order: 8,
  },
];

/**
 * Sidecars we monitor for the pre-demo health check.
 * Keep ports in sync with .replit workflow definitions.
 */
export const DEMO_SIDECARS = [
  {
    name: "PDF Worker",
    role: "استخراج المستندات العربية",
    url: "http://localhost:8000/health",
    critical: true,
  },
  {
    name: "Egypt Calc",
    role: "حسابات الضرائب المصرية الحتمية",
    url: "http://localhost:8008/health",
    critical: true,
  },
  {
    name: "Embeddings Worker",
    role: "التضمينات المحلية متعدّدة اللغات",
    url: "http://localhost:8099/health",
    critical: false,
  },
  {
    name: "LLM Judge",
    role: "تقييم جودة استجابات الذكاء الاصطناعي",
    url: "http://localhost:8080/health",
    critical: false,
  },
] as const;

/**
 * Required environment variables for a credible demo.
 * Critical = demo will visibly break without it.
 */
export const DEMO_ENV_REQUIREMENTS = [
  { key: "GOOGLE_GENERATIVE_AI_API_KEY", label: "مفتاح Gemini", critical: true },
  { key: "NEXT_PUBLIC_FIREBASE_API_KEY", label: "مفتاح Firebase العام", critical: true },
  { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", label: "معرّف مشروع Firebase", critical: true },
  { key: "FIREBASE_ADMIN_PROJECT_ID", label: "Firebase Admin", critical: true },
  { key: "FIREBASE_ADMIN_CLIENT_EMAIL", label: "Firebase Admin email", critical: true },
  { key: "FIREBASE_ADMIN_PRIVATE_KEY", label: "Firebase Admin key", critical: true },
  { key: "STRIPE_SECRET_KEY", label: "Stripe (الدفع الدولي)", critical: false },
  { key: "FAWRY_MERCHANT_CODE", label: "فوري (الدفع المحلي)", critical: false },
  { key: "RESEND_API_KEY", label: "Resend (البريد)", critical: false },
  { key: "SENTRY_DSN", label: "Sentry (تتبّع الأخطاء)", critical: false },
] as const;

/**
 * Investor-facing platform metrics — sourced statically until live wiring.
 * Update this when capabilities change so the dashboard never lies.
 */
export const PLATFORM_FACTS = {
  demoReadyAgents: DEMO_PATH.filter((a) => a.readiness === "ready").length,
  betaAgents: DEMO_PATH.filter((a) => a.readiness === "beta").length,
  totalAgentsRegistered: 16,
  supportedLanguages: ["العربية المصرية", "العربية الفصحى", "English"] as string[],
  targetMarkets: ["مصر", "السعودية", "الإمارات"] as string[],
  sidecars: DEMO_SIDECARS.length,
  llmProviders: ["Google Gemini", "OpenAI", "Anthropic"] as string[],
  defaultDailyBudgetUsd: 5,
  observabilityStack: ["Sentry", "Langfuse", "OpenMeter"] as string[],
  complianceModules: [
    "PII Redactor",
    "Audit Log",
    "AI Governance",
    "Rate Limiting",
    "Bearer Auth",
  ] as string[],
} as const;

export const DEMO_MODE_COOKIE = "kalmeron_demo_mode";

/** Read demo mode flag from a cookie store (server). */
export function isDemoModeFromCookie(cookie?: string | null): boolean {
  if (!cookie) return false;
  return cookie === "1" || cookie === "true";
}
