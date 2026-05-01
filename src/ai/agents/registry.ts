// @ts-nocheck
import { z } from 'zod';
import { validateIdea } from '@/src/agents/idea-validator/agent';
import { buildBusinessPlanStream } from '@/src/agents/plan-builder/agent';
import { getProactiveWarnings } from '@/src/agents/mistake-shield/agent';
import { analyzeCompany } from '@/src/agents/success-museum/agent';
import { getPersonalizedOpportunities } from '@/src/agents/opportunity-radar/agent';
import { cfoAgentAction } from '@/src/ai/agents/cfo-agent/agent';
import { generatePersonas } from '@/src/ai/agents/persona-generator/agent';
import { simulateFocusGroup } from '@/src/ai/agents/interview-simulator/agent';
import { analyzeInterviewResults } from '@/src/ai/agents/insights-analyzer/agent';
import { legalGuideAction } from '@/src/ai/agents/legal-guide/agent';
import { codeInterpreterAgent } from '@/src/ai/agents/code-interpreter/agent';
// وكلاء جدد — المراحل الأربع
import { competitorIntelAction } from '@/src/ai/agents/competitor-intel/agent';
import { marketResearcherAction } from '@/src/ai/agents/market-researcher/agent';
import { hiringAdvisorAction } from '@/src/ai/agents/hiring-advisor/agent';
import { brandBuilderAction } from '@/src/ai/agents/brand-builder/agent';
import { salesCoachAction } from '@/src/ai/agents/sales-coach/agent';
import { marketingStrategistAction } from '@/src/ai/agents/marketing-strategist/agent';
import { operationsManagerAction } from '@/src/ai/agents/operations-manager/agent';
import { investmentAdvisorAction } from '@/src/ai/agents/investment-advisor/agent';
import { expansionPlannerAction } from '@/src/ai/agents/expansion-planner/agent';
import { boardAdvisorAction } from '@/src/ai/agents/board-advisor/agent';

export const TaskTools = {
  TaskCreate: {
    name: 'TaskCreate',
    description: 'إنشاء مهمة جديدة',
    inputSchema: z.object({
      name: z.string(),
      description: z.string(),
      dueDate: z.string().optional(),
      assignee: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'critical']),
    }),
  },
  TaskGet: {
    name: 'TaskGet',
    description: 'جلب تفاصيل مهمة بواسطة taskId',
    inputSchema: z.object({ taskId: z.string() }),
  },
  TaskUpdate: {
    name: 'TaskUpdate',
    description: 'تحديث حالة مهمة',
    inputSchema: z.object({
      taskId: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'awaiting_human']),
    }),
  },
  TaskList: {
    name: 'TaskList',
    description: 'جلب قائمة بالمهام',
    inputSchema: z.object({
      assignee: z.string().optional(),
      status: z.string().optional(),
    }),
  },
  TaskDelegate: {
    name: 'TaskDelegate',
    description: 'إعادة تفويض مهمة',
    inputSchema: z.object({
      taskId: z.string(),
      newAssignee: z.string(),
    }),
  },
};

/**
 * مرحلة رائد الأعمال التي يستهدفها الوكيل.
 * tool = وكيل خلفي لا يظهر للمستخدم مباشرة.
 */
export type AgentStage = 'idea' | 'startup' | 'growth' | 'scale' | 'tool';

/**
 * نوع غني لكل إيجنت في المنصة. يستهلكه الـ Orchestrator ديناميكياً
 * بدلاً من hardcoding اسم العقدة في الـ StateGraph.
 */
