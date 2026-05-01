/**
 * Runtime Agent-Skills Registry
 * ------------------------------
 * يربط كلّ وكيل من وكلاء كلميرون بقائمة منتقاة من ملفّات `SKILL.md`
 * المُثبّتة تحت `.agents/skills/`.
 *
 * هذه المهارات تُحقن في system prompt تلقائياً عبر `instrumentAgent`،
 * وتُكمّل (لا تستبدل) المهارات المُتعلَّمة ذاتيّاً (LearnedSkill).
 *
 * المسارات نسبيّة من `.agents/skills/` ويجب أن تنتهي بـ `SKILL.md`.
 *
 * مفاتيح الخريطة هي أسماء الوكلاء كما تُمرَّر إلى `instrumentAgent(name, ...)`
 */

export type AgentName =
  // وكلاء المشاريع الأصليون
  | 'idea_validator'
  | 'plan_builder'
  | 'mistake_shield'
  | 'success_museum'
  | 'opportunity_radar'
  | 'cfo_agent'
  | 'legal_guide'
  | 'real_estate'
  | 'persona_generator'
  | 'interview_simulator'
  | 'insights_analyzer'
  | 'customer_support'
  | 'general_chat'
  // المجلس التنفيذي C-Suite
  | 'ceo_agent'
  | 'coo_agent'
  | 'cmo_agent'
  | 'cto_agent'
  | 'clo_agent'
  | 'chro_agent'
  | 'cso_agent'
  // الوكلاء المتخصصون التابعون
  | 'board_advisor'
  | 'marketing_strategist'
  | 'brand_builder'
  | 'competitor_intel'
  | 'market_researcher'
  | 'operations_manager'
  | 'sales_coach'
  | 'hiring_advisor'
  | 'expansion_planner'
  | 'investment_advisor'
  | 'forecaster'
  | 'code_interpreter'
  | 'compliance'
  | 'okr'
  | 'digital_twin';

