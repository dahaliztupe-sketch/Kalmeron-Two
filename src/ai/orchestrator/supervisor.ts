// @ts-nocheck
import { StateGraph, Annotation, MemorySaver, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';

// import { agentOS } from '@/src/lib/governance/agent-os';

export const SupervisorState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: (a, b) => a.concat(b) }),
  isGuest: Annotation<boolean>(),
  messageCount: Annotation<number>(),
  uiContext: Annotation<any>(),
  intent: Annotation<string>(),
  nextStep: Annotation<string>(),
});

async function routerNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const isGuest = state.isGuest;
  
  if (isGuest && (state.messageCount || 0) >= 4) {
    return { messages: [new AIMessage("حسابك الخاص قيد الانتظار!")], nextStep: '__end__' };
  }

  const { text: intent } = await generateText({
    model: MODELS.FLASH, 
    prompt: `صنف نية هذه الرسالة إلى إحدى الفئات التالية فقط: "فكرة"، "خطة"، "مالية"، "تسويق"، "إمداد"، "توظيف"، "دعم"، "عقار" (تحليل عقار، صفقات)، "مراقبة" (أمان، سجلات، لوحة تحكم، امتثال)، "أخرى".
    رسالة المستخدم: ${lastMessage}
    سياق الواجهة: ${JSON.stringify(state.uiContext)}
    الرد (كلمة واحدة فقط):`,
  });

  let nextStep = 'receptionist';
  if (intent.includes('أخرى')) nextStep = 'receptionist';
  else if (intent.includes('عقار')) nextStep = 'real_estate_node';
  else if (intent.includes('مراقبة')) nextStep = 'admin_node';
  else nextStep = 'receptionist';

  return { intent, nextStep };
}

// ... Node mappings
async function dummyNode(state: typeof SupervisorState.State) { return { messages: [new AIMessage("تم تفعيل الوكيل.")] }; }

// Example representation of governance wrapped node
async function realEstateNode(state: typeof SupervisorState.State) {
  // In production: agentOS.enforce({agent: 'real_estate_analyzer', action: 'invoke'}) 
  return { messages: [new AIMessage("أرى أنك تفكر في العقارات الاستثمارية. هل لديك مدن محددة لنحسب الـ ROI وقاعدة الـ1٪؟")] };
}
async function adminNode(state: typeof SupervisorState.State) {
  return { messages: [new AIMessage("فريق وكلاء المشرفين (الأمن، تجربة المستخدم، الامتثال) يراقبون استقرار النظام الآن.")] };
}

function supervisorRouter(state: typeof SupervisorState.State) {
  return state.nextStep === '__end__' ? END : state.nextStep;
}

export const supervisorWorkflow = new StateGraph(SupervisorState)
  .addNode('router', routerNode)
  .addNode('receptionist', dummyNode)
  .addNode('real_estate_node', realEstateNode)
  .addNode('admin_node', adminNode)
  .addEdge('__start__', 'router')
  .addConditionalEdges('router', supervisorRouter)
  .addEdge('receptionist', END)
  .addEdge('real_estate_node', END)
  .addEdge('admin_node', END);

const checkpointer = new MemorySaver();
export const intelligentOrchestrator = supervisorWorkflow.compile({ checkpointer });