export interface AgentDefinition {
  /** المعرف القصير (slug). */
  name: string;
  /** الاسم بالعربية للعرض في الواجهة. */
  displayNameAr: string;
  /** الوصف بالعربية لشرح ماذا يفعل هذا الإيجنت. */
  description: string;
  /** اسم النية (Intent) كما يخرج من المصنّف — يُربط الإيجنت بهذه النية. */
  intent:
    | 'IDEA_VALIDATOR' | 'PLAN_BUILDER' | 'MISTAKE_SHIELD'
    | 'SUCCESS_MUSEUM' | 'OPPORTUNITY_RADAR' | 'CFO_AGENT'
    | 'LEGAL_GUIDE' | 'REAL_ESTATE' | 'ADMIN' | 'GENERAL_CHAT'
    | 'COMPETITOR_INTEL' | 'MARKET_RESEARCHER'
    | 'HIRING_ADVISOR' | 'BRAND_BUILDER'
    | 'SALES_COACH' | 'MARKETING_STRATEGIST' | 'OPERATIONS_MANAGER'
    | 'INVESTMENT_ADVISOR' | 'EXPANSION_PLANNER' | 'BOARD_ADVISOR'
    | 'TOOL';
  /** مرحلة رائد الأعمال المستهدفة — تستخدمها الواجهة لتجميع الوكلاء. */
  stage: AgentStage;
  /** اسم العقدة في LangGraph (يطابق ما يستخدمه supervisor). */
  graphNode?: string;
  /** المستوى المفضّل من النموذج. */
  preferredModel: 'LITE' | 'FLASH' | 'PRO';
  /** القدرات (capabilities) — تستخدمها الواجهة لعرض شارات. */
  capabilities: string[];
  /** الأدوات (tools) المسموح بها لهذا الإيجنت — تُستهلك من PlanGuard. */
  allowedTools: string[];
  /** ميزانية ناعمة بالدولار لكل استدعاء (تحذير فقط). */
  softCostBudgetUsd: number;
  /** Schema المدخلات. */
  inputSchema: z.ZodTypeAny;
  /** الدالة التنفيذية. */
  action: (...args: unknown[]) => Promise<unknown>;
  /** عنوان عربي قصير يظهر في ThoughtChain. */
  thinkingLabelAr?: string;
}

