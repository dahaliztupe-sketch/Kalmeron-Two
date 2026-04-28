// @ts-nocheck
import { StateGraph, Annotation, MemorySaver, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { MODELS } from '@/src/lib/gemini';
import { validateIdea } from '@/src/agents/idea-validator/agent';
import { buildBusinessPlanStream } from '@/src/agents/plan-builder/agent';
import { getProactiveWarnings } from '@/src/agents/mistake-shield/agent';
import { getPersonalizedOpportunities } from '@/src/agents/opportunity-radar/agent';
import { analyzeCompany } from '@/src/agents/success-museum/agent';
import { cfoAgentAction } from '@/src/ai/agents/cfo-agent/agent';
import { legalGuideAction } from '@/src/ai/agents/legal-guide/agent';
import { safeGenerateText, PromptInjectionBlockedError } from '@/src/lib/llm/gateway';
import { rateLimitAgent } from '@/src/lib/security/rate-limit';
import { runCouncilSafe } from '@/src/ai/panel';

/**
 * مفتاح تشغيل "مجلس الإدارة الافتراضي" (Panel of Experts) لكل وكيل.
 * عند التفعيل، يمر مخرج الوكيل عبر تداول داخلي مكوّن من 4 خبراء دائمين
 * + 3-4 متخصصين مختارين ديناميكياً، ويُسلَّم بتنسيق موحّد.
 *
 * يمكن تعطيله عبر متغير البيئة KALMERON_COUNCIL=off للاختبارات.
 */
const COUNCIL_ENABLED = process.env.KALMERON_COUNCIL !== 'off';

/** مساعد لتشغيل المجلس مع fallback إلى مخرج الوكيل الأصلي عند الفشل. */
async function withCouncil(opts: {
  agentName: string;
  agentDisplayNameAr: string;
  agentRoleAr: string;
  userMessage: string;
  uiContext?: unknown;
  userId?: string;
  draft?: string;
  fallback: string;
}): Promise<string> {
  if (!COUNCIL_ENABLED) return opts.fallback || opts.draft || '';
  const { markdown, result, error } = await runCouncilSafe({
    agentName: opts.agentName,
    agentDisplayNameAr: opts.agentDisplayNameAr,
    agentRoleAr: opts.agentRoleAr,
    userMessage: opts.userMessage,
    uiContext: opts.uiContext,
    userId: opts.userId,
    draft: opts.draft,
  });
  if (!result) {
    // eslint-disable-next-line no-console
    console.error(`[withCouncil] council failed for ${opts.agentName}:`, error);
    return opts.draft || markdown || opts.fallback;
  }
  return markdown;
}

export const SupervisorState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: (a, b) => a.concat(b) }),
  isGuest: Annotation<boolean>(),
  messageCount: Annotation<number>(),
  uiContext: Annotation<unknown>(),
  intent: Annotation<string>(),
  nextStep: Annotation<string>(),
  userId: Annotation<string>(),
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

/**
 * Fallback heuristic لتصنيف النية محلياً عند فشل استدعاء الـ Router الرئيسي
 * (مثل تجاوز حصة Gemini أو انقطاع الشبكة). كلمات مفتاحية بسيطة بدل الإخفاق
 * الكامل للمحادثة. يُرجَع دائماً اسم نية صالح.
 */
