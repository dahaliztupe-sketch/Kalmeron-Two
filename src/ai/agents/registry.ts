// @ts-nocheck
import { z } from 'zod';
import { validateIdea } from '@/src/agents/idea-validator/agent';
// Import existing agents/actions as necessary...
// Restoring needed imports (simplified for edit)
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
  "TaskCreate": {
    name: "TaskCreate",
    description: "إنشاء مهمة جديدة",
    inputSchema: z.object({
      name: z.string(),
      description: z.string(),
      dueDate: z.string().optional(),
      assignee: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'critical']),
    }),
  },
  "TaskGet": {
    name: "TaskGet",
    description: "جلب تفاصيل مهمة بواسطة taskId",
    inputSchema: z.object({ taskId: z.string() }),
  },
  "TaskUpdate": {
    name: "TaskUpdate",
    description: "تحديث حالة مهمة",
    inputSchema: z.object({
      taskId: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'awaiting_human']),
    }),
  },
  "TaskList": {
    name: "TaskList",
    description: "جلب قائمة بالمهام",
    inputSchema: z.object({
      assignee: z.string().optional(),
      status: z.string().optional(),
    }),
  },
  "TaskDelegate": {
    name: "TaskDelegate",
    description: "إعادة تفويض مهمة",
    inputSchema: z.object({
      taskId: z.string(),
      newAssignee: z.string(),
    }),
  },
};

export const AgentRegistry = {
  "idea-validator": {
    name: "idea-validator",
    description: "متخصص في تحليل أفكار المشاريع الريادية وتقديم تقارير SWOT وتقييم الجدوى.",
    inputSchema: z.object({ idea: z.string() }),
    action: validateIdea,
  },
  "legal-guide": {
    name: "legal-guide",
    description: "مرشد قانوني متخصص في التشريعات المصرية للشركات الناشئة",
    inputSchema: z.object({ query: z.string() }),
    action: legalGuideAction,
  },
  "code-interpreter": {
    name: "code-interpreter",
    description: "متخصص في تنفيذ الأكواد وتحليل الملفات (Excel, CSV, JSON)",
    inputSchema: z.object({
      task: z.enum(['execute', 'analyze']),
      code: z.string().optional(),
      fileUrl: z.string().optional(),
      userId: z.string(),
    }),
    action: codeInterpreterAgent,
  },
  "plan-builder": {
    name: "plan-builder",
    description: "بناء خطة العمل الاستراتيجية.",
    inputSchema: z.object({ prompt: z.string() }),
    action: buildBusinessPlanStream, // Note: Need to handle stream type
  },
  "mistake-shield": {
    name: "mistake-shield",
    description: "حماية رائد الأعمال من الأخطاء من خلال تقديم تحذيرات استباقية.",
    inputSchema: z.object({ stage: z.string(), content: z.string() }),
    action: getProactiveWarnings,
  },
  "success-museum": {
    name: "success-museum",
    description: "تحليل قصص نجاح الشركات.",
    inputSchema: z.object({ company: z.string(), context: z.string() }),
    action: analyzeCompany,
  },
  "opportunity-radar": {
    name: "opportunity-radar",
    description: "البحث عن فرص تمويل ومسابقات.",
    inputSchema: z.object({ industry: z.string(), stage: z.string(), location: z.string() }),
    action: getPersonalizedOpportunities,
  },
  "cfo-agent": {
    name: "cfo-agent",
    description: "متخصص في النمذجة المالية، تحليل السيناريوهات، التنبؤ بالتدفق النقدي، وتقييم الاستثمارات",
    inputSchema: z.object({
      task: z.enum(["build-model", "analyze-scenario", "forecast-cashflow", "evaluate-investment", "stress-test"]),
      parameters: z.record(z.any())
    }),
    action: cfoAgentAction,
  },
  "persona-generator": {
    name: "persona-generator",
    description: "يولد شخصيات افتراضية واقعية بناءً على وصف السوق المستهدف",
    inputSchema: z.object({ marketDescription: z.string(), count: z.number() }),
    action: generatePersonas,
  },
  "interview-simulator": {
    name: "interview-simulator",
    description: "يحاكي مقابلات اكتشاف العملاء مع شخصيات افتراضية",
    inputSchema: z.object({ ideaDescription: z.string(), personas: z.array(z.any()), questions: z.array(z.string()) }),
    action: simulateFocusGroup,
  },
  "insights-analyzer": {
    name: "insights-analyzer",
    description: "يحلل نتائج محاكاة السوق ويستخلص رؤى قابلة للتنفيذ",
    inputSchema: z.object({ ideaDescription: z.string(), results: z.array(z.any()) }),
    action: analyzeInterviewResults,
  }
};
