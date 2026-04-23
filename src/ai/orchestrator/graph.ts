// @ts-nocheck
import { StateGraph, Annotation, MemorySaver } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { AgentRegistry } from '../agents/registry';
import { withLearnedSkills } from '@/src/lib/observability/agent-instrumentation';
import { updateSkillFeedback } from '@/src/lib/learning/loop';
import { isFeedbackRecorded, markFeedbackRecorded } from '@/src/lib/learning/context';
import { launchStartup } from '@/src/ai/launchpad/pipeline';
import { detectCollaborationOpportunity } from '@/src/ai/orchestrator/virtual-meeting';
import { receiveMessage, type Channel } from '@/src/lib/integrations/omnichannel';

/**
 * إدخال موحّد للمنسق العام يوجّه الطلب حسب نوعه:
 *  - إن احتوى على "إطلاق المشروع" → مسار Launchpad الكامل.
 *  - إن وُرد من قناة خارجية (واتساب/تيليجرام/بريد) → يمرّ عبر بوابة القنوات أولاً.
 *  - غير ذلك → يمرّ عبر StateGraph الافتراضي.
 */
export async function routeIncoming(args: {
  task: string;
  workspaceId: string;
  channel?: Channel;
  senderId?: string;
}) {
  if (args.channel && args.senderId) {
    await receiveMessage(args.channel, { text: args.task }, args.senderId);
  }
  const t = (args.task || '').toLowerCase();
  if (t.includes('إطلاق المشروع') || t.includes('launch startup')) {
    return { kind: 'launch', result: await launchStartup({ idea: args.task, workspaceId: args.workspaceId }) };
  }
  // Periodically surface collaboration opportunities (best-effort).
  detectCollaborationOpportunity(args.workspaceId).catch(() => {});
  return { kind: 'graph', pending: true };
}

const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => a.concat(b),
  }),
  task: Annotation<string>(),
  currentAgent: Annotation<string>(),
  intermediateResults: Annotation<Record<string, any>>(),
  complexity: Annotation<'simple' | 'medium' | 'complex'>(),
  // مساحة العمل الحالية — مطلوبة لعزل المهارات المُتعلَّمة بين المستأجرين.
  workspaceId: Annotation<string>(),
  // مهارات مُتعلَّمة محقونة بعد توجيه الوكيل
  learnedSkillsAddon: Annotation<string>(),
  learnedSkillIds: Annotation<string[]>(),
});

async function routerNode(state: typeof AgentState.State) {
  const task = state.task?.toLowerCase() || '';

  let complexity: 'simple' | 'medium' | 'complex' = 'medium';
  const complexKeywords = ['تحليل', 'خطة', 'استراتيجية', 'مالي', 'قانوني'];
  const simpleKeywords = ['سؤال', 'ما هو', 'عرف', 'اشرح'];

  if (complexKeywords.some(k => task.includes(k))) complexity = 'complex';
  else if (simpleKeywords.some(k => task.includes(k))) complexity = 'simple';

  let targetAgent = 'ideaValidator';
  if (task.includes('فكرة') || task.includes('تحليل')) targetAgent = 'ideaValidator';
  else if (task.includes('خطة') || task.includes('عمل')) targetAgent = 'planBuilder';
  else if (task.includes('مالي') || task.includes('تكلفة')) targetAgent = 'cfoAgent';
  else if (task.includes('قانوني') || task.includes('تأسيس')) targetAgent = 'legalGuide';
  else if (task.includes('تسويق')) targetAgent = 'marketingAgent';
  else if (task.includes('تحليل ملف') || task.includes('تشغيل كود') || task.includes('excel')) targetAgent = 'codeInterpreter';

  return { currentAgent: targetAgent, complexity };
}

/**
 * يحمّل المهارات المُتعلَّمة الخاصة بالوكيل المختار بعد قرار التوجيه.
 * يحقن الإضافة في الحالة لتستهلكها العقد التالية كـ system context.
 */
async function loadSkillsForAgentNode(state: typeof AgentState.State) {
  const task = state.task || '';
  const agent = state.currentAgent || 'orchestrator';
  const wid = state.workspaceId || '';
  if (!task || !wid) return {};
  try {
    const { skills, promptAddon } = await withLearnedSkills(wid, agent, task, 5);
    return {
      learnedSkillsAddon: promptAddon || '',
      learnedSkillIds: skills.map((s) => s.id!).filter(Boolean),
    };
  } catch {
    return {};
  }
}

