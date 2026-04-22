// @ts-nocheck
import { StateGraph, Annotation, MemorySaver, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { validateIdea } from '@/src/agents/idea-validator/agent';
import { buildBusinessPlanStream } from '@/src/agents/plan-builder/agent';
import { getProactiveWarnings } from '@/src/agents/mistake-shield/agent';
import { getPersonalizedOpportunities } from '@/src/agents/opportunity-radar/agent';
import { analyzeCompany } from '@/src/agents/success-museum/agent';
import { cfoAgentAction } from '@/src/ai/agents/cfo-agent/agent';
import { legalGuideAction } from '@/src/ai/agents/legal-guide/agent';

export const SupervisorState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: (a, b) => a.concat(b) }),
  isGuest: Annotation<boolean>(),
  messageCount: Annotation<number>(),
  uiContext: Annotation<any>(),
  intent: Annotation<string>(),
  nextStep: Annotation<string>(),
});

const INTENT_CLASSIFIER_PROMPT = `أنت المنسق الذكي لمنصة كلميرون تو. صنّف نية رسالة المستخدم إلى إحدى الفئات التالية فقط وأجب بالكلمة المفتاحية وحدها:

- IDEA_VALIDATOR: عندما يطلب تقييم فكرة مشروع أو تحليل SWOT أو دراسة الجدوى.
- PLAN_BUILDER: عندما يطلب خطة عمل أو Business Plan أو خطوات تنفيذية.
- MISTAKE_SHIELD: عندما يسأل عن أخطاء محتملة، تحذيرات، أو مخاطر.
- SUCCESS_MUSEUM: عندما يسأل عن قصص نجاح شركات أو كيف نجحت شركة معينة.
- OPPORTUNITY_RADAR: عندما يسأل عن منح، مسابقات، تمويل، أو هاكاثونات.
- CFO_AGENT: عندما يسأل عن نمذجة مالية، التدفق النقدي، أو توقعات مالية.
- LEGAL_GUIDE: عندما يسأل عن تأسيس شركة، عقود، أو تشريعات مصرية.
- REAL_ESTATE: عندما يسأل عن عقارات استثمارية أو حساب ROI أو صفقات عقارية.
- ADMIN: عندما يسأل عن مراقبة النظام، سجلات، أو لوحة الإدارة.
- GENERAL_CHAT: لأي سؤال عام أو دردشة لا تقع تحت التخصصات أعلاه.`;

async function routerNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;

  if (state.isGuest && (state.messageCount || 0) >= 4) {
    return {
      messages: [new AIMessage('انتهت رسائلك التجريبية المجانية. سجّل الدخول للاستمرار!')],
      nextStep: '__end__',
    };
  }

  const { text: intent } = await generateText({
    model: MODELS.LITE,
    system: INTENT_CLASSIFIER_PROMPT,
    prompt: `سياق الواجهة: ${JSON.stringify(state.uiContext || {})}
رسالة المستخدم: ${lastMessage}`,
  });

  const cleaned = intent.trim().toUpperCase();
  const validIntents = [
    'IDEA_VALIDATOR', 'PLAN_BUILDER', 'MISTAKE_SHIELD',
    'SUCCESS_MUSEUM', 'OPPORTUNITY_RADAR', 'CFO_AGENT',
    'LEGAL_GUIDE', 'REAL_ESTATE', 'ADMIN', 'GENERAL_CHAT',
  ];

  const matched = validIntents.find(i => cleaned.includes(i)) || 'GENERAL_CHAT';

  const stepMap: Record<string, string> = {
    IDEA_VALIDATOR: 'idea_validator_node',
    PLAN_BUILDER: 'plan_builder_node',
    MISTAKE_SHIELD: 'mistake_shield_node',
    SUCCESS_MUSEUM: 'success_museum_node',
    OPPORTUNITY_RADAR: 'opportunity_radar_node',
    CFO_AGENT: 'cfo_agent_node',
    LEGAL_GUIDE: 'legal_guide_node',
    REAL_ESTATE: 'real_estate_node',
    ADMIN: 'admin_node',
    GENERAL_CHAT: 'general_chat_node',
  };

  return { intent: matched, nextStep: stepMap[matched] };
}

async function ideaValidatorNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const result = await validateIdea(lastMessage);
    return { messages: [new AIMessage(result)] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ أثناء تحليل الفكرة. يرجى المحاولة مجدداً.')] };
  }
}

async function planBuilderNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const stream = await buildBusinessPlanStream(lastMessage, []);
    let fullText = '';
    for await (const chunk of stream.textStream) {
      fullText += chunk;
    }
    return { messages: [new AIMessage(fullText || 'جاري بناء خطة العمل...')] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ أثناء بناء خطة العمل. يرجى المحاولة مجدداً.')] };
  }
}

async function mistakeShieldNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const uiContext = state.uiContext || {};
  try {
    const result = await getProactiveWarnings(
      uiContext.stage || 'general',
      lastMessage
    );
    return { messages: [new AIMessage(result)] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ في وكيل حارس الأخطاء. يرجى المحاولة مجدداً.')] };
  }
}

