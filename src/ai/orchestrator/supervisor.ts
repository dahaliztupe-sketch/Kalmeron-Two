// @ts-nocheck
import { StateGraph, Annotation, MemorySaver, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { executeSalesCrew } from '@/src/ai/crews/sales-crew/workflow';

// حالة الرسم البياني للمشرف
export const SupervisorState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: (a, b) => a.concat(b) }),
  isGuest: Annotation<boolean>(),
  messageCount: Annotation<number>(),
  uiContext: Annotation<any>(), // غلاف السياق (Context Envelope)
  intent: Annotation<string>(),
  nextStep: Annotation<string>(),
});

// 1. عقدة الموجه الذكي (Smart Router / Supervisor)
async function routerNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const isGuest = state.isGuest;
  
  // حارس الضيف (Guest Guard)
  if (isGuest && (state.messageCount || 0) >= 4) {
    return {
      messages: [new AIMessage("يبدو أنك جاد في مشروعك! 🚀\nلقد وصلت للحد الأقصى للمحادثات في وضع الضيف. لماذا لا تنشئ حسابًا مجانيًا لتتمكن من حفظ هذا التحليل، والحصول على خطة عمل كاملة، واستخدام أدواتنا السحرية؟")],
      nextStep: '__end__'
    };
  }

  // تصنيف النية (Intent Classification) باستخدام نموذج سريع (Cost optimization mapping)
  const { text: intent } = await generateText({
    model: MODELS.FLASH, // Using Flash Lite implicitly based on AI Vercel mapping
    prompt: `صنف نية هذه الرسالة إلى إحدى الفئات التالية فقط: "فكرة" (تحليل أو SWOT)، "خطة" (بناء خطة)، "مالية" (تحليل إيرادات، تسعير)، "تسويق" (بحث عملاء، حملات), "دعم" (مساعدة حول استخدام المنصة، أسئلة شائعة)، "أخرى" (الردود العامة والترحيب).
    رسالة المستخدم: ${lastMessage}
    سياق الواجهة (إن وجد): ${JSON.stringify(state.uiContext)}
    الرد (كلمة واحدة فقط):`,
  });

  let nextStep = 'receptionist';
  if (intent.includes('أخرى')) nextStep = 'receptionist';
  else if (intent.includes('فكرة')) nextStep = 'idea_agent';
  else if (intent.includes('خطة')) nextStep = isGuest ? 'guest_blocked' : 'plan_agent';
  else if (intent.includes('مالية')) nextStep = isGuest ? 'guest_blocked' : 'cfo_agent';
  else if (intent.includes('تسويق')) nextStep = isGuest ? 'guest_blocked' : 'sales_crew';
  else if (intent.includes('دعم')) nextStep = 'support_agent';
  else nextStep = 'receptionist';

  return { intent, nextStep };
}

// 2. عقدة وكيل الاستقبال العام (Receptionist)
async function receptionistNode(state: typeof SupervisorState.State) {
  const isGuest = state.isGuest;
  const sysPrompt = isGuest 
    ? "أنت كلميرون، شريك افتراضي. المستخدم الآن 'ضيف'. قدم إجابات عامة ومفيدة وحمسه للتسجيل."
    : "أنت كلميرون، المساعد الذكي. قدم مساعدة مباشرة ووديّة.";
    
  const { text } = await generateText({
    model: MODELS.FLASH,
    system: sysPrompt,
    prompt: state.messages.map(m => m.content).join('\n'),
  });

  return { messages: [new AIMessage(text)] };
}

// 3. عقدة رفض الصلاحية للضيف
async function guestBlockedNode(state: typeof SupervisorState.State) {
  return {
    messages: [new AIMessage("عذراً! هذه الميزة المتقدمة (كالخطط التفصيلية أو إطلاق حملات مبيعات) تتطلب حساباً. سجل الآن للوصول الكامل! 🌟")]
  };
}

// Mock Idea Agent
async function ideaAgentNode(state: typeof SupervisorState.State) {
  const { text } = await generateText({
    model: MODELS.PRO_PREVIEW,
    system: "أنت خبير تقييم أفكار. قدم تحليل SWOT.",
    prompt: state.messages[state.messages.length - 1].content as string
  });
  return { messages: [new AIMessage(text)] };
}

// Sales Crew Node (Mastra Orchestrator Integration)
async function salesCrewNode(state: typeof SupervisorState.State) {
  // We extract parameters roughly to pass to our workflow
  // In a real scenario, we'd use function calling to get precise inputs
  const lastUserMsg = state.messages[state.messages.length - 1].content as string;
  try {
     const results = await executeSalesCrew({ 
        targetIndustry: "General Tech", // Mock fallback
        targetRole: "Founders",
        valueProposition: lastUserMsg
     });
     // Summarize results
     const report = `تم تفعيل فريق المبيعات. النتائج الأولية:\nمقترح العملاء المحتملين: ${results.find_prospects?.prospects?.substring(0, 50)}...\nنسخة التواصل: ${results.write_content?.outreachContent?.substring(0, 50)}...`;
     return { messages: [new AIMessage(report)] };
  } catch(e) {
     return { messages: [new AIMessage("جاري حالياً تجهيز فريق وكلاء التسويق الخاص بك للعمل.")] };
  }
}

// Support Agent Node (Fallback for text based support if not using Live Audio)
async function supportAgentNode(state: typeof SupervisorState.State) {
  const { text } = await generateText({
    model: MODELS.FLASH,
    system: "أنت وكيل دعم فني للمنصة. ساعد العميل وأخبره أنه يمكنه استخدام زر الدعم الفوري الصوتي أيضاً.",
    prompt: state.messages[state.messages.length - 1].content as string
  });
  return { messages: [new AIMessage(text)] };
}


// توجيه ديناميكي للخطوة التالية
function supervisorRouter(state: typeof SupervisorState.State) {
  return state.nextStep === '__end__' ? END : state.nextStep;
}

// بناء مخطط المشرف
export const supervisorWorkflow = new StateGraph(SupervisorState)
  .addNode('router', routerNode)
  .addNode('receptionist', receptionistNode)
  .addNode('guest_blocked', guestBlockedNode)
  .addNode('idea_agent', ideaAgentNode)
  .addNode('sales_crew', salesCrewNode)
  .addNode('support_agent', supportAgentNode)
  // ... (cfo_agent, plan_agent placeholders etc.)
  
  .addEdge('__start__', 'router')
  .addConditionalEdges('router', supervisorRouter)
  
  .addEdge('receptionist', END)
  .addEdge('guest_blocked', END)
  .addEdge('idea_agent', END)
  .addEdge('sales_crew', END)
  .addEdge('support_agent', END);

const checkpointer = new MemorySaver();

export const intelligentOrchestrator = supervisorWorkflow.compile({
  checkpointer,
});
