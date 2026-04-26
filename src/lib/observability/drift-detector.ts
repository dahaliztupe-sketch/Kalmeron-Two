/**
 * Drift Detector — يكتشف "الانجراف" في سلوك الوكلاء عبر الزمن.
 * يخزّن إشارات خفيفة في Firestore (collection: agent_drift) ويقدّم
 * استعلامات تجميعية يستخدمها وكيل المراقبة (Observer) في صفحة الإدارة.
 *
 * الإشارات المُتتبَّعة:
 *  - توزيع استخدام الأدوات لكل وكيل
 *  - توزيع طول الاستجابة
 *  - أنماط الأخطاء الجديدة (رسالة خطأ موحّدة)
 *  - نجاح/فشل الاستدعاء وزمن الاستجابة
 */
import { adminDb } from '@/src/lib/firebase-admin';

export interface DriftSample {
  agent: string;
  toolsUsed: string[];
  responseLength: number;
  latencyMs: number;
  success: boolean;
  errorCode?: string;
  ts?: Date;
}

export interface AgentDriftReport {
  agent: string;
  samples: number;
  successRate: number;
  avgLatencyMs: number;
  avgResponseLength: number;
  toolDistribution: Record<string, number>;
  topErrors: Array<{ code: string; count: number }>;
  driftScore: number; // 0..1, كلما اقترب من 1 زاد الانجراف
  windowDays: number;
}

const COLLECTION = 'agent_drift';

export async function recordDriftSample(sample: DriftSample): Promise<void> {
  if (!adminDb?.collection) return;
  try {
    await adminDb.collection(COLLECTION).add({
      ...sample,
      toolsUsed: sample.toolsUsed || [],
      ts: sample.ts || new Date(),
    });
  } catch {
    /* swallow telemetry errors */
  }
}

/**
 * يحسب تقرير الانجراف لوكيل واحد عبر نافذة زمنية (افتراضي 7 أيام).
 * driftScore يعتمد على ثلاثة محاور:
 *  - تراجع نسبة النجاح
 *  - ارتفاع زمن الاستجابة عن خط الأساس
 *  - تركّز شديد على أداة واحدة (سلوك غير معتاد)
 */
export async function buildAgentDriftReport(
  agent: string,
  windowDays: number = 7
): Promise<AgentDriftReport> {
  const empty: AgentDriftReport = {
    agent,
    samples: 0,
    successRate: 1,
    avgLatencyMs: 0,
    avgResponseLength: 0,
    toolDistribution: {},
    topErrors: [],
    driftScore: 0,
    windowDays,
  };
  if (!adminDb?.collection) return empty;

  const since = new Date(Date.now() - windowDays * 86_400_000);
  const snap = await adminDb
    .collection(COLLECTION)
    .where('agent', '==', agent)
    .where('ts', '>=', since)
    .limit(2000)
    .get()
    .catch(() => null);

  if (!snap || snap.empty) return empty;

  let success = 0;
  let totalLatency = 0;
  let totalLen = 0;
  const toolDist: Record<string, number> = {};
  const errCount: Record<string, number> = {};

  snap.forEach((d) => {
    const s = d.data();
    if (s.success) success++;
    totalLatency += s.latencyMs || 0;
    totalLen += s.responseLength || 0;
    (s.toolsUsed || []).forEach((t: string) => {
      toolDist[t] = (toolDist[t] || 0) + 1;
    });
    if (s.errorCode) errCount[s.errorCode] = (errCount[s.errorCode] || 0) + 1;
  });

  const samples = snap.size;
  const successRate = success / samples;
  const avgLatencyMs = totalLatency / samples;
  const avgResponseLength = totalLen / samples;

  // حساب درجة الانجراف
  const successPenalty = Math.max(0, 0.95 - successRate); // كل نقطة تحت 95% تزيد الدرجة
  const latencyPenalty = avgLatencyMs > 8000 ? Math.min(0.4, (avgLatencyMs - 8000) / 20000) : 0;
  const toolValues = Object.values(toolDist);
  const totalToolUsage = toolValues.reduce((a, b) => a + b, 0) || 1;
  const dominantToolShare = Math.max(0, ...toolValues) / totalToolUsage;
  const concentrationPenalty = dominantToolShare > 0.85 ? 0.2 : 0;
  const driftScore = Math.min(1, successPenalty * 2 + latencyPenalty + concentrationPenalty);

  const topErrors = Object.entries(errCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }));

  return {
    agent,
    samples,
    successRate,
    avgLatencyMs,
    avgResponseLength,
    toolDistribution: toolDist,
    topErrors,
    driftScore,
    windowDays,
  };
}

/**
 * يستخرج قائمة الوكلاء المرصودين فعلياً في النافذة الأخيرة.
 */
export async function listObservedAgents(windowDays: number = 7): Promise<string[]> {
  if (!adminDb?.collection) return [];
  const since = new Date(Date.now() - windowDays * 86_400_000);
  const snap = await adminDb
    .collection(COLLECTION)
    .where('ts', '>=', since)
    .limit(5000)
    .get()
    .catch(() => null);
  if (!snap) return [];
  const set = new Set<string>();
  snap.forEach((d) => {
    const a = d.data()?.agent;
    if (a) set.add(a);
  });
  return Array.from(set);
}

/**
 * تقرير شامل لكل الوكلاء المرصودين، مرتّبة بالأكثر انجرافاً.
 */
export async function buildFleetDriftReport(windowDays: number = 7): Promise<AgentDriftReport[]> {
  const agents = await listObservedAgents(windowDays);
  const reports = await Promise.all(agents.map((a) => buildAgentDriftReport(a, windowDays)));
  return reports.sort((a, b) => b.driftScore - a.driftScore);
}