function heuristicIntent(message: string): string {
  const m = (message || '').toLowerCase();
  if (/(مال(ي|ية)?|cash[\s-]?flow|تدفق نقدي|توقعات\s+مالية|breakeven|نقطة\s+التعادل|cfo|الفلوس|إيرادات|تكاليف)/i.test(m)) return 'CFO_AGENT';
  if (/(قانون|عقد|تأسيس|شركة|تشريع|legal|محام)/i.test(m)) return 'LEGAL_GUIDE';
  if (/(عقار|إيجار|شقة|أرض|roi|عائد\s+الاستثمار|real\s*estate)/i.test(m)) return 'REAL_ESTATE';
  if (/(منحة|مسابقة|تمويل|هاكاثون|grant|funding)/i.test(m)) return 'OPPORTUNITY_RADAR';
  if (/(قصة\s+نجاح|كيف\s+نجحت|success|case\s+study|متحف)/i.test(m)) return 'SUCCESS_MUSEUM';
  if (/(خطأ|أخطاء|تحذير|مخاطر|risk|warning)/i.test(m)) return 'MISTAKE_SHIELD';
  if (/(خطة|business\s*plan|plan|خطوات\s+تنفيذ|roadmap)/i.test(m)) return 'PLAN_BUILDER';
  if (/(فكرة|swot|جدوى|تقييم\s+فكرة|validate)/i.test(m)) return 'IDEA_VALIDATOR';
  return 'GENERAL_CHAT';
}

async function routerNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;

  if (state.isGuest && (state.messageCount || 0) >= 4) {
    return {
      messages: [new AIMessage('انتهت رسائلك التجريبية المجانية. سجّل الدخول للاستمرار!')],
      nextStep: '__end__',
    };
  }

  let intent: string;
  try {
    const { result } = await safeGenerateText(
      {
        model: MODELS.LITE,
        system: INTENT_CLASSIFIER_PROMPT,
        prompt: `سياق الواجهة: ${JSON.stringify(state.uiContext || {})}
رسالة المستخدم: ${lastMessage}`,
        // الراوتر هو أكثر استدعاء يستهلك من الحصة. retries هنا تُضاعف
        // مشكلة الـ 429 وتُفرغ الـ bucket المجاني بسرعة. نُلغي الـ retries
        // ونعتمد على fallback heuristic أدناه عند فشل النداء.
        maxRetries: 0,
      },
      { agent: 'router', userId: state.userId, softCostBudgetUsd: 0.005 },
    );
    intent = result.text;
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return {
        intent: 'GENERAL_CHAT',
        nextStep: '__end__',
        messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة. يرجى إعادة الصياغة.')],
      };
    }
    // Fallback ذكي عند فشل الـ Router (quota، شبكة، ...): نصنّف النية
    // محلياً عبر كلمات مفتاحية حتى لا نُفشل المحادثة بالكامل.
    intent = heuristicIntent(lastMessage);
    console.warn('[router] LLM classification failed, used heuristic →', intent, '·', (e as Error)?.message?.slice(0, 200));
  }

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

  const userId = state.userId || 'guest-system';
  const agentBucket = stepMap[matched].replace(/_node$/, '') || 'general_chat';
  const rl = rateLimitAgent(userId, agentBucket, { limit: 15, windowMs: 60_000 });
  if (!rl.allowed) {
    return {
      intent: matched,
      nextStep: '__end__',
      messages: [new AIMessage(`تجاوزت حد استخدام وكيل ${agentBucket} (${rl.limit}/دقيقة). جرّب بعد قليل.`)],
    };
  }

  return { intent: matched, nextStep: stepMap[matched] };
}

