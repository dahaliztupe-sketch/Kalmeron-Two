/**
 * Kalmeron Unified Lexicon
 * -------------------------
 * One canonical Arabic term per concept. Imported across pages, components,
 * AI prompts, and SEO data. The "aliases" list tracks legacy/forbidden terms
 * so reviewers can catch regressions.
 *
 * RULE: A user-facing surface (anything outside /api-docs and /mcp-server)
 * MUST use the `canonical` field, never an alias.
 */

export interface LexiconEntry {
  /** المصطلح المعتمد بالعربية */
  canonical: string;
  /** المرادف الإنجليزي للوثائق التقنية فقط */
  english?: string;
  /** المصطلحات القديمة/المرفوضة في الواجهات */
  aliases: string[];
  /** سياق الاستخدام */
  context?: string;
}

export const LEXICON = {
  // ─────── البراند ───────
  brand: {
    canonical: "كلميرون",
    english: "Kalmeron",
    aliases: ["كلمرون", "Kalmeroun"],
    context: "اسم المنتج — لا يُترجم في النص العربي",
  },
  tagline: {
    canonical: "مقرّ عمليات شركتك الذكي",
    english: "Your Smart Company Operations HQ",
    aliases: ["نظام التشغيل الافتراضي لرواد الأعمال", "Operating System for Founders"],
    context: "الوصف الرئيسي تحت اللوغو",
  },

  // ─────── المفاهيم الجوهرية ───────
  agentSingular: {
    canonical: "مساعد ذكي",
    english: "AI assistant",
    aliases: ["وكيل", "وكيل ذكي", "agent", "AI agent", "خبير"],
    context: "وحدة فردية ذكية",
  },
  agentPlural: {
    canonical: "مساعدوك الأذكياء",
    english: "Your AI assistants",
    aliases: ["+50 وكيل ذكي", "AI agents", "agents", "وكلاء"],
    context: "الجمع — يُفضَّل «فريق كلميرون» في سياقات أخرى",
  },
  team: {
    canonical: "فريق كلميرون",
    english: "Kalmeron team",
    aliases: ["AI team", "agent army", "جيش الوكلاء"],
    context: "السياق التعريفي العام",
  },
  department: {
    canonical: "قسم",
    english: "Department",
    aliases: ["space", "module", "وحدة"],
    context: "وحدة وظيفية تجمع مساعدين متخصصين",
  },
  workspace: {
    canonical: "مساحة العمل",
    english: "Workspace",
    aliases: ["space", "Project space"],
    context: "مساحة عمل المشروع داخل الحساب",
  },

  // ─────── الميزات المحورية ───────
  founderMode: {
    canonical: "وضع التركيز",
    english: "Founder Mode",
    aliases: ["Founder Mode", "وضع المؤسس"],
    context: "صفحة /founder-mode — الميزة المحورية الأولى",
  },
  marketPulse: {
    canonical: "نبض السوق",
    english: "Market Pulse",
    aliases: ["Live Market Pulse", "نبض السوق المباشر"],
    context: "صفحة /market-pulse",
  },
  syntheticLab: {
    canonical: "غرفة العملاء الافتراضيين",
    english: "Synthetic Customer Lab",
    aliases: ["مختبر العملاء التركيبي", "Synthetic Lab"],
    context: "محاكاة ردود عملاء حقيقيين قبل الإطلاق",
  },
  investorDeck: {
    canonical: "مُنشئ عرض المستثمرين",
    english: "Investor Deck Generator",
    aliases: ["Investor-Deck Generator", "Pitch deck builder"],
    context: "صفحة /investor-deck",
  },
  founderNetwork: {
    canonical: "مجلس المؤسسين",
    english: "Founder Network",
    aliases: ["Founder Network", "شبكة المؤسسين"],
    context: "صفحة /founder-network — مجتمع المؤسسين",
  },
  workflows: {
    canonical: "مسارات العمل",
    english: "Workflows",
    aliases: ["Workflows", "Pipelines"],
    context: "صفحة /workflows — أتمتة العمليات",
  },
  complianceCopilot: {
    canonical: "مرشد الامتثال",
    english: "Compliance Co-Pilot",
    aliases: ["Compliance Co-Pilot", "AI Compliance"],
    context: "ميزة الامتثال التنظيمي",
  },
  mcpServer: {
    canonical: "بوابة المطوّرين",
    english: "MCP Server",
    aliases: ["MCP Server"],
    context: "في الواجهة العامة فقط — في صفحة /mcp-server يُسمح بـ MCP",
  },
  apiDocs: {
    canonical: "واجهة برمجة كلميرون",
    english: "Kalmeron API",
    aliases: ["API Docs", "REST API"],
    context: "في الواجهة العامة — في /api-docs يُسمح بـ API",
  },

  // ─────── المصطلحات المالية ───────
  cashRunway: {
    canonical: "مدّة سيولتك",
    english: "Cash Runway",
    aliases: ["Cash Runway", "runway"],
  },
  breakEven: {
    canonical: "نقطة التعادل المالي",
    english: "Break-even point",
    aliases: ["break-even", "نقطة الـ break-even"],
  },
  cashFlow: {
    canonical: "التدفّق النقدي",
    english: "Cash Flow",
    aliases: ["cash flow"],
  },
  seedFunding: {
    canonical: "التمويل التأسيسي",
    english: "Seed Funding",
    aliases: ["seed", "seed round"],
  },
  mvp: {
    canonical: "النموذج الأوّلي",
    english: "MVP",
    aliases: ["MVP", "الـ MVP", "minimum viable product"],
  },
  okrs: {
    canonical: "أهدافك الفصلية",
    english: "OKRs",
    aliases: ["OKRs", "Quarterly Goals"],
  },
  kpi: {
    canonical: "مؤشّرات الأداء",
    english: "KPIs",
    aliases: ["KPI", "KPIs"],
  },
  insights: {
    canonical: "استنتاجات",
    english: "Insights",
    aliases: ["insights"],
  },

  // ─────── المسمّيات الوظيفية ───────
  founder: {
    canonical: "مؤسّس",
    english: "Founder",
    aliases: ["Founder"],
  },
  cofounder: {
    canonical: "شريك مؤسّس",
    english: "Co-founder",
    aliases: ["Co-founder", "co-founder"],
  },
  chiefOfStaff: {
    canonical: "ذراعك التنفيذية",
    english: "Chief of Staff",
    aliases: ["Chief of Staff", "Chief-of-Staff"],
  },
  cfoAgent: {
    canonical: "المدير المالي الذكي",
    english: "CFO Agent",
    aliases: ["CFO Agent", "AI CFO"],
  },
  legalAgent: {
    canonical: "المرشد القانوني",
    english: "Legal Agent",
    aliases: ["Legal Shield", "Legal Agent"],
  },
} as const satisfies Record<string, LexiconEntry>;

/** Helper to fetch the canonical Arabic term in one call */
export function term(key: keyof typeof LEXICON): string {
  return LEXICON[key].canonical;
}

/** Quick alias lookup — returns canonical for any known legacy term */
export function canonicalize(input: string): string {
  for (const entry of Object.values(LEXICON)) {
    if (entry.canonical === input) return input;
    if (entry.aliases.includes(input)) return entry.canonical;
  }
  return input;
}

/** Build a regex that matches any forbidden alias (for lint scripts) */
export function forbiddenAliasesRegex(): RegExp {
  const all = Object.values(LEXICON).flatMap((e) => e.aliases);
  const escaped = all.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "g");
}
