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
    | 'TOOL';
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
  action: (...args: any[]) => Promise<any>;
  /** عنوان عربي قصير يظهر في ThoughtChain. */
  thinkingLabelAr?: string;
}

export const AgentRegistry: Record<string, AgentDefinition> = {
  'idea-validator': {
    name: 'idea-validator',
    displayNameAr: 'مُحلّل الأفكار',
    description: 'متخصص في تحليل أفكار المشاريع الريادية وتقديم تقارير SWOT وتقييم الجدوى للسوق المصري.',
    intent: 'IDEA_VALIDATOR',
    graphNode: 'idea_validator_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'rag', 'structured_output'],
    allowedTools: ['rag.search', 'web.search'],
    softCostBudgetUsd: 0.05,
    inputSchema: z.object({ idea: z.string() }),
    action: validateIdea,
    thinkingLabelAr: 'تقييم فكرتك من عدة زوايا...',
  },
  'plan-builder': {
    name: 'plan-builder',
    displayNameAr: 'بنّاء خطة العمل',
    description: 'يبني خطة عمل تفصيلية ودراسة جدوى مع توقعات مالية واقعية للسوق المصري.',
    intent: 'PLAN_BUILDER',
    graphNode: 'plan_builder_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'rag', 'streaming', 'structured_output'],
    allowedTools: ['rag.search', 'stream.text'],
    softCostBudgetUsd: 0.10,
    inputSchema: z.object({ prompt: z.string() }),
    action: buildBusinessPlanStream,
    thinkingLabelAr: 'بناء خطة العمل التفصيلية...',
  },
  'mistake-shield': {
    name: 'mistake-shield',
    displayNameAr: 'حارس الأخطاء',
    description: 'حماية رائد الأعمال من الأخطاء عبر تحذيرات استباقية مبنية على السياق والمرحلة.',
    intent: 'MISTAKE_SHIELD',
    graphNode: 'mistake_shield_node',
    preferredModel: 'FLASH',
    capabilities: ['rag', 'rules_engine'],
    allowedTools: ['rag.search'],
    softCostBudgetUsd: 0.02,
    inputSchema: z.object({ stage: z.string(), content: z.string() }),
    action: getProactiveWarnings,
    thinkingLabelAr: 'فحص الأخطاء القاتلة في السوق المصري...',
  },
  'success-museum': {
    name: 'success-museum',
    displayNameAr: 'متحف النجاح',
    description: 'تحليل قصص نجاح الشركات (مصرية وعالمية) واستخلاص الدروس القابلة للتطبيق.',
    intent: 'SUCCESS_MUSEUM',
    graphNode: 'success_museum_node',
    preferredModel: 'FLASH',
    capabilities: ['rag', 'structured_output', 'cache'],
    allowedTools: ['rag.search'],
    softCostBudgetUsd: 0.03,
    inputSchema: z.object({ company: z.string(), context: z.string().optional() }),
    action: analyzeCompany,
    thinkingLabelAr: 'استدعاء قصص نجاح مشابهة...',
  },
  'opportunity-radar': {
    name: 'opportunity-radar',
    displayNameAr: 'رادار الفرص',
    description: 'البحث عن فرص تمويل، مسابقات، هاكاثونات، وحاضنات أعمال مناسبة لقطاع المستخدم.',
    intent: 'OPPORTUNITY_RADAR',
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
  'cfo-agent': {
    name: 'cfo-agent',
    displayNameAr: 'المدير المالي',
    description: 'النمذجة المالية، تحليل السيناريوهات، التنبؤ بالتدفق النقدي، وتقييم الاستثمارات.',
    intent: 'CFO_AGENT',
    graphNode: 'cfo_agent_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'tools', 'structured_output'],
    allowedTools: ['finance.calc', 'rag.search'],
    softCostBudgetUsd: 0.08,
    inputSchema: z.object({
      task: z.enum(['build-model', 'analyze-scenario', 'forecast-cashflow', 'evaluate-investment', 'stress-test']),
      parameters: z.record(z.any()),
    }),
    action: cfoAgentAction,
    thinkingLabelAr: 'إجراء تحليل مالي تفصيلي...',
  },
  'legal-guide': {
    name: 'legal-guide',
    displayNameAr: 'المرشد القانوني',
    description: 'مرشد قانوني متخصص في التشريعات المصرية للشركات الناشئة (تأسيس، عقود، ضرائب).',
    intent: 'LEGAL_GUIDE',
    graphNode: 'legal_guide_node',
    preferredModel: 'PRO',
    capabilities: ['rag', 'knowledge_base'],
    allowedTools: ['rag.search', 'legal.search'],
    softCostBudgetUsd: 0.06,
    inputSchema: z.object({ query: z.string() }),
    action: legalGuideAction,
    thinkingLabelAr: 'مراجعة الجوانب القانونية والتنظيمية...',
  },
  'real-estate': {
    name: 'real-estate',
    displayNameAr: 'خبير العقارات',
    description: 'خبير عقارات استثمارية مصرية: حساب ROI، تقييم الصفقات، تحليل أسواق المدن.',
    intent: 'REAL_ESTATE',
    graphNode: 'real_estate_node',
    preferredModel: 'PRO',
    capabilities: ['analysis', 'tools'],
    allowedTools: ['finance.calc'],
    softCostBudgetUsd: 0.05,
    inputSchema: z.object({ query: z.string() }),
    action: async () => { /* handled inline by supervisor */ },
    thinkingLabelAr: 'بحث في بيانات السوق العقاري...',
  },
  'general-chat': {
    name: 'general-chat',
    displayNameAr: 'كلميرون العام',
    description: 'مستشار عام يجيب على الأسئلة المتفرقة ويوجّه المستخدم.',
    intent: 'GENERAL_CHAT',
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
    graphNode: 'admin_node',
    preferredModel: 'LITE',
    capabilities: ['routing'],
    allowedTools: [],
    softCostBudgetUsd: 0.001,
    inputSchema: z.object({}),
    action: async () => ({ redirect: '/admin' }),
    thinkingLabelAr: 'تنفيذ مهمة إدارية...',
  },

  // ============= Tool agents (لا تظهر في القائمة الافتراضية للموجِّه) =============
  'persona-generator': {
    name: 'persona-generator',
    displayNameAr: 'مولّد الشخصيات',
    description: 'يولّد شخصيات افتراضية واقعية بناءً على وصف السوق المستهدف.',
    intent: 'TOOL',
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

/** ابحث عن إيجنت بواسطة intent (مفيد للـ supervisor). */
export function findAgentByIntent(intent: string): AgentDefinition | undefined {
  return Object.values(AgentRegistry).find(a => a.intent === intent);
}

/** اللصاقة العربية للحالة "يفكر". */
export function getThinkingLabelForNode(graphNode: string): string | undefined {
  return Object.values(AgentRegistry).find(a => a.graphNode === graphNode)?.thinkingLabelAr;
}