async function successMuseumNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const companyMatch = lastMessage.match(/["«»""]([^"«»""]+)["«»""]/) ||
      lastMessage.match(/شركة\s+(\S+)/) ||
      lastMessage.match(/نجاح\s+(\S+)/);
    const companyName = companyMatch ? companyMatch[1] : lastMessage.slice(0, 50);
    const analysis = await analyzeCompany(companyName);
    const formatted = `## تحليل ${analysis.companyName}

**القطاع:** ${analysis.sector} | **التأسيس:** ${analysis.founded}

### نظرة عامة
${analysis.overview}

### عوامل النجاح الرئيسية
${analysis.successFactors.map((f: string) => `- ${f}`).join('\n')}

### دروس لرائد الأعمال المصري
${analysis.lessonsForEgyptianEntrepreneurs.map((l: string) => `- ${l}`).join('\n')}

### الخلاصة
${analysis.keyTakeaways}`;
    return { messages: [new AIMessage(formatted)] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ في تحليل قصة النجاح. يرجى المحاولة مجدداً.')] };
  }
}

async function opportunityRadarNode(state: typeof SupervisorState.State) {
  const uiContext = state.uiContext || {};
  try {
    const opportunities = await getPersonalizedOpportunities(
      uiContext.industry || 'تقنية',
      uiContext.stage || 'idea',
      uiContext.location || 'القاهرة'
    );
    const formatted = `## الفرص المتاحة لك الآن 🎯

${opportunities.map((opp: any, i: number) => `### ${i + 1}. ${opp.title}
**النوع:** ${opp.type} | **الجهة:** ${opp.organizer}
**الموعد النهائي:** ${opp.deadline} | **المكان:** ${opp.location}
${opp.description}
🔗 [التقديم الآن](${opp.link})
---`).join('\n')}`;
    return { messages: [new AIMessage(formatted)] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ في البحث عن الفرص. يرجى المحاولة مجدداً.')] };
  }
}

async function cfoAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const result = await cfoAgentAction({
      task: 'analyze-scenario',
      parameters: { description: lastMessage },
    });
    return { messages: [new AIMessage(result)] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ في وكيل المدير المالي. يرجى المحاولة مجدداً.')] };
  }
}

async function legalGuideNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const result = await legalGuideAction({ query: lastMessage });
    return { messages: [new AIMessage(result)] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ في المرشد القانوني. يرجى المحاولة مجدداً.')] };
  }
}

async function realEstateNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const { text } = await generateText({
    model: MODELS.PRO,
    system: `أنت خبير عقارات استثمارية في مصر. متخصص في حساب ROI، قاعدة الـ1٪، تقييم الصفقات، وتحليل الأسواق العقارية المصرية لعام 2026. استخدم المعطيات الواقعية وقدم تحليلاً دقيقاً بالأرقام.`,
    prompt: lastMessage,
  });
  return { messages: [new AIMessage(text)] };
}

async function adminNode(state: typeof SupervisorState.State) {
  return {
    messages: [new AIMessage('🔒 وكلاء الإدارة (الأمن، تجربة المستخدم، الامتثال) يراقبون استقرار النظام. يُرجى الانتقال للوحة الإدارة للتفاصيل.')],
  };
}

async function generalChatNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const { text } = await generateText({
    model: MODELS.FLASH,
    system: `أنت كلميرون، المستشار الاستراتيجي الذكي لمنصة كلميرون تو. تساعد رواد الأعمال المصريين على بناء شركاتهم وتحقيق أهدافهم. ردودك قوية، واضحة، موجهة للتطبيق العملي، ومكتوبة بالعربية الفصحى المعاصرة. استخدم Markdown لتنظيم إجاباتك.`,
    prompt: lastMessage,
  });
  return { messages: [new AIMessage(text)] };
}

function supervisorRouter(state: typeof SupervisorState.State) {
  if (state.nextStep === '__end__') return END;
  return state.nextStep || 'general_chat_node';
}

export const supervisorWorkflow = new StateGraph(SupervisorState)
  .addNode('router', routerNode)
  .addNode('idea_validator_node', ideaValidatorNode)
  .addNode('plan_builder_node', planBuilderNode)
  .addNode('mistake_shield_node', mistakeShieldNode)
  .addNode('success_museum_node', successMuseumNode)
  .addNode('opportunity_radar_node', opportunityRadarNode)
  .addNode('cfo_agent_node', cfoAgentNode)
  .addNode('legal_guide_node', legalGuideNode)
  .addNode('real_estate_node', realEstateNode)
  .addNode('admin_node', adminNode)
  .addNode('general_chat_node', generalChatNode)
  .addEdge('__start__', 'router')
  .addConditionalEdges('router', supervisorRouter)
  .addEdge('idea_validator_node', END)
  .addEdge('plan_builder_node', END)
  .addEdge('mistake_shield_node', END)
  .addEdge('success_museum_node', END)
  .addEdge('opportunity_radar_node', END)
  .addEdge('cfo_agent_node', END)
  .addEdge('legal_guide_node', END)
  .addEdge('real_estate_node', END)
  .addEdge('admin_node', END)
  .addEdge('general_chat_node', END);

const checkpointer = new MemorySaver();
export const intelligentOrchestrator = supervisorWorkflow.compile({ checkpointer });
