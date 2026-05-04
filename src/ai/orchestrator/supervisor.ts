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
import { judgeDraft, judgeOverall, REFLEXION_ENABLED } from '@/src/ai/panel/judge';
import {
  extractFinanceQuery,
  calcIncomeTax,
  calcSocialInsurance,
  calcTotalCost,
  formatFinanceResultMarkdown,
} from '@/src/ai/agents/cfo-agent/egypt-calc-tool';
import {
  getFounderProfile,
  mergeFounderProfile,
  renderProfileContext,
  extractProfilePatchLLM,
} from '@/src/ai/memory/founder-profile';
import { ceoAgentAction } from '@/src/ai/agents/ceo/agent';
import { cooAgentAction } from '@/src/ai/agents/coo/agent';
import { cmoAgentAction } from '@/src/ai/agents/cmo/agent';
import { ctoAgentAction } from '@/src/ai/agents/cto/agent';
import { cloAgentAction } from '@/src/ai/agents/clo/agent';
import { chroAgentAction } from '@/src/ai/agents/chro/agent';
import { csoAgentAction } from '@/src/ai/agents/cso/agent';
import { competitorIntelAction } from '@/src/ai/agents/competitor-intel/agent';
import { quickCheckInAction } from '@/src/ai/agents/wellbeing-coach/agent';
import { salesCoachAction } from '@/src/ai/agents/sales-coach/agent';
import { contentCreatorAction } from '@/src/ai/agents/content-creator/agent';
import { financialModelingAction } from '@/src/ai/agents/financial-modeling/agent';
import { pitchDeckAction } from '@/src/ai/agents/pitch-deck/agent';
import { productManagerAction } from '@/src/ai/agents/product-manager/agent';
import { hiringAdvisorAction } from '@/src/ai/agents/hiring-advisor/agent';

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
  // Phase C8 — inject founder-profile context into the agent role so the
  // council "remembers" prior sessions. Costs ~50-150 tokens but unlocks
  // continuity. Profile is captured in fire-and-forget below after the
  // user's message has been seen.
  const profile = getFounderProfile(opts.userId);
  const profileBlock = renderProfileContext(profile);
  const enrichedRole = profileBlock ? `${opts.agentRoleAr}${profileBlock}` : opts.agentRoleAr;

  // Fire-and-forget memory capture from the *user* message so the next turn
  // benefits from the new fact. Never blocks the response.
  if (opts.userId) {
    Promise.resolve()
      .then(async () => {
        const patch = await extractProfilePatchLLM(opts.userMessage);
        if (patch) mergeFounderProfile(opts.userId!, patch);
      })
      .catch(() => undefined);
  }

  if (!COUNCIL_ENABLED) return opts.fallback || opts.draft || '';
  const { markdown, result, error } = await runCouncilSafe({
    agentName: opts.agentName,
    agentDisplayNameAr: opts.agentDisplayNameAr,
    agentRoleAr: enrichedRole,
    userMessage: opts.userMessage,
    uiContext: opts.uiContext,
    userId: opts.userId,
    draft: opts.draft,
  });
  if (!result) {
     
    // council failed — using fallback draft
    return opts.draft || markdown || opts.fallback;
  }

  // Phase B6 — Reflexion: opt-in single-pass refinement when judge says so.
  if (REFLEXION_ENABLED) {
    try {
      const score = await judgeDraft({
        agentName: opts.agentName,
        userMessage: opts.userMessage,
        draftMarkdown: markdown,
        userId: opts.userId,
      });
      if (score?.shouldRefine) {
        const { markdown: refined, result: refinedResult } = await runCouncilSafe({
          agentName: opts.agentName,
          agentDisplayNameAr: opts.agentDisplayNameAr,
          agentRoleAr: enrichedRole,
          userMessage: opts.userMessage,
          uiContext: opts.uiContext,
          userId: opts.userId,
          draft: markdown, // hand the prior draft + critique back as the new draft
          mode: 'fast', // refinement is fine on a smaller roster
        });
        if (refinedResult) {
           
          // reflexion: agent refined successfully
          return refined;
        }
      }
    } catch {
      // Reflexion is best-effort; never let it break the response.
    }
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

━━ وكلاء المشاريع المتخصصون ━━
- IDEA_VALIDATOR: عندما يطلب تقييم فكرة مشروع أو تحليل SWOT أو دراسة الجدوى.
- PLAN_BUILDER: عندما يطلب خطة عمل أو Business Plan أو خطوات تنفيذية.
- MISTAKE_SHIELD: عندما يسأل عن أخطاء محتملة، تحذيرات، أو مخاطر.
- SUCCESS_MUSEUM: عندما يسأل عن قصص نجاح شركات أو كيف نجحت شركة معينة.
- OPPORTUNITY_RADAR: عندما يسأل عن منح، مسابقات، تمويل، أو هاكاثونات.
- CFO_AGENT: عندما يسأل عن نمذجة مالية، التدفق النقدي، ضرائب، رواتب، تأمينات، أو توقعات مالية تفصيلية.
- LEGAL_GUIDE: عندما يسأل عن تأسيس شركة، عقود، أو تشريعات مصرية.
- REAL_ESTATE: عندما يسأل عن عقارات استثمارية أو حساب ROI أو صفقات عقارية.
- ADMIN: عندما يسأل عن مراقبة النظام، سجلات، أو لوحة الإدارة.

━━ وكلاء التخصص العميق ━━
- COMPETITOR_INTEL: عندما يسأل عن المنافسين، تحليل المنافسة، مقارنة الشركات، أو نقاط قوة وضعف المنافسين.
- WELLBEING_COACH: عندما يتحدث عن ضغوط العمل، الإرهاق، التوازن بين العمل والحياة، الصحة النفسية، أو الرفاه الشخصي.
- SALES_COACH: عندما يسأل عن تقنيات البيع، إقناع العملاء، التعامل مع الاعتراضات، أو تحسين معدل الإغلاق.
- CONTENT_CREATOR: عندما يطلب كتابة محتوى، منشورات سوشيال ميديا، مقالات، سكريبت فيديو، أو نصوص إعلانية.
- FINANCIAL_MODELING: عندما يطلب نموذج DCF، unit economics، LTV/CAC، three-statement model، أو تقييم الشركة (Valuation).
- PITCH_DECK: عندما يطلب إنشاء Pitch Deck، عرض استثماري، شرائح للمستثمرين، أو تجهيز عرض لجولة تمويل.
- PRODUCT_MANAGER: عندما يسأل عن PRD، User Stories، roadmap المنتج، أولويات الميزات (RICE)، أو مؤشرات المنتج.
- HIRING_ADVISOR: عندما يسأل عن توظيف، استراتيجية التعيين، وصف وظيفي، مقابلات العمل، أو بناء الفريق.

━━ المجلس التنفيذي C-Suite ━━
- CEO_AGENT: عندما يطلب رأي الرئيس التنفيذي، قراراً استراتيجياً شاملاً يمسّ الشركة ككل، أو يسأل عن رؤية القيادة العليا.
- COO_AGENT: عندما يسأل عن تحسين العمليات، الكفاءة التشغيلية، OKRs، تنظيم سير العمل، أو قياس الأداء.
- CMO_AGENT: عندما يسأل عن استراتيجية التسويق الشاملة، بناء العلامة التجارية، النمو، أو حملات التسويق الرقمي.
- CTO_AGENT: عندما يسأل عن التحول الرقمي، اختيار التقنيات المناسبة، البنية التحتية، أو تطبيق الذكاء الاصطناعي.
- CLO_AGENT: عندما يسأل عن الحوكمة القانونية، الامتثال التنظيمي الاستراتيجي، أو المخاطر القانونية على مستوى المنظمة.
- CHRO_AGENT: عندما يسأل عن استراتيجية الموارد البشرية، بناء الفريق القيادي، أو الثقافة المؤسسية.
- CSO_AGENT: عندما يسأل عن التوسع الاستراتيجي بعيد المدى، الاستحواذ، أو بناء رؤية الأعمال للمستقبل.

- GENERAL_CHAT: لأي سؤال عام أو دردشة لا تقع تحت التخصصات أعلاه.`;

/**
 * Fallback heuristic لتصنيف النية محلياً عند فشل استدعاء الـ Router الرئيسي
 * (مثل تجاوز حصة Gemini أو انقطاع الشبكة). كلمات مفتاحية بسيطة بدل الإخفاق
 * الكامل للمحادثة. يُرجَع دائماً اسم نية صالح.
 */
function heuristicIntent(message: string): string {
  const m = (message || '').toLowerCase();
  // C-Suite Executive Agents
  if (/(رئيس\s+تنفيذي|ceo|قرار\s+استراتيجي\s+كبير|رؤية\s+الشركة|قيادة\s+عليا)/i.test(m)) return 'CEO_AGENT';
  if (/(عمليات\s+تشغيلية|coo|okr|كفاءة\s+تشغيلية|سير\s+العمل|قياس\s+الأداء)/i.test(m)) return 'COO_AGENT';
  if (/(استراتيجية\s+تسويق|cmo|علامة\s+تجارية|نمو\s+الشركة|حملة\s+تسويق|تسويق\s+رقمي)/i.test(m)) return 'CMO_AGENT';
  if (/(تحول\s+رقمي|cto|تقنية\s+مناسبة|بنية\s+تحتية\s+تقنية|ذكاء\s+اصطناعي\s+للشركة)/i.test(m)) return 'CTO_AGENT';
  if (/(حوكمة\s+قانونية|clo|امتثال\s+تنظيمي|مخاطر\s+قانونية\s+استراتيجية)/i.test(m)) return 'CLO_AGENT';
  if (/(موارد\s+بشرية\s+استراتيجية|chro|فريق\s+قيادي|ثقافة\s+مؤسسية|استقطاب\s+مواهب)/i.test(m)) return 'CHRO_AGENT';
  if (/(توسع\s+استراتيجي|cso|استحواذ|اندماج|رؤية\s+مستقبلية|فرص\s+استراتيجية)/i.test(m)) return 'CSO_AGENT';
  // ── وكلاء التخصص العميق أولاً (أكثر دقة) ───────────────────────────
  // Specialist agents run BEFORE broad agents to avoid false captures.
  // Example: "شركة" in LEGAL_GUIDE would wrongly swallow competitor queries.
  if (/(dcf|unit\s+economics|ltv|cac|three\s+statement|valuation|تقييم\s+الشركة|نموذج\s+مالي|payback\s+period|magic\s+number)/i.test(m)) return 'FINANCIAL_MODELING';
  if (/(pitch\s+deck|عرض\s+استثماري|شرائح\s+للمستثمرين|investor\s+presentation|جولة\s+تمويل|seed\s+round)/i.test(m)) return 'PITCH_DECK';
  if (/(prd|user\s+stories|roadmap\s+المنتج|أولويات\s+ميزات|rice|north\s+star|product\s+manager|مدير\s+منتج)/i.test(m)) return 'PRODUCT_MANAGER';
  if (/(منافس|منافسين|تحليل\s+المنافس|competitor|مقارنة\s+شركات|نقاط\s+قوة\s+المنافس)/i.test(m)) return 'COMPETITOR_INTEL';
  if (/(ضغط\s+العمل|إرهاق|burnout|توازن|صحة\s+نفسية|رفاه|wellbeing|اكتئاب|قلق|تعب)/i.test(m)) return 'WELLBEING_COACH';
  if (/(مبيعات|بيع|إقناع\s+العميل|اعتراض|إغلاق\s+الصفقة|sales\s+pitch|cold\s+call|conversion)/i.test(m)) return 'SALES_COACH';
  if (/(اكتب\s+محتوى|منشور\s+سوشيال|فيديو\s+سكريبت|content\s+creator|hashtag|caption|thread\s+تويتر)/i.test(m)) return 'CONTENT_CREATOR';
  if (/(توظيف|تعيين|وصف\s+وظيفي|مقابلة\s+عمل|hiring|recruitment|job\s+description|بناء\s+الفريق)/i.test(m)) return 'HIRING_ADVISOR';
  // ── الوكلاء العامة (أوسع نطاقاً — تأتي بعد المتخصصة) ────────────────
  if (/(مال(ي|ية)?|cash[\s-]?flow|تدفق نقدي|توقعات\s+مالية|breakeven|نقطة\s+التعادل|cfo|الفلوس|إيرادات|تكاليف|ضريب|ضراي?ب|tax|تأمين(ات)?|insurance|راتب|اجر|مرتب|payroll|صافي|اجمالي\s*تكلفة)/i.test(m)) return 'CFO_AGENT';
  if (/(قانون|عقد|تأسيس\s+شركة|تشريع|legal|محام)/i.test(m)) return 'LEGAL_GUIDE';
  if (/(عقار|إيجار|شقة|أرض|roi|عائد\s+الاستثمار|real\s*estate)/i.test(m)) return 'REAL_ESTATE';
  if (/(منحة|مسابقة|تمويل|هاكاثون|grant|funding)/i.test(m)) return 'OPPORTUNITY_RADAR';
  if (/(قصة\s+نجاح|كيف\s+نجحت|success|case\s+study|متحف)/i.test(m)) return 'SUCCESS_MUSEUM';
  if (/(خطأ|أخطاء|تحذير|مخاطر|risk|warning)/i.test(m)) return 'MISTAKE_SHIELD';
  if (/(خطة|business\s*plan|خطوات\s+تنفيذ)/i.test(m)) return 'PLAN_BUILDER';
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
    // LLM router failed — heuristic fallback used
  }

  const cleaned = intent.trim().toUpperCase();
  const validIntents = [
    'IDEA_VALIDATOR', 'PLAN_BUILDER', 'MISTAKE_SHIELD',
    'SUCCESS_MUSEUM', 'OPPORTUNITY_RADAR', 'CFO_AGENT',
    'LEGAL_GUIDE', 'REAL_ESTATE', 'ADMIN',
    'COMPETITOR_INTEL', 'WELLBEING_COACH', 'SALES_COACH',
    'CONTENT_CREATOR', 'FINANCIAL_MODELING', 'PITCH_DECK',
    'PRODUCT_MANAGER', 'HIRING_ADVISOR',
    'CEO_AGENT', 'COO_AGENT', 'CMO_AGENT', 'CTO_AGENT',
    'CLO_AGENT', 'CHRO_AGENT', 'CSO_AGENT',
    'GENERAL_CHAT',
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
    COMPETITOR_INTEL: 'competitor_intel_node',
    WELLBEING_COACH: 'wellbeing_coach_node',
    SALES_COACH: 'sales_coach_node',
    CONTENT_CREATOR: 'content_creator_node',
    FINANCIAL_MODELING: 'financial_modeling_node',
    PITCH_DECK: 'pitch_deck_node',
    PRODUCT_MANAGER: 'product_manager_node',
    HIRING_ADVISOR: 'hiring_advisor_node',
    CEO_AGENT: 'ceo_agent_node',
    COO_AGENT: 'coo_agent_node',
    CMO_AGENT: 'cmo_agent_node',
    CTO_AGENT: 'cto_agent_node',
    CLO_AGENT: 'clo_agent_node',
    CHRO_AGENT: 'chro_agent_node',
    CSO_AGENT: 'cso_agent_node',
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
  let toolCard = '';

  // Phase C7 — deterministic Egypt-Calc tool use. If the user's question
  // contains a tax/insurance/total-cost query with a number, hit the
  // Egypt-Calc service. The resulting Markdown card is returned to the user
  // *verbatim* (numbers must not be rewritten by the LLM); the council then
  // layers narrative + recommendations *around* it.
  try {
    const fq = extractFinanceQuery(lastMessage);
    if (fq) {
      if (fq.kind === 'income-tax') {
        const r = await calcIncomeTax(fq.amount);
        toolCard = formatFinanceResultMarkdown(fq, r);
      } else if (fq.kind === 'social-insurance') {
        const r = await calcSocialInsurance(fq.amount);
        toolCard = formatFinanceResultMarkdown(fq, r);
      } else if (fq.kind === 'total-cost') {
        const r = await calcTotalCost(fq.amount, fq.months || 12);
        toolCard = formatFinanceResultMarkdown(fq, r);
      }
      if (toolCard) draft = toolCard;
    }
  } catch (e) {
    // Egypt-Calc unreachable → fall through to LLM-based reasoning.
     
    // egypt-calc unreachable — falling through to LLM reasoning
  }

  if (!draft) {
    try {
      draft = await cfoAgentAction({
        task: 'analyze-scenario',
        parameters: { description: lastMessage },
      });
    } catch (e) {
      draft = '';
    }
  }

  // When we have authoritative tool output, prepend it verbatim to the
  // council answer so the user *always* sees the deterministic figures even
  // if the council narrative drifts. We also short-circuit to the tool card
  // alone when the council itself fails (quota / outage), so finance
  // questions degrade gracefully into "numbers without prose" rather than
  // an error message.
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
  // If we have a deterministic Egypt-Calc card, prepend it so the user *always*
  // sees the authoritative numbers — even if the council narrative drifts or
  // entirely fails. This preserves the C7 acceptance: a tax-bracket question
  // is answered with deterministic numbers from Egypt-Calc.
  const finalText =
    toolCard && !text.includes(toolCard)
      ? `${toolCard}\n\n---\n\n${text}`
      : text;
  return { messages: [new AIMessage(finalText)] };
}

async function legalGuideNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    draft = await legalGuideAction(lastMessage);
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// C-Suite Executive Nodes — المجلس التنفيذي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function ceoAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const result = await ceoAgentAction({
      message: lastMessage,
      context: JSON.stringify(state.uiContext || {}),
      urgency: 'medium',
    });
    const formatted = [
      `## 🏛️ المدير التنفيذي — التقييم الاستراتيجي\n`,
      result.executiveSummary ? `**الملخص التنفيذي:** ${result.executiveSummary}\n` : '',
      result.assessment ? `**التقييم:** ${result.assessment}\n` : '',
      result.recommendation ? `**التوصية:** ${result.recommendation}\n` : '',
      result.delegatedTo ? `**التفويض إلى:** ${result.delegatedTo}\n` : '',
      result.riskFlags?.length ? `**مؤشرات الخطر:** ${result.riskFlags.join('، ')}\n` : '',
      `**الخطوة التالية:** ${result.nextAction}`,
    ].filter(Boolean).join('\n');
    const text = await withCouncil({
      agentName: 'ceo-agent',
      agentDisplayNameAr: 'المدير التنفيذي',
      agentRoleAr: 'الرئيس التنفيذي لمنظومة كلميرون — يُقيّم ويوجّه ويتخذ القرارات الاستراتيجية الكبرى على مستوى المنظمة',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      draft: formatted,
      fallback: formatted,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة.')] };
    }
    throw e;
  }
}