export const AgentRegistry: Record<string, AgentDefinition> = {

  // ═══════════════════════════════════════════════════════════════════
  // المرحلة 1: الفكرة — Idea Stage
  // ═══════════════════════════════════════════════════════════════════

  'idea-validator': {
    name: 'idea-validator',
    displayNameAr: 'مُحلّل الأفكار',
    description: 'متخصص في تحليل أفكار المشاريع الريادية وتقديم تقارير SWOT وتقييم الجدوى للسوق المصري.',
    intent: 'IDEA_VALIDATOR',
    stage: 'idea',
    graphNode: 'idea_validator_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'rag', 'structured_output'],
    allowedTools: ['rag.search', 'web.search'],
    softCostBudgetUsd: 0.05,
    inputSchema: z.object({ idea: z.string() }),
    action: validateIdea,
    thinkingLabelAr: 'تقييم فكرتك من عدة زوايا...',
  },
  'competitor-intel': {
    name: 'competitor-intel',
    displayNameAr: 'محلل المنافسين',
    description: 'يحلل المنافسين في سوقك ويكتشف الفجوات التي يمكنك استغلالها للتميز.',
    intent: 'COMPETITOR_INTEL',
    stage: 'idea',
    graphNode: 'competitor_intel_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'structured_output'],
    allowedTools: ['web.search'],
    softCostBudgetUsd: 0.05,
    inputSchema: z.object({ industry: z.string(), companyName: z.string().optional() }),
    action: competitorIntelAction,
    thinkingLabelAr: 'مسح المنافسين وتحليل الفجوات...',
  },
  'market-researcher': {
    name: 'market-researcher',
    displayNameAr: 'باحث السوق',
    description: 'يحلل حجم السوق والاتجاهات والشرائح الأكثر نمواً لقطاعك في السوق المصري والعربي.',
    intent: 'MARKET_RESEARCHER',
    stage: 'idea',
    graphNode: 'market_researcher_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'rag', 'structured_output'],
    allowedTools: ['rag.search', 'web.search'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({ industry: z.string(), targetSegment: z.string().optional() }),
    action: marketResearcherAction,
    thinkingLabelAr: 'تحليل حجم السوق والاتجاهات...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // المرحلة 2: الإطلاق — Startup Stage
  // ═══════════════════════════════════════════════════════════════════

  'plan-builder': {
    name: 'plan-builder',
    displayNameAr: 'بنّاء خطة العمل',
    description: 'يبني خطة عمل تفصيلية ودراسة جدوى مع توقعات مالية واقعية للسوق المصري.',
    intent: 'PLAN_BUILDER',
    stage: 'startup',
    graphNode: 'plan_builder_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'rag', 'streaming', 'structured_output'],
    allowedTools: ['rag.search', 'stream.text'],
    softCostBudgetUsd: 0.10,
    inputSchema: z.object({ prompt: z.string() }),
    action: buildBusinessPlanStream,
    thinkingLabelAr: 'بناء خطة العمل التفصيلية...',
  },
  'legal-guide': {
    name: 'legal-guide',
    displayNameAr: 'المرشد القانوني',
    description: 'مرشد قانوني متخصص في التشريعات المصرية للشركات الناشئة (تأسيس، عقود، ضرائب).',
    intent: 'LEGAL_GUIDE',
    stage: 'startup',
    graphNode: 'legal_guide_node',
    preferredModel: 'PRO',
    capabilities: ['rag', 'knowledge_base'],
    allowedTools: ['rag.search', 'legal.search'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({ query: z.string() }),
    action: legalGuideAction,
    thinkingLabelAr: 'مراجعة الجوانب القانونية والتنظيمية...',
  },
  'cfo-agent': {
    name: 'cfo-agent',
    displayNameAr: 'المدير المالي',
    description: 'النمذجة المالية، تحليل السيناريوهات، التنبؤ بالتدفق النقدي، وتقييم الاستثمارات.',
    intent: 'CFO_AGENT',
    stage: 'startup',
    graphNode: 'cfo_agent_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'tools', 'structured_output'],
    allowedTools: ['finance.calc', 'rag.search'],
    softCostBudgetUsd: 0.08,
    inputSchema: z.object({
      task: z.enum(['build-model', 'analyze-scenario', 'forecast-cashflow', 'evaluate-investment', 'stress-test']),
      parameters: z.record(z.string(), z.any()),
    }),
    action: cfoAgentAction,
    thinkingLabelAr: 'إجراء تحليل مالي تفصيلي...',
  },
  'mistake-shield': {
    name: 'mistake-shield',
    displayNameAr: 'حارس الأخطاء',
    description: 'حماية رائد الأعمال من الأخطاء عبر تحذيرات استباقية مبنية على السياق والمرحلة.',
    intent: 'MISTAKE_SHIELD',
    stage: 'startup',
    graphNode: 'mistake_shield_node',
    preferredModel: 'FLASH',
    capabilities: ['rag', 'rules_engine'],
    allowedTools: ['rag.search'],
    softCostBudgetUsd: 0.02,
    inputSchema: z.object({ stage: z.string(), content: z.string() }),
    action: getProactiveWarnings,
    thinkingLabelAr: 'فحص الأخطاء القاتلة في السوق المصري...',
  },
  'hiring-advisor': {
    name: 'hiring-advisor',
    displayNameAr: 'مستشار التوظيف',
    description: 'يساعدك على بناء فريقك الأول باختيار الأدوار المناسبة، الوصف الوظيفي، وأسعار السوق المصري.',
    intent: 'HIRING_ADVISOR',
    stage: 'startup',
    graphNode: 'hiring_advisor_node',
    preferredModel: 'FLASH',
    capabilities: ['analysis', 'structured_output'],
    allowedTools: [],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({ role: z.string(), stage: z.string().optional(), budget: z.string().optional() }),
    action: hiringAdvisorAction,
    thinkingLabelAr: 'تحليل احتياجات التوظيف...',
  },
  'brand-builder': {
    name: 'brand-builder',
    displayNameAr: 'بنّاء العلامة التجارية',
    description: 'يبني هوية علامة تجارية متماسكة: رسالة، قيم، شخصية، وموضع تنافسي يناسب السوق العربي.',
    intent: 'BRAND_BUILDER',
    stage: 'startup',
    graphNode: 'brand_builder_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'structured_output'],
    allowedTools: [],
    softCostBudgetUsd: 0.05,
    inputSchema: z.object({ businessName: z.string(), description: z.string() }),
    action: brandBuilderAction,
    thinkingLabelAr: 'بناء هوية العلامة التجارية...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // المرحلة 3: النمو — Growth Stage
  // ═══════════════════════════════════════════════════════════════════

  'opportunity-radar': {
    name: 'opportunity-radar',
    displayNameAr: 'رادار الفرص',
    description: 'البحث عن فرص تمويل، مسابقات، هاكاثونات، وحاضنات أعمال مناسبة لقطاع المستخدم.',
    intent: 'OPPORTUNITY_RADAR',
    stage: 'growth',
    graphNode: 'opportunity_radar_node',
    preferredModel: 'FLASH',
    capabilities: ['rag', 'web', 'structured_output', 'cache'],
    allowedTools: ['rag.search', 'web.search'],
    softCostBudgetUsd: 0.04,
    inputSchema: z.object({
      industry: z.string(),
      stage: z.string(),
      location: z.string(),
    }),
    action: getPersonalizedOpportunities,
    thinkingLabelAr: 'مسح فرص التمويل والفعاليات...',
  },
  'success-museum': {
    name: 'success-museum',
    displayNameAr: 'متحف النجاح',
    description: 'تحليل قصص نجاح الشركات (مصرية وعالمية) واستخلاص الدروس القابلة للتطبيق.',
    intent: 'SUCCESS_MUSEUM',
    stage: 'growth',
    graphNode: 'success_museum_node',
    preferredModel: 'FLASH',
    capabilities: ['rag', 'structured_output', 'cache'],
    allowedTools: ['rag.search'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({ company: z.string(), context: z.string().optional() }),
    action: analyzeCompany,
    thinkingLabelAr: 'استدعاء قصص نجاح مشابهة...',
  },
  'sales-coach': {
    name: 'sales-coach',
    displayNameAr: 'مدرب المبيعات',
    description: 'يصمم استراتيجية مبيعات فعّالة، سكريبت البيع، وتقنيات إغلاق الصفقة في السوق المصري.',
    intent: 'SALES_COACH',
    stage: 'growth',
    graphNode: 'sales_coach_node',
    preferredModel: 'FLASH',
    capabilities: ['analysis', 'structured_output'],
    allowedTools: [],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({ product: z.string(), target: z.string(), challenge: z.string().optional() }),
    action: salesCoachAction,
    thinkingLabelAr: 'تصميم استراتيجية مبيعات...',
  },
  'marketing-strategist': {
    name: 'marketing-strategist',
    displayNameAr: 'استراتيجي التسويق',
    description: 'يضع خطة تسويق شاملة تغطي القنوات، المحتوى، الميزانية، وخطة 90 يوم للسوق المصري.',
    intent: 'MARKETING_STRATEGIST',
    stage: 'growth',
    graphNode: 'marketing_strategist_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'structured_output'],
    allowedTools: ['web.search'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({ business: z.string(), budget: z.string().optional(), goals: z.string().optional() }),
    action: marketingStrategistAction,
    thinkingLabelAr: 'بناء خطة تسويق شاملة...',
  },
  'operations-manager': {
    name: 'operations-manager',
    displayNameAr: 'مدير العمليات',
    description: 'يشخّص التحديات التشغيلية ويقترح أنظمة وأدوات لتحسين كفاءة شركتك وتقليل التكاليف.',
    intent: 'OPERATIONS_MANAGER',
    stage: 'growth',
    graphNode: 'operations_manager_node',
    preferredModel: 'FLASH',
    capabilities: ['analysis', 'structured_output'],
    allowedTools: [],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({ challenge: z.string(), context: z.string().optional() }),
    action: operationsManagerAction,
    thinkingLabelAr: 'تحليل العمليات واقتراح تحسينات...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // المرحلة 4: التوسع — Scale Stage
  // ═══════════════════════════════════════════════════════════════════

  'real-estate': {
    name: 'real-estate',
    displayNameAr: 'خبير العقارات',
    description: 'خبير عقارات استثمارية مصرية: حساب ROI، تقييم الصفقات، تحليل أسواق المدن.',
    intent: 'REAL_ESTATE',
    stage: 'scale',
    graphNode: 'real_estate_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'tools'],
    allowedTools: ['finance.calc'],
    softCostBudgetUsd: 0.05,
    inputSchema: z.object({ query: z.string() }),
    action: async () => { /* handled inline by supervisor */ },
    thinkingLabelAr: 'بحث في بيانات السوق العقاري...',
  },
  'investment-advisor': {
    name: 'investment-advisor',
    displayNameAr: 'مستشار الاستثمار',
    description: 'يقيّم شركتك ويصمم استراتيجية جذب المستثمرين مع فهم Term Sheets والتفاوض على الحصص.',
    intent: 'INVESTMENT_ADVISOR',
    stage: 'scale',
    graphNode: 'investment_advisor_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'structured_output'],
    allowedTools: ['finance.calc'],
    softCostBudgetUsd: 0.08,
    inputSchema: z.object({ business: z.string(), stage: z.string().optional(), amount: z.string().optional() }),
    action: investmentAdvisorAction,
    thinkingLabelAr: 'تقييم الشركة وتحليل خيارات التمويل...',
  },
  'expansion-planner': {
    name: 'expansion-planner',
    displayNameAr: 'مخطط التوسع',
    description: 'يضع خطة توسع مدروسة لأسواق جديدة مع تحليل المخاطر، المتطلبات القانونية، واستراتيجية الدخول.',
    intent: 'EXPANSION_PLANNER',
    stage: 'scale',
    graphNode: 'expansion_planner_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'rag', 'structured_output'],
    allowedTools: ['rag.search'],
    softCostBudgetUsd: 0.07,
    inputSchema: z.object({ business: z.string(), targetMarket: z.string() }),
    action: expansionPlannerAction,
    thinkingLabelAr: 'تحليل السوق الجديد ووضع خطة التوسع...',
  },
  'board-advisor': {
    name: 'board-advisor',
    displayNameAr: 'مستشار مجلس الإدارة',
    description: 'يقدم توجيهاً استراتيجياً رفيع المستوى لقرارات المصير: الاندماج، التمويل، والتوسع.',
    intent: 'BOARD_ADVISOR',
    stage: 'scale',
    graphNode: 'board_advisor_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'structured_output'],
    allowedTools: [],
    softCostBudgetUsd: 0.10,
    inputSchema: z.object({ question: z.string(), context: z.string().optional() }),
    action: boardAdvisorAction,
    thinkingLabelAr: 'تحليل القرار الاستراتيجي من عدة زوايا...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // وكلاء عامة (بدون مرحلة محددة)
  // ═══════════════════════════════════════════════════════════════════

  'general-chat': {
    name: 'general-chat',
    displayNameAr: 'كلميرون العام',
    description: 'مستشار عام يجيب على الأسئلة المتفرقة ويوجّه المستخدم.',
    intent: 'GENERAL_CHAT',
    stage: 'idea',
    graphNode: 'general_chat_node',
    preferredModel: 'FLASH',
    capabilities: ['chat'],
    allowedTools: [],
    softCostBudgetUsd: 0.01,
    inputSchema: z.object({ message: z.string() }),
    action: async () => { /* handled inline by supervisor */ },
    thinkingLabelAr: 'صياغة الرد بأفضل صيغة...',
  },
  'admin': {
    name: 'admin',
    displayNameAr: 'الإدارة',
    description: 'إعادة توجيه إلى لوحة الإدارة لمراقبة النظام والسجلات.',
    intent: 'ADMIN',
    stage: 'tool',
    graphNode: 'admin_node',
    preferredModel: 'LITE',
    capabilities: ['routing'],
    allowedTools: [],
    softCostBudgetUsd: 0.001,
    inputSchema: z.object({}),
    action: async () => ({ redirect: '/admin' }),
    thinkingLabelAr: 'تنفيذ مهمة إدارية...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // Tool agents (لا تظهر في القائمة الافتراضية للموجِّه)
  // ═══════════════════════════════════════════════════════════════════

  'persona-generator': {
    name: 'persona-generator',
    displayNameAr: 'مولّد الشخصيات',
    description: 'يولّد شخصيات افتراضية واقعية بناءً على وصف السوق المستهدف.',
    intent: 'TOOL',
    stage: 'tool',
    preferredModel: 'FLASH',
    capabilities: ['structured_output'],
    allowedTools: [],
    softCostBudgetUsd: 0.02,
    inputSchema: z.object({ marketDescription: z.string(), count: z.number() }),
    action: generatePersonas,
  },
  'interview-simulator': {
    name: 'interview-simulator',
    displayNameAr: 'محاكي المقابلات',
    description: 'يحاكي مقابلات اكتشاف العملاء مع شخصيات افتراضية.',
    intent: 'TOOL',
    stage: 'tool',
    preferredModel: 'FLASH',
    capabilities: ['simulation'],
    allowedTools: [],
    softCostBudgetUsd: 0.05,
    inputSchema: z.object({ ideaDescription: z.string(), personas: z.array(z.any()), questions: z.array(z.string()) }),
    action: simulateFocusGroup,
  },
  'insights-analyzer': {
    name: 'insights-analyzer',
    displayNameAr: 'محلل الرؤى',
    description: 'يحلل نتائج محاكاة السوق ويستخلص رؤى قابلة للتنفيذ.',
    intent: 'TOOL',
    stage: 'tool',
    preferredModel: 'FLASH',
    capabilities: ['analysis'],
    allowedTools: [],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({ ideaDescription: z.string(), results: z.array(z.any()) }),
    action: analyzeInterviewResults,
  },
  'code-interpreter': {
    name: 'code-interpreter',
    displayNameAr: 'مفسّر الأكواد',
    description: 'تنفيذ الأكواد وتحليل الملفات (Excel, CSV, JSON).',
    intent: 'TOOL',
    stage: 'tool',
    preferredModel: 'FLASH',
    capabilities: ['code', 'files'],
    allowedTools: ['code.exec'],
    softCostBudgetUsd: 0.04,
    inputSchema: z.object({
      task: z.enum(['execute', 'analyze']),
      code: z.string().optional(),
      fileUrl: z.string().optional(),
      userId: z.string(),
    }),
    action: codeInterpreterAgent,
  },
};

/** قائمة الإيجنتات التي يجوز للموجّه (router) اختيارها. */
export function getRoutableAgents(): AgentDefinition[] {
  return Object.values(AgentRegistry).filter(a => a.intent !== 'TOOL' && !!a.graphNode);
}

/** جلب الوكلاء مجمّعة حسب المرحلة. */
export function getAgentsByStage(): Record<AgentStage, AgentDefinition[]> {
  const result: Record<AgentStage, AgentDefinition[]> = {
    idea: [], startup: [], growth: [], scale: [], tool: [],
  };
  for (const agent of Object.values(AgentRegistry)) {
    result[agent.stage].push(agent);
  }
  return result;
}

/** ابحث عن إيجنت بواسطة intent (مفيد للـ supervisor). */
export function findAgentByIntent(intent: string): AgentDefinition | undefined {
  return Object.values(AgentRegistry).find(a => a.intent === intent);
}

/** اللصاقة العربية للحالة "يفكر". */
export function getThinkingLabelForNode(graphNode: string): string | undefined {
  return Object.values(AgentRegistry).find(a => a.graphNode === graphNode)?.thinkingLabelAr;
}
