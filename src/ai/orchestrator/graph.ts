// @ts-nocheck
import { StateGraph, Annotation, MemorySaver } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { AgentRegistry } from '../agents/registry';

// تعريف حالة الوكيل
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => a.concat(b),
  }),
  task: Annotation<string>(),
  currentAgent: Annotation<string>(),
  intermediateResults: Annotation<Record<string, any>>(),
  complexity: Annotation<'simple' | 'medium' | 'complex'>(),
});

// عقدة التوجيه - تحدد أي وكيل يجب استدعاؤه
async function routerNode(state: typeof AgentState.State) {
  const task = state.task?.toLowerCase() || '';

  // تحديد التعقيد
  let complexity: 'simple' | 'medium' | 'complex' = 'medium';
  const complexKeywords = ['تحليل', 'خطة', 'استراتيجية', 'مالي', 'قانوني'];
  const simpleKeywords = ['سؤال', 'ما هو', 'عرف', 'اشرح'];

  if (complexKeywords.some(k => task.includes(k))) complexity = 'complex';
  else if (simpleKeywords.some(k => task.includes(k))) complexity = 'simple';

  // تحديد الوكيل المناسب
  let targetAgent = 'ideaValidator';
  if (task.includes('فكرة') || task.includes('تحليل')) targetAgent = 'ideaValidator';
  else if (task.includes('خطة') || task.includes('عمل')) targetAgent = 'planBuilder';
  else if (task.includes('مالي') || task.includes('تكلفة')) targetAgent = 'cfoAgent';
  else if (task.includes('قانوني') || task.includes('تأسيس')) targetAgent = 'legalGuide';
  else if (task.includes('تسويق')) targetAgent = 'marketingAgent';
  else if (task.includes('تحليل ملف') || task.includes('تشغيل كود') || task.includes('excel')) targetAgent = 'codeInterpreter';

  return {
    currentAgent: targetAgent,
    complexity,
    intermediateResults: state.intermediateResults,
  };
}

// عقدة التوليف - تجمع نتائج الوكلاء المتعددين
async function synthesizerNode(state: typeof AgentState.State) {
  const results = state.intermediateResults;
  const messages = state.messages;

  const summary = Object.entries(results || {})
    .map(([agent, result]) => `[${agent}]: ${result}`)
    .join('\n\n');

  return {
    messages: [...(messages || []), { role: 'assistant', content: summary }],
  };
}

// عقدة مفسّر الأكواد
const codeInterpreterNode = async (state: typeof AgentState.State) => {
  const result = await AgentRegistry['code-interpreter'].action.execute({
    task: state.task.includes('تحليل') ? 'analyze' : 'execute',
    code: state.task,
    userId: 'user-123',
  });
  return { intermediateResults: { ...state.intermediateResults, codeInterpreter: result } };
};

// عقد وهمية للوكلاء الآخرين (يُستبدل بالتنفيذ الفعلي لاحقاً)
const ideaValidatorNode = async (state: typeof AgentState.State) => ({
  intermediateResults: { ...state.intermediateResults, ideaValidator: 'تحليل الفكرة جارٍ...' },
});
const planBuilderNode = async (state: typeof AgentState.State) => ({
  intermediateResults: { ...state.intermediateResults, planBuilder: 'بناء الخطة جارٍ...' },
});
const cfoAgentNode = async (state: typeof AgentState.State) => ({
  intermediateResults: { ...state.intermediateResults, cfoAgent: 'التحليل المالي جارٍ...' },
});
const legalGuideNode = async (state: typeof AgentState.State) => ({
  intermediateResults: { ...state.intermediateResults, legalGuide: 'المشورة القانونية جارية...' },
});
const marketingAgentNode = async (state: typeof AgentState.State) => ({
  intermediateResults: { ...state.intermediateResults, marketingAgent: 'التحليل التسويقي جارٍ...' },
});

const workflow = new StateGraph(AgentState)
  .addNode('router', routerNode)
  .addNode('ideaValidator', ideaValidatorNode)
  .addNode('planBuilder', planBuilderNode)
  .addNode('cfoAgent', cfoAgentNode)
  .addNode('legalGuide', legalGuideNode)
  .addNode('codeInterpreter', codeInterpreterNode)
  .addNode('marketingAgent', marketingAgentNode)
  .addNode('synthesizer', synthesizerNode)
  .addEdge('__start__', 'router')
  .addConditionalEdges('router', (state: any) => state.currentAgent)
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