async function cooAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const draft = await cooAgentAction({
      message: lastMessage,
      context: JSON.stringify(state.uiContext || {}),
      focusArea: 'general',
    });
    const text = await withCouncil({
      agentName: 'coo-agent',
      agentDisplayNameAr: 'مدير العمليات التنفيذي',
      agentRoleAr: 'الرئيس التنفيذي للعمليات — يحوّل الاستراتيجية لخطوات تشغيلية قابلة للتنفيذ والقياس',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      draft,
      fallback: draft,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة.')] };
    }
    throw e;
  }
}

async function cmoAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const draft = await cmoAgentAction({
      message: lastMessage,
      currentStage: 'growth',
    });
    const text = await withCouncil({
      agentName: 'cmo-agent',
      agentDisplayNameAr: 'مدير التسويق التنفيذي',
      agentRoleAr: 'الرئيس التنفيذي للتسويق — يبني العلامة التجارية ويصمّم استراتيجيات النمو للسوق العربي',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      draft,
      fallback: draft,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة.')] };
    }
    throw e;
  }
}

async function ctoAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const draft = await ctoAgentAction({
      message: lastMessage,
      stage: 'growth',
    });
    const text = await withCouncil({
      agentName: 'cto-agent',
      agentDisplayNameAr: 'مدير التقنية التنفيذي',
      agentRoleAr: 'الرئيس التنفيذي للتقنية — يُقيّم التكنولوجيا ويصمّم البنية التحتية ويقود التحول الرقمي',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      draft,
      fallback: draft,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة.')] };
    }
    throw e;
  }
}

