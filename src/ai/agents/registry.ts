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
// ═══ C-Suite Executive Agents ═══
import { ceoAgentAction } from '@/src/ai/agents/ceo/agent';
import { cooAgentAction } from '@/src/ai/agents/coo/agent';
import { cmoAgentAction } from '@/src/ai/agents/cmo/agent';
import { ctoAgentAction } from '@/src/ai/agents/cto/agent';
import { cloAgentAction } from '@/src/ai/agents/clo/agent';
import { chroAgentAction } from '@/src/ai/agents/chro/agent';
import { csoAgentAction } from '@/src/ai/agents/cso/agent';
// ═══ Department Employee Agents — Finance ═══
import { budgetAnalystAction } from '@/src/ai/agents/budget-analyst/agent';
import { cashRunwayAction } from '@/src/ai/agents/cash-runway/agent';
import { financialModelingAction } from '@/src/ai/agents/financial-modeling/agent';
import { equityManagerAction } from '@/src/ai/agents/equity-manager/agent';
import { valuationExpertAction } from '@/src/ai/agents/valuation-expert/agent';
// ═══ Department Employee Agents — Sales ═══
import { leadQualifierAction } from '@/src/ai/agents/lead-qualifier/agent';
import { salesPipelineAction } from '@/src/ai/agents/sales-pipeline/agent';
import { pitchDeckAction } from '@/src/ai/agents/pitch-deck/agent';
import { salesStrategistAction } from '@/src/ai/agents/sales-strategist/agent';
// ═══ Department Employee Agents — Marketing ═══
import { contentCreatorAction } from '@/src/ai/agents/content-creator/agent';
import { seoManagerAction } from '@/src/ai/agents/seo-manager/agent';
import { adsManagerAction } from '@/src/ai/agents/ads-manager/agent';
import { acquisitionStrategistAction } from '@/src/ai/agents/acquisition-strategist/agent';
// ═══ Department Employee Agents — Technology ═══
import { productManagerAction } from '@/src/ai/agents/product-manager/agent';
import { devopsEngineerAction } from '@/src/ai/agents/devops-engineer/agent';
import { qaManagerAction } from '@/src/ai/agents/qa-manager/agent';
// ═══ Department Employee Agents — Legal ═══
import { contractDrafterAction } from '@/src/ai/agents/contract-drafter/agent';
import { ipProtectorAction } from '@/src/ai/agents/ip-protector/agent';
import { dataPrivacyAction } from '@/src/ai/agents/data-privacy/agent';
// ═══ Department Employee Agents — HR ═══
import { cultureExpertAction } from '@/src/ai/agents/culture-expert/agent';
import { performanceManagerAction } from '@/src/ai/agents/performance-manager/agent';
import { orgDesignerAction } from '@/src/ai/agents/org-designer/agent';
// ═══ Department Employee Agents — Support ═══
import { csatAnalystAction } from '@/src/ai/agents/csat-analyst/agent';
import { knowledgeBuilderAction } from '@/src/ai/agents/knowledge-builder/agent';
import { ticketManagerAction } from '@/src/ai/agents/ticket-manager/agent';
// ═══ New Agents — Wellbeing, Contract, Discovery, Cofounder ═══
import { wellbeingCoachAction } from '@/src/ai/agents/wellbeing-coach/agent';
import { contractReviewerAction } from '@/src/ai/agents/contract-reviewer/agent';
import { customerDiscoveryAction } from '@/src/ai/agents/customer-discovery/agent';
import { cofounderHealthCheckAction } from '@/src/ai/agents/cofounder-coach/agent';

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
    // C-Suite Executive Intents
    | 'CEO_AGENT' | 'COO_AGENT' | 'CMO_AGENT' | 'CTO_AGENT'
    | 'CLO_AGENT' | 'CHRO_AGENT' | 'CSO_AGENT'
    // Finance Department Employee Intents
    | 'BUDGET_ANALYST' | 'CASH_RUNWAY' | 'FINANCIAL_MODELING'
    | 'EQUITY_MANAGER' | 'VALUATION_EXPERT'
    // Sales Department Employee Intents
    | 'LEAD_QUALIFIER' | 'SALES_PIPELINE' | 'PITCH_DECK' | 'SALES_STRATEGIST'
    // Marketing Department Employee Intents
    | 'CONTENT_CREATOR' | 'SEO_MANAGER' | 'ADS_MANAGER' | 'ACQUISITION_STRATEGIST'
    // Technology Department Employee Intents
    | 'PRODUCT_MANAGER' | 'DEVOPS_ENGINEER' | 'QA_MANAGER'
    // Legal Department Employee Intents
    | 'CONTRACT_DRAFTER' | 'IP_PROTECTOR' | 'DATA_PRIVACY'
    // HR Department Employee Intents
    | 'CULTURE_EXPERT' | 'PERFORMANCE_MANAGER' | 'ORG_DESIGNER'
    // Support Department Employee Intents
    | 'CSAT_ANALYST' | 'KNOWLEDGE_BUILDER' | 'TICKET_MANAGER'
    // Additional agent intents
    | 'WELLBEING_COACH' | 'CONTRACT_REVIEWER' | 'CUSTOMER_DISCOVERY' | 'COFOUNDER_COACH'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (...args: any[]) => Promise<unknown>;
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
    action: (input: unknown) => codeInterpreterAgent.run(String((input as { task?: string })?.task ?? '')),
  },

  // ═══════════════════════════════════════════════════════════════════
  // طبقة القيادة التنفيذية (C-Suite) — هيكل الشركات الكبرى
  // ═══════════════════════════════════════════════════════════════════

  'ceo-agent': {
    name: 'ceo-agent',
    displayNameAr: 'المدير التنفيذي',
    description: 'الرئيس التنفيذي الذكي — يُوجّه، يُوزّع المهام على الفريق التنفيذي، ويُلخّص القرارات الاستراتيجية الكبرى.',
    intent: 'CEO_AGENT',
    stage: 'scale',
    graphNode: 'ceo_agent_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'delegation', 'strategic_synthesis', 'structured_output'],
    allowedTools: ['ceo.delegate', 'ceo.synthesize'],
    softCostBudgetUsd: 0.15,
    inputSchema: z.object({
      message: z.string(),
      context: z.string().optional(),
      urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      domain: z.enum(['finance', 'marketing', 'operations', 'technology', 'legal', 'hr', 'strategy', 'general']).optional(),
    }),
    action: ceoAgentAction,
    thinkingLabelAr: 'تحليل القرار الاستراتيجي على مستوى القيادة...',
  },

  'coo-agent': {
    name: 'coo-agent',
    displayNameAr: 'مدير العمليات التنفيذي',
    description: 'الرئيس التنفيذي للعمليات — يُحوّل الاستراتيجية لخطوات تشغيلية قابلة للتنفيذ والقياس.',
    intent: 'COO_AGENT',
    stage: 'growth',
    graphNode: 'coo_agent_node',
    preferredModel: 'FLASH',
    capabilities: ['process_optimization', 'risk_management', 'okr', 'structured_output'],
    allowedTools: ['coo.plan', 'coo.metrics'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({
      message: z.string(),
      context: z.string().optional(),
      focusArea: z.enum(['process', 'risk', 'okr', 'quality', 'general']).optional(),
      currentMetrics: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
    }),
    action: cooAgentAction,
    thinkingLabelAr: 'تحليل العمليات وتحديد فرص التحسين...',
  },

  'cmo-agent': {
    name: 'cmo-agent',
    displayNameAr: 'مدير التسويق التنفيذي',
    description: 'الرئيس التنفيذي للتسويق — يبني العلامة التجارية ويُصمّم استراتيجيات النمو للسوق العربي.',
    intent: 'CMO_AGENT',
    stage: 'growth',
    graphNode: 'cmo_agent_node',
    preferredModel: 'FLASH',
    capabilities: ['marketing_strategy', 'brand', 'growth', 'structured_output'],
    allowedTools: ['cmo.strategy', 'cmo.brand'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({
      message: z.string(),
      industry: z.string().optional(),
      targetAudience: z.string().optional(),
      budget: z.string().optional(),
      currentStage: z.enum(['idea', 'launch', 'growth', 'scale']).optional(),
    }),
    action: cmoAgentAction,
    thinkingLabelAr: 'رسم استراتيجية التسويق والنمو...',
  },

  'cto-agent': {
    name: 'cto-agent',
    displayNameAr: 'مدير التقنية التنفيذي',
    description: 'الرئيس التنفيذي للتقنية — يُقيّم التكنولوجيا ويُصمّم البنية التحتية ويقود التحول الرقمي.',
    intent: 'CTO_AGENT',
    stage: 'growth',
    graphNode: 'cto_agent_node',
    preferredModel: 'FLASH',
    capabilities: ['technical_assessment', 'architecture', 'ai_implementation'],
    allowedTools: ['cto.assess', 'cto.recommend'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({
      message: z.string(),
      currentTechStack: z.string().optional(),
      teamSize: z.number().optional(),
      stage: z.enum(['mvp', 'launch', 'growth', 'scale']).optional(),
      budget: z.string().optional(),
    }),
    action: ctoAgentAction,
    thinkingLabelAr: 'تقييم التقنية ووضع خارطة الطريق التقنية...',
  },

  'clo-agent': {
    name: 'clo-agent',
    displayNameAr: 'المستشار القانوني الأول',
    description: 'الرئيس التنفيذي للشؤون القانونية — يُحلّل المخاطر القانونية ويضمن الامتثال للقانون المصري والدولي.',
    intent: 'CLO_AGENT',
    stage: 'startup',
    graphNode: 'clo_agent_node',
    preferredModel: 'FLASH',
    capabilities: ['legal_analysis', 'compliance', 'risk_assessment'],
    allowedTools: ['clo.analyze', 'legal.search'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({
      message: z.string(),
      companyType: z.string().optional(),
      jurisdiction: z.enum(['egypt', 'uae', 'ksa', 'international']).optional(),
      urgency: z.enum(['low', 'medium', 'high']).optional(),
    }),
    action: cloAgentAction,
    thinkingLabelAr: 'تحليل الإطار القانوني والامتثال التنظيمي...',
  },

  'chro-agent': {
    name: 'chro-agent',
    displayNameAr: 'مدير الموارد البشرية التنفيذي',
    description: 'الرئيس التنفيذي للموارد البشرية — يستقطب المواهب ويبني ثقافة مؤسسية قوية وهياكل تنظيمية فعّالة.',
    intent: 'CHRO_AGENT',
    stage: 'growth',
    graphNode: 'chro_agent_node',
    preferredModel: 'FLASH',
    capabilities: ['hr_strategy', 'recruitment', 'culture_building'],
    allowedTools: ['chro.strategy', 'chro.recruit'],
    softCostBudgetUsd: 0.05,
    inputSchema: z.object({
      message: z.string(),
      companySize: z.number().optional(),
      industry: z.string().optional(),
      stage: z.enum(['startup', 'growth', 'scale']).optional(),
      hrChallenge: z.enum(['hiring', 'retention', 'culture', 'performance', 'structure', 'general']).optional(),
    }),
    action: chroAgentAction,
    thinkingLabelAr: 'بناء استراتيجية الموارد البشرية والمواهب...',
  },

  'cso-agent': {
    name: 'cso-agent',
    displayNameAr: 'مدير الاستراتيجية التنفيذي',
    description: 'الرئيس التنفيذي للاستراتيجية — يرصد الفرص، يُصمّم التوسع، ويبني رؤية الأعمال على المدى البعيد.',
    intent: 'CSO_AGENT',
    stage: 'scale',
    graphNode: 'cso_agent_node',
    preferredModel: 'PRO',
    capabilities: ['strategic_planning', 'opportunity_identification', 'expansion', 'investor_relations'],
    allowedTools: ['cso.analyze', 'cso.opportunity'],
    softCostBudgetUsd: 0.12,
    inputSchema: z.object({
      message: z.string(),
      industry: z.string().optional(),
      currentStage: z.enum(['idea', 'startup', 'growth', 'scale']).optional(),
      horizonYears: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)]).optional(),
      focusArea: z.enum(['opportunity', 'expansion', 'investor', 'innovation', 'general']).optional(),
    }),
    action: csoAgentAction,
    thinkingLabelAr: 'رسم الرؤية الاستراتيجية واكتشاف الفرص...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // موظفو قسم المالية — Finance Department Employees
  // ═══════════════════════════════════════════════════════════════════

  'budget-analyst': {
    name: 'budget-analyst',
    displayNameAr: 'محلّل الميزانية',
    description: 'يحلل الميزانيات ويكشف الانحرافات ويبني نماذج ميزانية صفرية للشركات الناشئة.',
    intent: 'BUDGET_ANALYST',
    stage: 'tool',
    graphNode: 'budget_analyst_node',
    preferredModel: 'FLASH',
    capabilities: ['financial_analysis', 'structured_output'],
    allowedTools: ['finance.budget'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      task: z.enum(['analyze-variance', 'build-zero-budget', 'break-even', 'cost-structure', 'general']),
      data: z.record(z.string(), z.any()),
      period: z.string().optional(),
    }),
    action: budgetAnalystAction,
    thinkingLabelAr: 'تحليل الميزانية والانحرافات...',
  },

  'cash-runway': {
    name: 'cash-runway',
    displayNameAr: 'مدير السيولة',
    description: 'يحسب المدرج النقدي ويحلل التدفق النقدي ويضع خطط تمديد السيولة.',
    intent: 'CASH_RUNWAY',
    stage: 'tool',
    graphNode: 'cash_runway_node',
    preferredModel: 'FLASH',
    capabilities: ['financial_analysis', 'forecasting'],
    allowedTools: ['finance.cash'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      monthlyBurn: z.number(),
      cashOnHand: z.number(),
      monthlyRevenue: z.number().optional(),
      growthRate: z.number().optional(),
      context: z.string().optional(),
    }),
    action: cashRunwayAction,
    thinkingLabelAr: 'حساب المدرج النقدي وتحليل السيولة...',
  },

  'financial-modeling': {
    name: 'financial-modeling',
    displayNameAr: 'خبير النمذجة المالية',
    description: 'يبني نماذج DCF وUnit Economics وسيناريوهات مالية للشركات الناشئة.',
    intent: 'FINANCIAL_MODELING',
    stage: 'tool',
    graphNode: 'financial_modeling_node',
    preferredModel: 'PRO',
    capabilities: ['financial_modeling', 'dcf', 'scenario_analysis'],
    allowedTools: ['finance.model'],
    softCostBudgetUsd: 0.08,
    inputSchema: z.object({
      modelType: z.enum(['dcf', 'unit-economics', 'three-statement', 'valuation', 'scenario']),
      businessData: z.record(z.string(), z.any()),
      horizon: z.number().optional(),
    }),
    action: financialModelingAction,
    thinkingLabelAr: 'بناء النموذج المالي التفصيلي...',
  },

  'equity-manager': {
    name: 'equity-manager',
    displayNameAr: 'مدير حقوق الملكية',
    description: 'يدير Cap Table وESOPs ويحلل التخفيف وجولات التمويل.',
    intent: 'EQUITY_MANAGER',
    stage: 'tool',
    graphNode: 'equity_manager_node',
    preferredModel: 'PRO',
    capabilities: ['cap_table', 'equity_analysis', 'esop'],
    allowedTools: ['finance.equity'],
    softCostBudgetUsd: 0.07,
    inputSchema: z.object({
      task: z.enum(['build-cap-table', 'model-dilution', 'design-esop', 'analyze-term-sheet', 'vesting-schedule']),
      founders: z.array(z.object({ name: z.string(), shares: z.number(), percentage: z.number() })).optional(),
      investors: z.array(z.object({ name: z.string(), amount: z.number(), valuation: z.number(), round: z.string() })).optional(),
      context: z.record(z.string(), z.any()).optional(),
    }),
    action: equityManagerAction,
    thinkingLabelAr: 'تحليل هيكل الملكية والتخفيف...',
  },

  'valuation-expert': {
    name: 'valuation-expert',
    displayNameAr: 'خبير التقييم',
    description: 'يقيّم الشركات بمنهجيات DCF والمضاعفات وBerkus للسوق المصري والعربي.',
    intent: 'VALUATION_EXPERT',
    stage: 'tool',
    graphNode: 'valuation_expert_node',
    preferredModel: 'PRO',
    capabilities: ['valuation', 'dcf', 'multiples', 'market_benchmarks'],
    allowedTools: ['finance.valuation'],
    softCostBudgetUsd: 0.08,
    inputSchema: z.object({
      companyData: z.object({
        revenue: z.number().optional(),
        arr: z.number().optional(),
        growthRate: z.number().optional(),
        sector: z.string(),
        stage: z.string(),
        team: z.string().optional(),
        product: z.string().optional(),
        traction: z.string().optional(),
      }),
      method: z.enum(['multiples', 'dcf', 'berkus', 'scorecard', 'vc-method', 'all']).optional(),
    }),
    action: valuationExpertAction,
    thinkingLabelAr: 'تقييم الشركة بمنهجيات متعددة...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // موظفو قسم المبيعات — Sales Department Employees
  // ═══════════════════════════════════════════════════════════════════

  'lead-qualifier': {
    name: 'lead-qualifier',
    displayNameAr: 'مؤهّل العملاء',
    description: 'يقيّم ويؤهّل العملاء المحتملين باستخدام BANT/MEDDIC لسوق مصر.',
    intent: 'LEAD_QUALIFIER',
    stage: 'tool',
    graphNode: 'lead_qualifier_node',
    preferredModel: 'FLASH',
    capabilities: ['sales_qualification', 'bant', 'lead_scoring'],
    allowedTools: ['sales.qualify'],
    softCostBudgetUsd: 0.02,
    inputSchema: z.object({
      leadData: z.record(z.string(), z.any()),
      method: z.enum(['bant', 'meddic', 'spin', 'icp-match']).optional(),
      productDescription: z.string().optional(),
    }),
    action: leadQualifierAction,
    thinkingLabelAr: 'تقييم العميل المحتمل وتحديد جاهزيته...',
  },

  'sales-pipeline': {
    name: 'sales-pipeline',
    displayNameAr: 'محلّل خط المبيعات',
    description: 'يحلل Pipeline المبيعات ويتوقع الإيرادات ويكتشف bottlenecks.',
    intent: 'SALES_PIPELINE',
    stage: 'tool',
    graphNode: 'sales_pipeline_node',
    preferredModel: 'FLASH',
    capabilities: ['pipeline_analysis', 'forecasting', 'win_rate'],
    allowedTools: ['sales.pipeline'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      pipelineData: z.array(z.object({
        dealName: z.string(),
        stage: z.string(),
        value: z.number(),
        probability: z.number().optional(),
        age: z.number().optional(),
        nextAction: z.string().optional(),
      })),
      monthlyTarget: z.number().optional(),
      context: z.string().optional(),
    }),
    action: salesPipelineAction,
    thinkingLabelAr: 'تحليل Pipeline وتوقع الإيراد...',
  },

  'pitch-deck': {
    name: 'pitch-deck',
    displayNameAr: 'منشئ عروض الاستثمار',
    description: 'يبني عروض استثمارية مقنعة للمستثمرين المصريين والعرب.',
    intent: 'PITCH_DECK',
    stage: 'tool',
    graphNode: 'pitch_deck_node',
    preferredModel: 'PRO',
    capabilities: ['pitch_deck', 'storytelling', 'investor_presentation'],
    allowedTools: ['sales.pitch'],
    softCostBudgetUsd: 0.08,
    inputSchema: z.object({
      business: z.object({
        name: z.string(),
        sector: z.string(),
        problem: z.string(),
        solution: z.string(),
        revenue: z.number().optional(),
        growthRate: z.number().optional(),
        teamDescription: z.string().optional(),
        fundingAsk: z.number().optional(),
        stage: z.string().optional(),
      }),
      targetInvestors: z.string().optional(),
      format: z.enum(['outline', 'full-narrative', 'slide-by-slide']).optional(),
    }),
    action: pitchDeckAction,
    thinkingLabelAr: 'بناء عرض استثماري مقنع...',
  },

  'sales-strategist': {
    name: 'sales-strategist',
    displayNameAr: 'مطوّر استراتيجية المبيعات',
    description: 'يبني Go-to-Market Strategy وPlaybook المبيعات لأسواق مصر.',
    intent: 'SALES_STRATEGIST',
    stage: 'tool',
    graphNode: 'sales_strategist_node',
    preferredModel: 'PRO',
    capabilities: ['gtm_strategy', 'sales_playbook', 'pricing'],
    allowedTools: ['sales.strategy'],
    softCostBudgetUsd: 0.07,
    inputSchema: z.object({
      task: z.enum(['gtm-strategy', 'sales-playbook', 'pricing-strategy', 'channel-strategy', 'team-structure']),
      businessModel: z.string().optional(),
      targetMarket: z.string().optional(),
      currentRevenue: z.number().optional(),
      competitiveLandscape: z.string().optional(),
      stage: z.string().optional(),
    }),
    action: salesStrategistAction,
    thinkingLabelAr: 'بناء استراتيجية المبيعات والتوزيع...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // موظفو قسم التسويق — Marketing Department Employees
  // ═══════════════════════════════════════════════════════════════════

  'content-creator': {
    name: 'content-creator',
    displayNameAr: 'منشئ المحتوى الرقمي',
    description: 'ينتج محتوى رقمي عربي عالي الجودة للسوشيال ميديا والبلوج والإعلانات.',
    intent: 'CONTENT_CREATOR',
    stage: 'tool',
    graphNode: 'content_creator_node',
    preferredModel: 'FLASH',
    capabilities: ['content_creation', 'arabic_writing', 'social_media'],
    allowedTools: ['marketing.content'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      contentType: z.enum(['social-post', 'blog-article', 'video-script', 'email', 'ad-copy', 'case-study', 'thread']),
      topic: z.string(),
      brand: z.string().optional(),
      tone: z.enum(['formal', 'casual', 'inspiring', 'educational', 'promotional']).optional(),
      platform: z.string().optional(),
      wordCount: z.number().optional(),
      keyPoints: z.array(z.string()).optional(),
    }),
    action: contentCreatorAction,
    thinkingLabelAr: 'كتابة محتوى رقمي مميز...',
  },

  'seo-manager': {
    name: 'seo-manager',
    displayNameAr: 'مدير SEO',
    description: 'يُحسّن ظهور المواقع في محركات البحث العربية ويبني استراتيجية محتوى.',
    intent: 'SEO_MANAGER',
    stage: 'tool',
    graphNode: 'seo_manager_node',
    preferredModel: 'FLASH',
    capabilities: ['seo', 'keyword_research', 'content_brief', 'arabic_seo'],
    allowedTools: ['marketing.seo'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      task: z.enum(['keyword-research', 'on-page-audit', 'content-brief', 'competitor-analysis', 'strategy']),
      target: z.string().optional(),
      currentMetrics: z.record(z.string(), z.any()).optional(),
      industry: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }),
    action: seoManagerAction,
    thinkingLabelAr: 'تحليل SEO والكلمات المفتاحية...',
  },

  'ads-manager': {
    name: 'ads-manager',
    displayNameAr: 'مدير الإعلانات الرقمية',
    description: 'يُدير ويُحسّن الحملات الإعلانية على Facebook وGoogle وTikTok.',
    intent: 'ADS_MANAGER',
    stage: 'tool',
    graphNode: 'ads_manager_node',
    preferredModel: 'FLASH',
    capabilities: ['paid_advertising', 'facebook_ads', 'google_ads', 'roas_optimization'],
    allowedTools: ['marketing.ads'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      task: z.enum(['plan-campaign', 'analyze-performance', 'optimize-budget', 'write-ad-copy', 'targeting-strategy']),
      platform: z.string().optional(),
      budget: z.number().optional(),
      objective: z.string().optional(),
      audience: z.string().optional(),
      performanceData: z.record(z.string(), z.any()).optional(),
      product: z.string().optional(),
    }),
    action: adsManagerAction,
    thinkingLabelAr: 'تحليل وتحسين الحملات الإعلانية...',
  },

  'acquisition-strategist': {
    name: 'acquisition-strategist',
    displayNameAr: 'استراتيجي اكتساب العملاء',
    description: 'يصمم Growth Loops وبرامج إحالة لاكتساب عملاء بأقل تكلفة.',
    intent: 'ACQUISITION_STRATEGIST',
    stage: 'tool',
    graphNode: 'acquisition_strategist_node',
    preferredModel: 'FLASH',
    capabilities: ['growth_hacking', 'acquisition_strategy', 'referral_programs', 'plg'],
    allowedTools: ['marketing.acquisition'],
    softCostBudgetUsd: 0.04,
    inputSchema: z.object({
      task: z.enum(['growth-strategy', 'channel-mix', 'referral-program', 'plg-design', 'acquisition-audit']),
      productType: z.string().optional(),
      currentCAC: z.number().optional(),
      monthlyBudget: z.number().optional(),
      targetAudience: z.string().optional(),
      currentChannels: z.array(z.string()).optional(),
    }),
    action: acquisitionStrategistAction,
    thinkingLabelAr: 'تصميم Growth Loop لاكتساب العملاء...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // موظفو قسم التقنية — Technology Department Employees
  // ═══════════════════════════════════════════════════════════════════

  'product-manager': {
    name: 'product-manager',
    displayNameAr: 'مدير المنتج',
    description: 'يبني PRDs وRoadmaps وUser Stories ويحدد أولويات الميزات.',
    intent: 'PRODUCT_MANAGER',
    stage: 'tool',
    graphNode: 'product_manager_node',
    preferredModel: 'PRO',
    capabilities: ['product_management', 'prd', 'roadmap', 'user_stories'],
    allowedTools: ['product.manage'],
    softCostBudgetUsd: 0.07,
    inputSchema: z.object({
      task: z.enum(['write-prd', 'prioritize-features', 'create-roadmap', 'user-stories', 'define-metrics']),
      productContext: z.string(),
      features: z.array(z.string()).optional(),
      userFeedback: z.string().optional(),
      businessGoals: z.string().optional(),
      timeframe: z.string().optional(),
    }),
    action: productManagerAction,
    thinkingLabelAr: 'بناء وثائق المنتج والأولويات...',
  },

  'devops-engineer': {
    name: 'devops-engineer',
    displayNameAr: 'مهندس DevOps',
    description: 'يصمم CI/CD Pipelines والبنية السحابية ويحسن تكاليف الخوادم.',
    intent: 'DEVOPS_ENGINEER',
    stage: 'tool',
    graphNode: 'devops_engineer_node',
    preferredModel: 'FLASH',
    capabilities: ['devops', 'cicd', 'cloud_architecture', 'cost_optimization'],
    allowedTools: ['tech.devops'],
    softCostBudgetUsd: 0.04,
    inputSchema: z.object({
      task: z.enum(['design-cicd', 'cloud-architecture', 'cost-optimization', 'monitoring-setup', 'security-audit', 'incident-response']),
      stack: z.string().optional(),
      currentInfrastructure: z.record(z.string(), z.any()).optional(),
      budget: z.string().optional(),
      problem: z.string().optional(),
    }),
    action: devopsEngineerAction,
    thinkingLabelAr: 'تصميم البنية التقنية وخطوط النشر...',
  },

  'qa-manager': {
    name: 'qa-manager',
    displayNameAr: 'مدير ضبط الجودة',
    description: 'يكتب Test Plans وTest Cases ويُدير عملية ضبط جودة المنتجات العربية.',
    intent: 'QA_MANAGER',
    stage: 'tool',
    graphNode: 'qa_manager_node',
    preferredModel: 'FLASH',
    capabilities: ['quality_assurance', 'test_planning', 'rtl_testing', 'accessibility'],
    allowedTools: ['tech.qa'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      task: z.enum(['write-test-plan', 'create-test-cases', 'bug-triage', 'performance-test', 'accessibility-check', 'release-checklist']),
      featureOrBug: z.string(),
      acceptanceCriteria: z.array(z.string()).optional(),
      bugDetails: z.record(z.string(), z.any()).optional(),
      platform: z.string().optional(),
    }),
    action: qaManagerAction,
    thinkingLabelAr: 'بناء خطة اختبار الجودة...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // موظفو القسم القانوني — Legal Department Employees
  // ═══════════════════════════════════════════════════════════════════

  'contract-drafter': {
    name: 'contract-drafter',
    displayNameAr: 'محرّر العقود',
    description: 'يُصيغ العقود التجارية وعقود التأسيس والشراكة وفق القانون المصري.',
    intent: 'CONTRACT_DRAFTER',
    stage: 'tool',
    graphNode: 'contract_drafter_node',
    preferredModel: 'PRO',
    capabilities: ['contract_drafting', 'egyptian_law', 'bilingual_contracts'],
    allowedTools: ['legal.contract'],
    softCostBudgetUsd: 0.09,
    inputSchema: z.object({
      contractType: z.enum(['founders-agreement', 'employment', 'nda', 'service-agreement', 'investment', 'partnership', 'saas-terms']),
      parties: z.array(z.object({ name: z.string(), role: z.string(), entity: z.string().optional() })),
      keyTerms: z.record(z.string(), z.any()).optional(),
      language: z.enum(['ar', 'en', 'bilingual']).optional(),
      jurisdiction: z.string().optional(),
    }),
    action: contractDrafterAction,
    thinkingLabelAr: 'صياغة مسودة العقد القانوني...',
  },

  'ip-protector': {
    name: 'ip-protector',
    displayNameAr: 'خبير الملكية الفكرية',
    description: 'يحمي العلامات التجارية وبراءات الاختراع وحقوق المؤلف في مصر والمنطقة.',
    intent: 'IP_PROTECTOR',
    stage: 'tool',
    graphNode: 'ip_protector_node',
    preferredModel: 'PRO',
    capabilities: ['ip_strategy', 'trademark', 'patent', 'copyright'],
    allowedTools: ['legal.ip'],
    softCostBudgetUsd: 0.07,
    inputSchema: z.object({
      task: z.enum(['trademark-search', 'ip-strategy', 'due-diligence', 'licensing-advice', 'trade-secret-protection']),
      assetDescription: z.string(),
      sector: z.string().optional(),
      currentProtections: z.array(z.string()).optional(),
      investmentStage: z.string().optional(),
    }),
    action: ipProtectorAction,
    thinkingLabelAr: 'وضع استراتيجية حماية الملكية الفكرية...',
  },

  'data-privacy': {
    name: 'data-privacy',
    displayNameAr: 'مدقّق حماية البيانات',
    description: 'يدقق الامتثال لقانون 151/2020 المصري وGDPR ويكتب سياسات الخصوصية.',
    intent: 'DATA_PRIVACY',
    stage: 'tool',
    graphNode: 'data_privacy_node',
    preferredModel: 'FLASH',
    capabilities: ['data_privacy', 'gdpr', 'egyptian_data_law', 'privacy_policy'],
    allowedTools: ['legal.privacy'],
    softCostBudgetUsd: 0.04,
    inputSchema: z.object({
      task: z.enum(['privacy-audit', 'draft-policy', 'dpia', 'breach-response', 'consent-design', 'compliance-checklist']),
      productDescription: z.string().optional(),
      dataTypes: z.array(z.string()).optional(),
      userLocations: z.array(z.string()).optional(),
      currentPolicies: z.string().optional(),
    }),
    action: dataPrivacyAction,
    thinkingLabelAr: 'مراجعة الامتثال لقوانين البيانات...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // موظفو قسم الموارد البشرية — HR Department Employees
  // ═══════════════════════════════════════════════════════════════════

  'culture-expert': {
    name: 'culture-expert',
    displayNameAr: 'خبير الثقافة المؤسسية',
    description: 'يبني ثقافة مؤسسية قوية وبرامج Onboarding وRecognition للشركات الناشئة.',
    intent: 'CULTURE_EXPERT',
    stage: 'tool',
    graphNode: 'culture_expert_node',
    preferredModel: 'FLASH',
    capabilities: ['culture_building', 'employer_branding', 'onboarding', 'enps'],
    allowedTools: ['hr.culture'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      task: z.enum(['define-values', 'design-onboarding', 'culture-survey', 'recognition-program', 'employer-branding']),
      companyDescription: z.string().optional(),
      currentChallenges: z.array(z.string()).optional(),
      teamSize: z.number().optional(),
      stage: z.string().optional(),
    }),
    action: cultureExpertAction,
    thinkingLabelAr: 'بناء الثقافة المؤسسية والانتماء...',
  },

  'performance-manager': {
    name: 'performance-manager',
    displayNameAr: 'مدير الأداء',
    description: 'يصمم أنظمة تقييم الأداء وIDPs وPIPs ومسارات التطوير المهني.',
    intent: 'PERFORMANCE_MANAGER',
    stage: 'tool',
    graphNode: 'performance_manager_node',
    preferredModel: 'FLASH',
    capabilities: ['performance_management', 'okr', 'idp', 'career_ladder'],
    allowedTools: ['hr.performance'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      task: z.enum(['design-review-system', 'create-idp', 'pip-plan', 'career-ladder', 'comp-benchmarking', 'skill-gap']),
      employeeData: z.record(z.string(), z.any()).optional(),
      role: z.string().optional(),
      currentPerformance: z.string().optional(),
      goals: z.array(z.string()).optional(),
    }),
    action: performanceManagerAction,
    thinkingLabelAr: 'تصميم نظام تقييم الأداء...',
  },

  'org-designer': {
    name: 'org-designer',
    displayNameAr: 'مصمّم الهيكل التنظيمي',
    description: 'يصمم الهياكل التنظيمية القابلة للتوسع وخطط التوظيف ومصفوفات المسؤوليات.',
    intent: 'ORG_DESIGNER',
    stage: 'tool',
    graphNode: 'org_designer_node',
    preferredModel: 'FLASH',
    capabilities: ['org_design', 'job_architecture', 'raci_matrix', 'hiring_plan'],
    allowedTools: ['hr.org'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      task: z.enum(['design-org-chart', 'job-architecture', 'raci-matrix', 'hiring-plan', 'restructure']),
      companyStage: z.string().optional(),
      headcount: z.number().optional(),
      departments: z.array(z.string()).optional(),
      budget: z.string().optional(),
      goals: z.string().optional(),
    }),
    action: orgDesignerAction,
    thinkingLabelAr: 'تصميم الهيكل التنظيمي الأمثل...',
  },

  // ═══════════════════════════════════════════════════════════════════
  // موظفو قسم الدعم — Support Department Employees
  // ═══════════════════════════════════════════════════════════════════

  'csat-analyst': {
    name: 'csat-analyst',
    displayNameAr: 'محلّل رضا العملاء',
    description: 'يحلل CSAT وNPS ويستخلص أنماط رضا العملاء لتحسين التجربة.',
    intent: 'CSAT_ANALYST',
    stage: 'tool',
    graphNode: 'csat_analyst_node',
    preferredModel: 'FLASH',
    capabilities: ['csat_analysis', 'nps', 'sentiment_analysis', 'churn_prediction'],
    allowedTools: ['support.csat'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({
      task: z.enum(['analyze-feedback', 'nps-report', 'churn-analysis', 'journey-map', 'voc-summary']),
      feedbackData: z.array(z.object({
        text: z.string(),
        rating: z.number().optional(),
        channel: z.string().optional(),
        date: z.string().optional(),
      })).optional(),
      npsScore: z.number().optional(),
      churnData: z.record(z.string(), z.any()).optional(),
      period: z.string().optional(),
    }),
    action: csatAnalystAction,
    thinkingLabelAr: 'تحليل رضا العملاء واكتشاف الأنماط...',
  },

  'knowledge-builder': {
    name: 'knowledge-builder',
    displayNameAr: 'بنّاء قاعدة المعرفة',
    description: 'يبني FAQs وأدلة المستخدم وسكريبتات Chatbot للجمهور العربي.',
    intent: 'KNOWLEDGE_BUILDER',
    stage: 'tool',
    graphNode: 'knowledge_builder_node',
    preferredModel: 'FLASH',
    capabilities: ['knowledge_base', 'faq', 'user_guides', 'chatbot_scripts'],
    allowedTools: ['support.knowledge'],
    softCostBudgetUsd: 0.02,
    inputSchema: z.object({
      task: z.enum(['write-faq', 'create-guide', 'convert-ticket', 'chatbot-script', 'troubleshooting']),
      topic: z.string(),
      sourceContent: z.string().optional(),
      audience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      format: z.enum(['article', 'step-by-step', 'faq', 'video-script']).optional(),
    }),
    action: knowledgeBuilderAction,
    thinkingLabelAr: 'بناء محتوى قاعدة المعرفة...',
  },

  'ticket-manager': {
    name: 'ticket-manager',
    displayNameAr: 'مدير تذاكر الدعم',
    description: 'يصنّف تذاكر الدعم ويصيغ ردوداً احترافية ويتتبع SLAs.',
    intent: 'TICKET_MANAGER',
    stage: 'tool',
    graphNode: 'ticket_manager_node',
    preferredModel: 'FLASH',
    capabilities: ['ticket_classification', 'response_drafting', 'sla_tracking', 'routing'],
    allowedTools: ['support.ticket'],
    softCostBudgetUsd: 0.02,
    inputSchema: z.object({
      task: z.enum(['classify-ticket', 'draft-response', 'escalation-decision', 'sla-report', 'trend-analysis']),
      ticketContent: z.string().optional(),
      ticketCategory: z.string().optional(),
      customerHistory: z.string().optional(),
      urgency: z.string().optional(),
    }),
    action: ticketManagerAction,
    thinkingLabelAr: 'معالجة تذكرة الدعم بكفاءة...',
  },

  // ═══ وكلاء الرفاه والعقود واكتشاف العملاء وصحة الفريق ═══

  'wellbeing-coach': {
    name: 'wellbeing-coach',
    displayNameAr: 'مدرب الرفاه النفسي',
    description: 'يقيّم الصحة النفسية لرائد الأعمال ويقدّم توصيات عملية مبنية على CBT وعلم النفس الإيجابي.',
    intent: 'WELLBEING_COACH',
    stage: 'tool',
    graphNode: 'wellbeing_coach_node',
    preferredModel: 'FLASH',
    capabilities: ['wellbeing_assessment', 'mental_health', 'resilience', 'burnout_prevention'],
    allowedTools: ['wellbeing.assessment', 'wellbeing.recommendations'],
    softCostBudgetUsd: 0.02,
    inputSchema: z.object({
      scores: z.record(z.string(), z.number()),
      context: z.string().optional(),
      mode: z.enum(['full', 'checkin']).optional(),
    }),
    action: wellbeingCoachAction as (input: unknown) => Promise<string>,
    thinkingLabelAr: 'يحلل صحتك النفسية ويُعدّ توصيات مخصّصة...',
  },

  'contract-reviewer': {
    name: 'contract-reviewer',
    displayNameAr: 'مراجع العقود',
    description: 'يحلل العقود التجارية ويستخرج البنود الخطرة والناقصة في إطار القانون المصري.',
    intent: 'CONTRACT_REVIEWER',
    stage: 'tool',
    graphNode: 'contract_reviewer_node',
    preferredModel: 'PRO',
    capabilities: ['contract_analysis', 'risk_detection', 'egypt_law', 'clause_review'],
    allowedTools: ['legal.contract_review', 'legal.egypt_law'],
    softCostBudgetUsd: 0.08,
    inputSchema: z.object({
      contractText: z.string(),
      contractType: z.string().optional(),
      partyRole: z.string().optional(),
      specificConcerns: z.string().optional(),
    }),
    action: contractReviewerAction as (input: unknown) => Promise<string>,
    thinkingLabelAr: 'يقرأ بنود العقد ويستخرج المخاطر والثغرات...',
  },

  'customer-discovery': {
    name: 'customer-discovery',
    displayNameAr: 'خبير اكتشاف العملاء',
    description: 'يطبّق Mom Test methodology لاختبار فرضيات الستارت أب وتوليد أسئلة مقابلات العملاء.',
    intent: 'CUSTOMER_DISCOVERY',
    stage: 'idea',
    graphNode: 'customer_discovery_node',
    preferredModel: 'PRO',
    capabilities: ['mom_test', 'hypothesis_testing', 'interview_design', 'customer_segments'],
    allowedTools: ['discovery.mom_test', 'discovery.hypothesis'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({
      businessIdea: z.string(),
      targetSegment: z.string().optional(),
      hypotheses: z.array(z.string()),
      interviewAnswers: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    }),
    action: ((input: unknown) => customerDiscoveryAction(input as Parameters<typeof customerDiscoveryAction>[0]).then(r => r.analysisText)) as (input: unknown) => Promise<string>,
    thinkingLabelAr: 'يصمّم أسئلة اكتشاف العملاء بأسلوب Mom Test...',
  },

  'cofounder-coach': {
    name: 'cofounder-coach',
    displayNameAr: 'مستشار فريق المؤسسين',
    description: 'يقيّم ديناميكيات فريق المؤسسين ويشخّص نقاط الخطر قبل أن تتحول لنزاعات مدمّرة.',
    intent: 'COFOUNDER_COACH',
    stage: 'startup',
    graphNode: 'cofounder_coach_node',
    preferredModel: 'PRO',
    capabilities: ['team_dynamics', 'conflict_prevention', 'founder_agreement', 'equity_structure'],
    allowedTools: ['cofounder.health', 'cofounder.dynamics'],
    softCostBudgetUsd: 0.07,
    inputSchema: z.object({
      founders: z.array(z.object({
        name: z.string(),
        role: z.string(),
        equity: z.number(),
        answers: z.record(z.string(), z.number()),
      })),
      companyStage: z.string(),
      specificChallenges: z.string().optional(),
    }),
    action: cofounderHealthCheckAction as (input: unknown) => Promise<string>,
    thinkingLabelAr: 'يحلل ديناميكيات الفريق ويشخّص نقاط الخطر...',
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