/** قائمة منتقاة لكلّ وكيل: أهمّ 3-5 مهارات تُحقن في system prompt. */
export const AGENT_SKILL_REGISTRY: Record<AgentName, string[]> = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // وكلاء المشاريع المتخصصون
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // مُحلّل الأفكار: تقييم استراتيجي + اكتشاف منتج + تحدّي افتراضات
  idea_validator: [
    'kalmeron-seeds/idea-validator/SKILL.md',
    'c-level-advisor/ceo-advisor/SKILL.md',
    'product-skills/product-discovery/SKILL.md',
    'product-skills/product-strategist/SKILL.md',
    'c-level-advisor/executive-mentor/skills/challenge/SKILL.md',
    'c-level-advisor/executive-mentor/skills/stress-test/SKILL.md',
  ],

  // بنّاء خطة العمل: استراتيجيّة + ماليّة + مبيعات/إيرادات + توافق تنفيذيّ
  plan_builder: [
    'kalmeron-seeds/plan-builder/SKILL.md',
    'c-level-advisor/ceo-advisor/SKILL.md',
    'c-level-advisor/cfo-advisor/SKILL.md',
    'product-skills/product-strategist/SKILL.md',
    'business-growth-skills/revenue-operations/SKILL.md',
    'c-level-advisor/strategic-alignment/SKILL.md',
  ],

  // حارس الأخطاء: ما قبل الموت + قرارات صعبة + ضغط افتراضات
  mistake_shield: [
    'kalmeron-seeds/mistake-shield/SKILL.md',
    'c-level-advisor/executive-mentor/skills/challenge/SKILL.md',
    'c-level-advisor/executive-mentor/skills/stress-test/SKILL.md',
    'c-level-advisor/executive-mentor/skills/postmortem/SKILL.md',
    'c-level-advisor/executive-mentor/skills/hard-call/SKILL.md',
    'c-level-advisor/scenario-war-room/SKILL.md',
  ],

  // متحف النجاح: تشريح المنافسين + تحليل ما بعد الحدث
  success_museum: [
    'c-level-advisor/competitive-intel/SKILL.md',
    'product-skills/competitive-teardown/SKILL.md',
    'c-level-advisor/executive-mentor/skills/postmortem/SKILL.md',
  ],

  // رادار الفرص: مبيعات/RFP + توسّع دوليّ + استحواذ
  opportunity_radar: [
    'kalmeron-seeds/opportunity-radar/SKILL.md',
    'business-growth-skills/sales-engineer/SKILL.md',
    'c-level-advisor/intl-expansion/SKILL.md',
    'c-level-advisor/ma-playbook/SKILL.md',
  ],

  // المدير المالي: نمذجة + تحليل ماليّ + استثمار + SaaS metrics
  cfo_agent: [
    'kalmeron-seeds/cfo-egypt/SKILL.md',
    'c-level-advisor/cfo-advisor/SKILL.md',
    'finance-skills/financial-analyst/SKILL.md',
    'finance-skills/business-investment-advisor/SKILL.md',
    'finance-skills/saas-metrics-coach/SKILL.md',
  ],

  // المرشد القانوني: عقود + خصوصيّة + تشريعات مصرية
  legal_guide: [
    'kalmeron-seeds/legal-egypt/SKILL.md',
    'business-growth-skills/contract-and-proposal-writer/SKILL.md',
    'c-level-advisor/ciso-advisor/SKILL.md',
  ],

  // خبير العقارات: استثمار + تحليل ماليّ
  real_estate: [
    'finance-skills/business-investment-advisor/SKILL.md',
    'finance-skills/financial-analyst/SKILL.md',
  ],

  // مولّد الشخصيّات: بحث UX + اكتشاف منتج
  persona_generator: [
    'product-skills/ux-researcher-designer/SKILL.md',
    'product-skills/product-discovery/SKILL.md',
  ],

  // محاكي المقابلات: بحث UX + اكتشاف منتج
  interview_simulator: [
    'product-skills/ux-researcher-designer/SKILL.md',
    'product-skills/product-discovery/SKILL.md',
  ],

  // محلّل الرؤى: تحليلات منتج + تلخيص بحوث
  insights_analyzer: [
    'product-skills/product-analytics/SKILL.md',
    'product-skills/research-summarizer/SKILL.md',
  ],

  // خدمة العملاء: نجاح العملاء (churn, health scoring)
  customer_support: [
    'business-growth-skills/customer-success-manager/SKILL.md',
  ],

  // المحادثة العامّة: خفيفة + مرشد تنفيذي عام
  general_chat: [
    'c-level-advisor/chief-of-staff/SKILL.md',
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // المجلس التنفيذي C-Suite — بذور معرفية مخصصة + مهارات خارجية
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // المدير التنفيذي CEO
  ceo_agent: [
    'kalmeron-seeds/ceo-egypt/SKILL.md',
    'c-level-advisor/ceo-advisor/SKILL.md',
    'c-level-advisor/strategic-alignment/SKILL.md',
    'c-level-advisor/board-meeting/SKILL.md',
    'c-level-advisor/executive-mentor/skills/board-prep/SKILL.md',
    'c-level-advisor/internal-narrative/SKILL.md',
  ],

  // مدير العمليات COO
  coo_agent: [
    'kalmeron-seeds/coo-egypt/SKILL.md',
    'c-level-advisor/coo-advisor/SKILL.md',
    'c-level-advisor/company-os/SKILL.md',
    'c-level-advisor/org-health-diagnostic/SKILL.md',
    'c-level-advisor/change-management/SKILL.md',
  ],

  // مدير التسويق CMO
  cmo_agent: [
    'kalmeron-seeds/cmo-egypt/SKILL.md',
    'c-level-advisor/cmo-advisor/SKILL.md',
    'business-growth-skills/revenue-operations/SKILL.md',
    'product-skills/landing-page-generator/SKILL.md',
    'c-level-advisor/competitive-intel/SKILL.md',
  ],

  // مدير التقنية CTO
  cto_agent: [
    'kalmeron-seeds/cto-egypt/SKILL.md',
    'c-level-advisor/cto-advisor/SKILL.md',
    'c-level-advisor/ciso-advisor/SKILL.md',
    'product-skills/product-analytics/SKILL.md',
  ],

  // المستشار القانوني CLO
  clo_agent: [
    'kalmeron-seeds/clo-egypt/SKILL.md',
    'business-growth-skills/contract-and-proposal-writer/SKILL.md',
    'c-level-advisor/ciso-advisor/SKILL.md',
  ],

  // مدير الموارد البشرية CHRO
  chro_agent: [
    'kalmeron-seeds/chro-egypt/SKILL.md',
    'c-level-advisor/chro-advisor/SKILL.md',
    'c-level-advisor/culture-architect/SKILL.md',
    'c-level-advisor/founder-coach/SKILL.md',
  ],

  // مدير الاستراتيجية CSO
  cso_agent: [
    'kalmeron-seeds/cso-egypt/SKILL.md',
    'c-level-advisor/intl-expansion/SKILL.md',
    'c-level-advisor/ma-playbook/SKILL.md',
    'c-level-advisor/scenario-war-room/SKILL.md',
    'c-level-advisor/competitive-intel/SKILL.md',
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // الوكلاء المتخصصون التابعون للأقسام
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  board_advisor: [
    'c-level-advisor/board-deck-builder/SKILL.md',
    'c-level-advisor/executive-mentor/skills/board-prep/SKILL.md',
    'c-level-advisor/decision-logger/SKILL.md',
    'c-level-advisor/internal-narrative/SKILL.md',
  ],

  marketing_strategist: [
    'c-level-advisor/cmo-advisor/SKILL.md',
    'business-growth-skills/revenue-operations/SKILL.md',
    'product-skills/product-strategist/SKILL.md',
    'c-level-advisor/competitive-intel/SKILL.md',
  ],

  brand_builder: [
    'c-level-advisor/cmo-advisor/SKILL.md',
    'c-level-advisor/internal-narrative/SKILL.md',
    'product-skills/landing-page-generator/SKILL.md',
  ],

  competitor_intel: [
    'c-level-advisor/competitive-intel/SKILL.md',
    'product-skills/competitive-teardown/SKILL.md',
    'business-growth-skills/sales-engineer/SKILL.md',
  ],

  market_researcher: [
    'product-skills/product-discovery/SKILL.md',
    'product-skills/product-analytics/SKILL.md',
    'product-skills/research-summarizer/SKILL.md',
  ],

  operations_manager: [
    'c-level-advisor/coo-advisor/SKILL.md',
    'c-level-advisor/company-os/SKILL.md',
    'c-level-advisor/change-management/SKILL.md',
  ],

  sales_coach: [
    'business-growth-skills/revenue-operations/SKILL.md',
    'business-growth-skills/sales-engineer/SKILL.md',
    'business-growth-skills/customer-success-manager/SKILL.md',
  ],

  hiring_advisor: [
    'c-level-advisor/chro-advisor/SKILL.md',
    'c-level-advisor/culture-architect/SKILL.md',
  ],

  expansion_planner: [
    'kalmeron-seeds/cso-egypt/SKILL.md',
    'c-level-advisor/intl-expansion/SKILL.md',
    'c-level-advisor/ma-playbook/SKILL.md',
    'c-level-advisor/scenario-war-room/SKILL.md',
  ],

  investment_advisor: [
    'finance-skills/business-investment-advisor/SKILL.md',
    'finance-skills/financial-analyst/SKILL.md',
    'c-level-advisor/cfo-advisor/SKILL.md',
  ],

  forecaster: [
    'finance-skills/financial-analyst/SKILL.md',
    'finance-skills/saas-metrics-coach/SKILL.md',
    'c-level-advisor/cfo-advisor/SKILL.md',
  ],

  code_interpreter: [
    'product-skills/product-analytics/SKILL.md',
    'product-skills/research-summarizer/SKILL.md',
  ],

  compliance: [
    'c-level-advisor/ciso-advisor/SKILL.md',
    'business-growth-skills/contract-and-proposal-writer/SKILL.md',
  ],

  okr: [
    'c-level-advisor/coo-advisor/SKILL.md',
    'c-level-advisor/company-os/SKILL.md',
    'c-level-advisor/strategic-alignment/SKILL.md',
  ],

  digital_twin: [
    'c-level-advisor/cto-advisor/SKILL.md',
    'product-skills/product-analytics/SKILL.md',
  ],
};

/**
 * يرجع مسارات SKILL.md المُسجّلة لاسم وكيل معيّن (آمن لكلّ سلسلة).
 * يُرجع مصفوفة فارغة إذا لم يكن الوكيل مُسجّلاً.
 */
export function getRegisteredSkillPaths(agentName: string): string[] {
  return AGENT_SKILL_REGISTRY[agentName as AgentName] || [];
}