async function synthesizerNode(state: typeof AgentState.State) {
  const results = state.intermediateResults;
  const messages = state.messages;

  // تغذية راجعة دقيقة: نتفقّد كل نتيجة لمعرفة فشلها الحقيقي بدلاً من
  // وسم النجاح بشكل أعمى. الكلمات المفتاحية تغطي رسائل الخطأ بالعربية
  // والإنجليزية على حدٍّ سواء؛ السبب يُمرَّر إلى updateSkillFeedback لكي
  // يظهر في حقل lastFailureReason للمراجعة لاحقاً.
  // استبعد المعرّفات التي سجّل instrumentAgent تغذيتها الراجعة بالفعل
  // لتفادي العدّ المضاعف عندما يمرّ الاستدعاء بكلا المسارين.
  const ids = (state.learnedSkillIds || []).filter((id) => !isFeedbackRecorded(id));
  if (ids.length && state.workspaceId) {
    const values = Object.values(state.intermediateResults || {});
    const joined = values.map((v) => String(v ?? '')).join(' \n ').toLowerCase();
    const failurePatterns = [
      'error', 'failed', 'failure', 'exception',
      'فشل', 'خطأ', 'تعذّر', 'تعذر', 'غير مدعوم'
    ];
    const matched = failurePatterns.find((p) => joined.includes(p));
    const success = !matched;
    void updateSkillFeedback(state.workspaceId, ids, {
      success,
      failureReason: success ? undefined : `synthesizer_detected:${matched}`,
    }).catch(() => {});
    markFeedbackRecorded(ids);
  }

  const summary = Object.entries(results || {})
    .map(([agent, result]) => `[${agent}]: ${result}`)
    .join('\n\n');

  return {
    messages: [...(messages || []), { role: 'assistant', content: summary }],
  };
}

const codeInterpreterNode = async (state: typeof AgentState.State) => {
  const result = await AgentRegistry['code-interpreter'].action.execute({
    task: state.task.includes('تحليل') ? 'analyze' : 'execute',
    code: state.task,
    userId: 'user-123',
    learnedSkills: state.learnedSkillsAddon || '',
  });
  return { intermediateResults: { ...state.intermediateResults, codeInterpreter: result } };
};

// عقد وهمية للوكلاء الآخرين — تستهلك سياق المهارات المُتعلَّمة في النص.
function withSkillContext(label: string) {
  return async (state: typeof AgentState.State) => {
    const ctx = state.learnedSkillsAddon ? `\n[سياق مهارات]${state.learnedSkillsAddon}` : '';
    return {
      intermediateResults: {
        ...state.intermediateResults,
        [label]: `${label}: قيد التنفيذ...${ctx}`,
      },
    };
  };
}

const ideaValidatorNode = withSkillContext('ideaValidator');
const planBuilderNode = withSkillContext('planBuilder');
const cfoAgentNode = withSkillContext('cfoAgent');
const legalGuideNode = withSkillContext('legalGuide');
const marketingAgentNode = withSkillContext('marketingAgent');

const workflow = new StateGraph(AgentState)
  .addNode('router', routerNode)
  .addNode('loadSkills', loadSkillsForAgentNode)
  .addNode('ideaValidator', ideaValidatorNode)
  .addNode('planBuilder', planBuilderNode)
  .addNode('cfoAgent', cfoAgentNode)
  .addNode('legalGuide', legalGuideNode)
  .addNode('codeInterpreter', codeInterpreterNode)
  .addNode('marketingAgent', marketingAgentNode)
  .addNode('synthesizer', synthesizerNode)
  .addEdge('__start__', 'router')
  .addEdge('router', 'loadSkills')
  .addConditionalEdges('loadSkills', (state: any) => state.currentAgent)
  .addEdge('ideaValidator', 'synthesizer')
  .addEdge('planBuilder', 'synthesizer')
  .addEdge('cfoAgent', 'synthesizer')
  .addEdge('legalGuide', 'synthesizer')
  .addEdge('codeInterpreter', 'synthesizer')
  .addEdge('marketingAgent', 'synthesizer')
  .addEdge('synthesizer', '__end__');

export const orchestrator = workflow.compile();

const checkpointer = new MemorySaver();

export const orchestratorWithCheckpoint = workflow.compile({
  checkpointer,
});
