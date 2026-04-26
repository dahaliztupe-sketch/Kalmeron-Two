// @ts-nocheck
/**
 * Startup Launchpad — خط أنابيب الإطلاق
 * --------------------------------------
 * ثمانية مراحل LangGraph StateGraph تحوّل فكرة إلى حزمة إطلاق كاملة.
 */
import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { adminDb } from '@/src/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { instrumentAgent } from '@/src/lib/observability/instrumentation';

export type LaunchStage =
  | 'idea_validator'
  | 'plan_builder'
  | 'cfo_agent'
  | 'product_crew'
  | 'security_agent'
  | 'marketing_crew'
  | 'investor_relations'
  | 'orchestrator';

export interface LaunchProgress {
  stage: LaunchStage;
  pct: number;
  message: string;
  at: number;
}

const LaunchState = Annotation.Root({
  runId: Annotation<string>(),
  workspaceId: Annotation<string>(),
  idea: Annotation<string>(),
  validation: Annotation<unknown>(),
  plan: Annotation<unknown>(),
  financials: Annotation<unknown>(),
  mvp: Annotation<unknown>(),
  security: Annotation<unknown>(),
  marketing: Annotation<unknown>(),
  pitchDeck: Annotation<unknown>(),
  bundle: Annotation<unknown>(),
  progress: Annotation<LaunchProgress[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
});

async function publishProgress(runId: string, entry: LaunchProgress) {
  try {
    await adminDb
      .collection('launch_runs')
      .doc(runId)
      .set(
        {
          lastProgress: entry,
          progress: FieldValue.arrayUnion(entry),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  } catch {
    /* swallow to keep pipeline moving */
  }
}

async function llmJSON(system: string, prompt: string): Promise<unknown> {
  const { text } = await generateText({
    model: MODELS.FLASH,
    system: `${system}\nأجب بصيغة JSON صالحة فقط بدون أي تعليق.`,
    prompt,
  });
  try {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    return JSON.parse(first >= 0 ? text.slice(first, last + 1) : text);
  } catch {
    return { raw: text };
  }
}

function progressNode(stage: LaunchStage, pct: number, message: string) {
  return async (state: unknown) => {
    const entry: LaunchProgress = { stage, pct, message, at: Date.now() };
    await publishProgress(state.runId, entry);
    return { progress: [entry] };
  };
}

async function ideaValidatorNode(state: unknown) {
  await publishProgress(state.runId, {
    stage: 'idea_validator', pct: 10, message: 'تحليل الفكرة...', at: Date.now(),
  });
  const validation = await llmJSON(
    'أنت محلل أفكار ريادية. قيّم الفكرة وأعطِ نقاط القوة والضعف وحجم السوق التقديري.',
    state.idea
  );
  return { validation, progress: [{ stage: 'idea_validator', pct: 12, message: 'تم التحقق من الفكرة', at: Date.now() }] };
}

async function planBuilderNode(state: unknown) {
  await publishProgress(state.runId, { stage: 'plan_builder', pct: 20, message: 'بناء خطة العمل...', at: Date.now() });
  const plan = await llmJSON(
    'أنت استشاري استراتيجي. ابنِ خطة عمل تتضمن: mission, vision, targetMarket, valueProposition, milestones[6].',
    `الفكرة: ${state.idea}\nنتيجة التحقق: ${JSON.stringify(state.validation)}`
  );
  return { plan, progress: [{ stage: 'plan_builder', pct: 25, message: 'اكتملت خطة العمل', at: Date.now() }] };
}

async function cfoAgentNode(state: unknown) {
  await publishProgress(state.runId, { stage: 'cfo_agent', pct: 35, message: 'بناء النموذج المالي...', at: Date.now() });
  const financials = await llmJSON(
    'أنت مدير مالي. ابنِ نموذجاً مالياً ل3 سنوات: revenue[], costs[], cac, ltv, burnRate, breakEvenMonth.',
    `خطة العمل: ${JSON.stringify(state.plan)}`
  );
  return { financials, progress: [{ stage: 'cfo_agent', pct: 42, message: 'اكتمل النموذج المالي', at: Date.now() }] };
}

async function productCrewNode(state: unknown) {
  await publishProgress(state.runId, { stage: 'product_crew', pct: 55, message: 'بناء MVP...', at: Date.now() });
  const mvp = await llmJSON(
    'أنت فريق منتج. حدّد: coreFeatures[], techStack, architectureSketch, mvpScope, deliveryWeeks.',
    `الفكرة: ${state.idea}\nالخطة: ${JSON.stringify(state.plan)}`
  );
  return { mvp, progress: [{ stage: 'product_crew', pct: 62, message: 'اكتملت مواصفات MVP', at: Date.now() }] };
}

async function securityAgentNode(state: unknown) {
  await publishProgress(state.runId, { stage: 'security_agent', pct: 70, message: 'التدقيق الأمني...', at: Date.now() });
  const security = await llmJSON(
    'أنت مدقق أمني. حدّد: threats[], mitigations[], complianceRequirements[].',
    `وصف المنتج: ${JSON.stringify(state.mvp)}`
  );
  return { security, progress: [{ stage: 'security_agent', pct: 75, message: 'اكتمل التدقيق الأمني', at: Date.now() }] };
}

async function marketingCrewNode(state: unknown) {
  await publishProgress(state.runId, { stage: 'marketing_crew', pct: 85, message: 'استراتيجية التسويق...', at: Date.now() });
  const marketing = await llmJSON(
    'أنت فريق تسويق. حدّد: positioning, channels[], launchCampaigns[], budgetMonthlyUSD, kpis[].',
    `الخطة: ${JSON.stringify(state.plan)}\nالمالية: ${JSON.stringify(state.financials)}`
  );
  return { marketing, progress: [{ stage: 'marketing_crew', pct: 90, message: 'اكتملت استراتيجية التسويق', at: Date.now() }] };
}

async function investorRelationsNode(state: unknown) {
  await publishProgress(state.runId, { stage: 'investor_relations', pct: 95, message: 'بناء العرض التقديمي...', at: Date.now() });
  const pitchDeck = await llmJSON(
    'أنت مسؤول علاقات المستثمرين. ابنِ عرضاً من 10 شرائح: slides[{title, bullets[]}].',
    `اجمع كل ما سبق: ${JSON.stringify({ idea: state.idea, plan: state.plan, financials: state.financials, mvp: state.mvp })}`
  );
  return { pitchDeck, progress: [{ stage: 'investor_relations', pct: 97, message: 'اكتمل العرض التقديمي', at: Date.now() }] };
}

async function orchestratorNode(state: unknown) {
  const bundle = {
    idea: state.idea,
    validation: state.validation,
    plan: state.plan,
    financials: state.financials,
    mvp: state.mvp,
    security: state.security,
    marketing: state.marketing,
    pitchDeck: state.pitchDeck,
    generatedAt: Date.now(),
  };
  try {
    await adminDb.collection('launch_runs').doc(state.runId).set(
      { bundle, status: 'completed', updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch {}
  await publishProgress(state.runId, { stage: 'orchestrator', pct: 100, message: 'اكتملت حزمة الإطلاق', at: Date.now() });
  return { bundle, progress: [{ stage: 'orchestrator', pct: 100, message: 'تم', at: Date.now() }] };
}

export function buildLaunchPipeline() {
  const graph = new StateGraph(LaunchState)
    .addNode('idea_validator', ideaValidatorNode)
    .addNode('plan_builder', planBuilderNode)
    .addNode('cfo_agent', cfoAgentNode)
    .addNode('product_crew', productCrewNode)
    .addNode('security_agent', securityAgentNode)
    .addNode('marketing_crew', marketingCrewNode)
    .addNode('investor_relations', investorRelationsNode)
    .addNode('orchestrator', orchestratorNode)
    .addEdge(START, 'idea_validator')
    .addEdge('idea_validator', 'plan_builder')
    .addEdge('plan_builder', 'cfo_agent')
    .addEdge('cfo_agent', 'product_crew')
    .addEdge('product_crew', 'security_agent')
    .addEdge('security_agent', 'marketing_crew')
    .addEdge('marketing_crew', 'investor_relations')
    .addEdge('investor_relations', 'orchestrator')
    .addEdge('orchestrator', END);
  return graph.compile();
}

export async function launchStartup(args: { workspaceId: string; idea: string; runId?: string; userId?: string }) {
  const runId = args.runId || `run_${Date.now()}_${(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).slice(2)).slice(0, 6)}`;
  const result = await instrumentAgent(
    'launchpad_pipeline',
    async () => {
      try {
        await adminDb.collection('launch_runs').doc(runId).set(
          {
            workspaceId: args.workspaceId,
            idea: args.idea,
            status: 'running',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch {}
      const app = buildLaunchPipeline();
      const final = await app.invoke({ runId, workspaceId: args.workspaceId, idea: args.idea });
      return { runId, ...final };
    },
    { task: args.idea, workspaceId: args.workspaceId }
  );
  const { afterAgentRun } = await import('@/src/lib/agents/hooks');
  afterAgentRun({
    workspaceId: args.workspaceId,
    userId: args.userId,
    agent: 'launchpad_pipeline',
    event: 'launch.completed',
    payload: { runId, idea: args.idea },
    notification: {
      type: 'launch.completed',
      title: 'انتهت حزمة الإطلاق',
      body: `فكرة: ${args.idea.slice(0, 80)}`,
      href: `/launchpad`,
    },
    estimatedTokens: 8000,
  }).catch(() => {});
  return result;
}

/** Lightweight status fetcher for the dashboard. */
export async function getLaunchRun(runId: string) {
  const snap = await adminDb.collection('launch_runs').doc(runId).get();
  return snap.exists ? { id: runId, ...snap.data() } : null;
}