async function cloAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const draft = await cloAgentAction({
      message: lastMessage,
      context: JSON.stringify(state.uiContext || {}),
      jurisdiction: 'egypt',
    });
    const text = await withCouncil({
      agentName: 'clo-agent',
      agentDisplayNameAr: 'المستشار القانوني الأول',
      agentRoleAr: 'الرئيس التنفيذي للشؤون القانونية — يُحلّل المخاطر القانونية ويضمن الامتثال للقانون المصري والدولي',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      draft,
      fallback: draft,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة.')] };
    }
    throw e;
  }
}

async function chroAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const draft = await chroAgentAction({
      message: lastMessage,
      hrChallenge: 'general',
      stage: 'startup',
    });
    const text = await withCouncil({
      agentName: 'chro-agent',
      agentDisplayNameAr: 'مدير الموارد البشرية التنفيذي',
      agentRoleAr: 'الرئيس التنفيذي للموارد البشرية — يستقطب المواهب ويبني ثقافة مؤسسية قوية وهياكل تنظيمية فعّالة',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      draft,
      fallback: draft,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة.')] };
    }
    throw e;
  }
}

async function csoAgentNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  try {
    const draft = await csoAgentAction({
      message: lastMessage,
      horizonYears: 3,
      focusArea: 'general',
    });
    const text = await withCouncil({
      agentName: 'cso-agent',
      agentDisplayNameAr: 'مدير الاستراتيجية التنفيذي',
      agentRoleAr: 'الرئيس التنفيذي للاستراتيجية — يرصد الفرص ويصمّم التوسع ويبني رؤية الأعمال على المدى البعيد',
      userMessage: lastMessage,
      uiContext: state.uiContext,
      userId: state.userId,
      draft,
      fallback: draft,
    });
    return { messages: [new AIMessage(text)] };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return { messages: [new AIMessage('تم رفض الطلب: اكتُشفت محاولة حقن أوامر في الرسالة.')] };
    }
    throw e;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// وكلاء التخصص العميق — Deep Specialist Nodes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function competitorIntelNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    const industryMatch = lastMessage.match(/قطاع\s+["«»]?([^"«»،,]+)["«»]?/) ||
      lastMessage.match(/industry[:\s]+([^\n،,]+)/i);
    const companyMatch = lastMessage.match(/شركة\s+["«»]?([^"«»،,\s]+)["«»]?/);
    const industry = industryMatch ? industryMatch[1].trim() : lastMessage.slice(0, 60);
    const company = companyMatch ? companyMatch[1].trim() : undefined;
    draft = await competitorIntelAction(industry, company);
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'competitor-intel',
    agentDisplayNameAr: 'محلل المنافسين',
    agentRoleAr: 'خبير استخباراتي متخصص في تحليل المنافسين وتحديد الفجوات التنافسية للسوق المصري',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في تحليل المنافسين. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function wellbeingCoachNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    draft = await quickCheckInAction(lastMessage);
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'wellbeing-coach',
    agentDisplayNameAr: 'مدرب الرفاه النفسي',
    agentRoleAr: 'مدرب متخصص في رفاه رواد الأعمال ومساعدتهم على إدارة الضغط والتوازن بين العمل والحياة الشخصية',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل الرفاه النفسي. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function salesCoachNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    const productMatch = lastMessage.match(/منتج\s+["«»]?([^"«»،,]+)["«»]?/) ||
      lastMessage.match(/product[:\s]+([^\n،,]+)/i);
    const targetMatch = lastMessage.match(/عميل\s+["«»]?([^"«»،,]+)["«»]?/) ||
      lastMessage.match(/(?:لـ|لـِ|للـ)\s+["«»]?([^"«»،,]+)["«»]?/);
    const product = productMatch ? productMatch[1].trim() : lastMessage.slice(0, 50);
    const target = targetMatch ? targetMatch[1].trim() : 'السوق المصري';
    const challengeMatch = lastMessage.match(/تحدي[:\s]+([^\n.]+)/);
    const challenge = challengeMatch ? challengeMatch[1].trim() : lastMessage;
    draft = await salesCoachAction(product, target, challenge);
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'sales-coach',
    agentDisplayNameAr: 'مدرب المبيعات',
    agentRoleAr: 'مدرب مبيعات متخصص في بناء استراتيجيات البيع وتقنيات الإقناع للسوق المصري',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل مدرب المبيعات. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function contentCreatorNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    const typeMap: Record<string, 'social-post' | 'blog-article' | 'video-script' | 'email' | 'ad-copy' | 'thread'> = {
      'منشور': 'social-post', 'سوشيال': 'social-post', 'مقال': 'blog-article',
      'فيديو': 'video-script', 'إيميل': 'email', 'email': 'email',
      'إعلان': 'ad-copy', 'thread': 'thread',
    };
    let contentType: 'social-post' | 'blog-article' | 'video-script' | 'email' | 'ad-copy' | 'case-study' | 'thread' = 'social-post';
    for (const [kw, t] of Object.entries(typeMap)) {
      if (lastMessage.toLowerCase().includes(kw)) { contentType = t; break; }
    }
    const result = await contentCreatorAction({
      contentType,
      topic: lastMessage,
      tone: 'inspiring',
    });
    draft = typeof result === 'string' ? result : result.content;
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'content-creator',
    agentDisplayNameAr: 'منشئ المحتوى',
    agentRoleAr: 'متخصص في إنشاء محتوى رقمي جذاب وفعّال للعلامات التجارية العربية عبر جميع المنصات',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل منشئ المحتوى. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function financialModelingNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    const typeMap: Record<string, 'dcf' | 'unit-economics' | 'three-statement' | 'valuation' | 'scenario'> = {
      'dcf': 'dcf', 'unit economics': 'unit-economics', 'ltv': 'unit-economics',
      'cac': 'unit-economics', 'three statement': 'three-statement', 'valuation': 'valuation',
      'تقييم': 'valuation', 'سيناريو': 'scenario', 'scenario': 'scenario',
    };
    let modelType: 'dcf' | 'unit-economics' | 'three-statement' | 'valuation' | 'scenario' = 'scenario';
    for (const [kw, t] of Object.entries(typeMap)) {
      if (lastMessage.toLowerCase().includes(kw)) { modelType = t; break; }
    }
    const result = await financialModelingAction({
      modelType,
      businessData: { description: lastMessage },
      horizon: 3,
    });
    draft = typeof result === 'string' ? result : result.model;
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'financial-modeling',
    agentDisplayNameAr: 'خبير النمذجة المالية',
    agentRoleAr: 'خبير في بناء النماذج المالية المتقدمة (DCF، Unit Economics، Valuation) للشركات الناشئة في مصر',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل النمذجة المالية. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function pitchDeckNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const uiContext = (state.uiContext || {}) as Record<string, unknown>;
  let draft = '';
  try {
    const result = await pitchDeckAction({
      business: {
        name: (uiContext.companyName as string) || 'شركتي الناشئة',
        sector: (uiContext.industry as string) || 'تقنية',
        problem: lastMessage,
        solution: 'حل مبتكر للسوق المصري',
        stage: (uiContext.stage as string) || 'seed',
      },
      format: 'full-narrative',
    });
    draft = typeof result === 'string' ? result : result.deck;
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'pitch-deck',
    agentDisplayNameAr: 'منشئ عروض الاستثمار',
    agentRoleAr: 'خبير في إنشاء Pitch Decks مقنعة للمستثمرين في السوق المصري والخليجي',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل عروض الاستثمار. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function productManagerNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  let draft = '';
  try {
    const taskMap: Record<string, 'write-prd' | 'prioritize-features' | 'create-roadmap' | 'user-stories' | 'define-metrics'> = {
      'prd': 'write-prd', 'user stories': 'user-stories', 'user story': 'user-stories',
      'roadmap': 'create-roadmap', 'أولويات': 'prioritize-features', 'rice': 'prioritize-features',
      'metrics': 'define-metrics', 'مؤشرات': 'define-metrics', 'north star': 'define-metrics',
    };
    let task: 'write-prd' | 'prioritize-features' | 'create-roadmap' | 'user-stories' | 'define-metrics' = 'write-prd';
    for (const [kw, t] of Object.entries(taskMap)) {
      if (lastMessage.toLowerCase().includes(kw)) { task = t; break; }
    }
    const result = await productManagerAction({
      task,
      productContext: lastMessage,
    });
    draft = typeof result === 'string' ? result : result.output;
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'product-manager',
    agentDisplayNameAr: 'مدير المنتج',
    agentRoleAr: 'مدير منتج متمرس يبني PRDs وخرائط طريق وأولويات ميزات للمنتجات الرقمية',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل مدير المنتج. يرجى المحاولة مجدداً.',
  });
  return { messages: [new AIMessage(text)] };
}

async function hiringAdvisorNode(state: typeof SupervisorState.State) {
  const lastMessage = state.messages[state.messages.length - 1]?.content as string;
  const uiContext = (state.uiContext || {}) as Record<string, unknown>;
  let draft = '';
  try {
    const roleMatch = lastMessage.match(/(?:توظيف|تعيين|أبحث\s+عن)\s+["«»]?([^"«»،,\n]+)["«»]?/) ||
      lastMessage.match(/(?:hire|hiring)\s+(?:a\s+)?([^\n،,]+)/i);
    const role = roleMatch ? roleMatch[1].trim() : lastMessage.slice(0, 60);
    const stage = (uiContext.stage as string) || 'startup';
    draft = await hiringAdvisorAction(role, stage);
  } catch (e) {
    draft = '';
  }
  const text = await withCouncil({
    agentName: 'hiring-advisor',
    agentDisplayNameAr: 'مستشار التوظيف',
    agentRoleAr: 'مستشار توظيف متخصص في بناء فرق العمل للشركات الناشئة في السوق المصري',
    userMessage: lastMessage,
    uiContext: state.uiContext,
    userId: state.userId,
    draft,
    fallback: draft || 'حدث خطأ في وكيل مستشار التوظيف. يرجى المحاولة مجدداً.',
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
  // وكلاء المشاريع المتخصصون
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
  // وكلاء التخصص العميق
  .addNode('competitor_intel_node', competitorIntelNode)
  .addNode('wellbeing_coach_node', wellbeingCoachNode)
  .addNode('sales_coach_node', salesCoachNode)
  .addNode('content_creator_node', contentCreatorNode)
  .addNode('financial_modeling_node', financialModelingNode)
  .addNode('pitch_deck_node', pitchDeckNode)
  .addNode('product_manager_node', productManagerNode)
  .addNode('hiring_advisor_node', hiringAdvisorNode)
  // المجلس التنفيذي C-Suite
  .addNode('ceo_agent_node', ceoAgentNode)
  .addNode('coo_agent_node', cooAgentNode)
  .addNode('cmo_agent_node', cmoAgentNode)
  .addNode('cto_agent_node', ctoAgentNode)
  .addNode('clo_agent_node', cloAgentNode)
  .addNode('chro_agent_node', chroAgentNode)
  .addNode('cso_agent_node', csoAgentNode)
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
  .addEdge('general_chat_node', END)
  .addEdge('competitor_intel_node', END)
  .addEdge('wellbeing_coach_node', END)
  .addEdge('sales_coach_node', END)
  .addEdge('content_creator_node', END)
  .addEdge('financial_modeling_node', END)
  .addEdge('pitch_deck_node', END)
  .addEdge('product_manager_node', END)
  .addEdge('hiring_advisor_node', END)
  .addEdge('ceo_agent_node', END)
  .addEdge('coo_agent_node', END)
  .addEdge('cmo_agent_node', END)
  .addEdge('cto_agent_node', END)
  .addEdge('clo_agent_node', END)
  .addEdge('chro_agent_node', END)
  .addEdge('cso_agent_node', END);

const checkpointer = new MemorySaver();
export const intelligentOrchestrator = supervisorWorkflow.compile({ checkpointer });
