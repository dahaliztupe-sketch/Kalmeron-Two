/**
 * Runtime Agent-Skills Registry
 * ------------------------------
 * يربط كلّ وكيل من وكلاء كلميرون الـ16 بقائمة منتقاة من ملفّات `SKILL.md`
 * المُثبّتة عبر `npx skills add` تحت `.agents/skills/`.
 *
 * هذه المهارات تُحقن في system prompt تلقائياً عبر `instrumentAgent`،
 * وتُكمّل (لا تستبدل) المهارات المُتعلَّمة ذاتيّاً (LearnedSkill).
 *
 * المسارات نسبيّة من `.agents/skills/` ويجب أن تنتهي بـ `SKILL.md`.
 *
 * مفاتيح الخريطة هي أسماء الوكلاء كما تُمرَّر إلى `instrumentAgent(name, ...)`
 * — راجع كلّ ملفّ `agent.ts` للحصول على الاسم الفعليّ.
 */

export type AgentName =
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
  | 'general_chat';

/** قائمة منتقاة لكلّ وكيل: أهمّ 3-5 مهارات تُحقن في system prompt. */
export const AGENT_SKILL_REGISTRY: Record<AgentName, string[]> = {
  // مُحلّل الأفكار: تقييم استراتيجي + اكتشاف منتج + تحدّي افتراضات
  idea_validator: [
    'c-level-advisor/ceo-advisor/SKILL.md',
    'product-skills/product-discovery/SKILL.md',
    'product-skills/product-strategist/SKILL.md',
    'c-level-advisor/executive-mentor/skills/challenge/SKILL.md',
    'c-level-advisor/executive-mentor/skills/stress-test/SKILL.md',
  ],

  // بنّاء خطة العمل: استراتيجيّة + ماليّة + مبيعات/إيرادات + توافق تنفيذيّ
  plan_builder: [
    'c-level-advisor/ceo-advisor/SKILL.md',
    'c-level-advisor/cfo-advisor/SKILL.md',
    'product-skills/product-strategist/SKILL.md',
    'business-growth-skills/revenue-operations/SKILL.md',
    'c-level-advisor/strategic-alignment/SKILL.md',
  ],

  // حارس الأخطاء: ما قبل الموت + قرارات صعبة + ضغط افتراضات
  mistake_shield: [
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
    'business-growth-skills/sales-engineer/SKILL.md',
    'c-level-advisor/intl-expansion/SKILL.md',
    'c-level-advisor/ma-playbook/SKILL.md',
  ],

  // المدير المالي: نمذجة + تحليل ماليّ + استثمار + SaaS metrics
  cfo_agent: [
    'c-level-advisor/cfo-advisor/SKILL.md',
    'finance-skills/financial-analyst/SKILL.md',
    'finance-skills/business-investment-advisor/SKILL.md',
    'finance-skills/saas-metrics-coach/SKILL.md',
  ],

  // المرشد القانوني: عقود + خصوصيّة (CISO يغطّي GDPR/أمن البيانات)
  legal_guide: [
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

  // المحادثة العامّة: لا حاجة لمهارات متخصّصة (تبقى خفيفة)
  general_chat: [],
};

/**
 * يرجع مسارات SKILL.md المُسجّلة لاسم وكيل معيّن (آمن لكلّ سلسلة).
 * يُرجع مصفوفة فارغة إذا لم يكن الوكيل مُسجّلاً.
 */
export function getRegisteredSkillPaths(agentName: string): string[] {
  return AGENT_SKILL_REGISTRY[agentName as AgentName] || [];
}
