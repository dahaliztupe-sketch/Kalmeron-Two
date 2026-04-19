// @ts-nocheck
import { StateGraph, Annotation, MemorySaver } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { crewToLangGraphNode } from '../adapters/crew-to-langgraph';
import { marketingCrew } from '../crews/prototypes/marketing-crew';

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
  
  return {
    currentAgent: targetAgent,
    complexity,
  };
}

// عقدة التوليف - تجمع نتائج الوكلاء المتعددين
async function synthesizerNode(state: typeof AgentState.State) {
  const results = state.intermediateResults;
  const messages = state.messages;
  
  // تجميع النتائج في رد واحد متماسك
  const summary = Object.entries(results || {})
    .map(([agent, result]) => `[${agent}]: ${result}`)
    .join('\n\n');
  
  return {
    messages: [...(messages || []), { role: 'assistant', content: summary }],
  };
}

// Mock other nodes
const ideaValidatorNode = async (state: typeof AgentState.State) => ({ intermediateResults: { ...state.intermediateResults, ideaValidator: "Idea validated." } });
const planBuilderNode = async (state: typeof AgentState.State) => ({ intermediateResults: { ...state.intermediateResults, planBuilder: "Plan built." } });
const cfoAgentNode = async (state: typeof AgentState.State) => ({ intermediateResults: { ...state.intermediateResults, cfoAgent: "CFO analysis done." } });
const legalGuideNode = async (state: typeof AgentState.State) => ({ intermediateResults: { ...state.intermediateResults, legalGuide: "Legal guide processed." } });

const marketingAgentNode = crewToLangGraphNode(marketingCrew, 'marketingAgent');

// بناء الرسم البياني
const workflow = new StateGraph(AgentState)
  .addNode('router', routerNode as any)
  .addNode('ideaValidator', ideaValidatorNode as any)
  .addNode('planBuilder', planBuilderNode as any)
  .addNode('cfoAgent', cfoAgentNode as any)
  .addNode('legalGuide', legalGuideNode as any)
  .addNode('marketingAgent', marketingAgentNode as any)
  .addNode('synthesizer', synthesizerNode as any)
  .addEdge('__start__', 'router')
  .addConditionalEdges('router', (state: any) => state.currentAgent)
  .addEdge('ideaValidator', 'synthesizer')
  .addEdge('planBuilder', 'synthesizer')
  .addEdge('cfoAgent', 'synthesizer')
  .addEdge('legalGuide', 'synthesizer')
  .addEdge('marketingAgent', 'synthesizer')
  .addEdge('synthesizer', '__end__');

export const orchestrator = workflow.compile();

const checkpointer = new MemorySaver();

export const orchestratorWithCheckpoint = workflow.compile({
  checkpointer,
});