async function ideaValidatorNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    draft = await validateIdea(lastMessage);
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'idea-validator',
    agentDisplayNameAr: 'مُحلّل الأفكار',
    agentRoleAr: 'متخصص في تقييم أفكار المشاريع الريادية وتحليل SWOT والجدوى للسوق المصري',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ أثناء تحليل الفكرة. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function planBuilderNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    const stream = await buildBusinessPlanStream(lastMessage, []);
    for await (const chunk of stream.textStream) draft += chunk;
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'plan-builder',
    agentDisplayNameAr: 'بنّاء الخطط',
    agentRoleAr: 'متخصص في بناء خطط العمل التفصيلية للمشاريع المصرية',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ أثناء بناء خطة العمل. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function mistakeShieldNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const uiContext = state.uiContext || {};
  let draft = '';
  try {
    draft = await getProactiveWarnings(uiContext.stage || 'general', lastMessage);
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'mistake-shield',
    agentDisplayNameAr: 'حارس الأخطاء',
    agentRoleAr: 'يكشف الأخطاء القاتلة والمخاطر الخفية في المشاريع المصرية الناشئة',
    userMessage: lastMessage,
    uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل حارس الأخطاء. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function successMuseumNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const companyMatch = lastMessage.match(/["«»]([^"«»]+)["«»]/) ||
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
    const text = await withCouncil({
      agentName: 'success-museum',
      agentDisplayNameAr: 'متحف النجاح',
      agentRoleAr: 'يستخرج الدروس العملية من قصص نجاح الشركات للمؤسسين المصريين',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      draft: formatted,
      fallback: formatted,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ في تحليل قصة النجاح. يرجى المحاولة مجدداً.')] };
  }
}

async function opportunityRadarNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const uiContext = state.uiContext || {};
  try {
    const opportunities = await getPersonalizedOpportunities(
      uiContext.industry || 'تقنية',
      uiContext.stage || 'idea',
      uiContext.location || 'القاهرة'
    );
    const formatted = `## الفرص المتاحة لك الآن 🎯

${opportunities.map((opp: unknown, i: number) => `### ${i + 1}. ${opp.title}
**النوع:** ${opp.type} | **الجهة:** ${opp.organizer}
**الموعد النهائي:** ${opp.deadline} | **المكان:** ${opp.location}
${opp.description}
🔗 [التقديم الآن](${opp.link})
---`).join('\n')}`;
    const text = await withCouncil({
      agentName: 'opportunity-radar',
      agentDisplayNameAr: 'رادار الفرص',
      agentRoleAr: 'يرشّح أفضل المنح والفعاليات والتمويل لرائد الأعمال المصري',
      userMessage: lastMessage,
      uiContext,
      userId: state.userId,
      draft: formatted,
      fallback: formatted,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    return { messages: [new AIMessage('حدث خطأ في البحث عن الفرص. يرجى المحاولة مجدداً.')] };
  }
}

async function cfoAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    draft = await cfoAgentAction({
      task: 'analyze-scenario',
      parameters: { description: lastMessage },
    });
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'cfo-agent',
    agentDisplayNameAr: 'المدير المالي',
    agentRoleAr: 'مدير مالي يبني نمذجة مالية وتدفقات نقدية وتقييماً للسوق المصري',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل المدير المالي. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function legalGuideNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    draft = await legalGuideAction({ query: lastMessage });
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'legal-guide',
    agentDisplayNameAr: 'المرشد القانوني',
    agentRoleAr: 'مستشار قانوني متخصص في تأسيس الشركات والعقود والتشريعات المصرية',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في المرشد القانوني. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function realEstateNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const text = await withCouncil({
      agentName: 'real-estate',
      agentDisplayNameAr: 'خبير العقارات',
      agentRoleAr:
        'خبير عقارات استثمارية في مصر متخصص في حساب ROI، قاعدة الـ1٪، تقييم الصفقات، وتحليل الأسواق العقارية لعام 2026',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      fallback: 'حدث خطأ في خبير العقارات. يرجى المحاولة مجدداً.',
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة. يرجى إعادة الصياغة.')] };
    }
    throw e;
  }
}

async function adminNode(state: typeof SupervisorState.State) {
  return {
    messages: [new AIMessage('🔒 وكلاء الإدارة (الأمن، تجربة المستخدم، الامتثال) يراقبون استقرار النظام. يُرجى الانتقال للوحة الإدارة للتفاصيل.')],
  };
}

async function generalChatNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const text = await withCouncil({
      agentName: 'general-chat',
      agentDisplayNameAr: 'كلميرون',
      agentRoleAr:
        'المستشار الاستراتيجي العام لرواد الأعمال المصريين، يقدم نصائح قوية وموجهة للتطبيق العملي بالعربية الفصحى المعاصرة',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      fallback: 'حدث خطأ في الردّ. يرجى المحاولة مجدداً.',
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة. يرجى إعادة الصياغة.')] };
    }
    throw e;
  }
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
