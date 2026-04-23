/**
 * أداة تغليف موحّدة (instrumentation wrapper) لربط أي وكيل بكلٍ من:
 *   - Drift Detector (drift-detector.ts) — لقياس الانجراف عبر الزمن.
 *   - Langfuse (langfuse.ts)            — لتتبّع كل استدعاء كـ trace.
 *
 * الاستخدام داخل وكيل:
 *   return instrumentAgent('cfo_agent', async () => { ...invoke logic... });
 *
 * أي وكيل يلتفّ بهذه الدالة يبدأ فوراً بتغذية لوحة الحوكمة.
 */
import { recordDriftSample } from './drift-detector';
import { logAgentGeneration } from './langfuse';
import { recordInvocation } from '@/src/ai/organization/compliance/monitor';
import { addEntity, isKnowledgeGraphEnabled } from '@/src/lib/memory/knowledge-graph';
import { updateOKRProgress } from '@/src/lib/okr/okr-store';

export interface InstrumentOptions {
  model?: string;
  input?: any;
  toolsUsed?: string[];
  trace?: any;
  /** اختياري: تسجيل المخرجات تلقائياً في الدماغ المشترك */
  userId?: string;
  /** اختياري: نوع الكيان الذي ينتج عن نجاح الاستدعاء */
  findingType?: string;
  /** اختياري: ربط النتيجة بنتيجة رئيسية */
  okrUpdate?: { okrId: string; krIndex: number; delta?: number; current?: number };
}

export async function instrumentAgent<T>(
  agentName: string,
  exec: () => Promise<T>,
  opts: InstrumentOptions = {}
): Promise<T> {
  const start = Date.now();
  let success = true;
  let errorCode: string | undefined;
  let result: T | undefined;
  try {
    result = await exec();
    return result;
  } catch (e: any) {
    success = false;
    errorCode = e?.code || e?.name || 'unknown_error';
    throw e;
  } finally {
    const latencyMs = Date.now() - start;
    const responseLength = typeof result === 'string' ? result.length : JSON.stringify(result || '').length;
    void recordDriftSample({
      agent: agentName,
      toolsUsed: opts.toolsUsed || [],
      responseLength,
      latencyMs,
      success,
      errorCode,
    });
    try {
      recordInvocation(agentName, latencyMs, 0, success ? undefined : errorCode);
    } catch { /* never break call site */ }

    // Phase 6: optional auto-tracking of OKR + knowledge graph (best-effort, never throws)
    if (success && opts.userId && opts.findingType) {
      void (async () => {
        try {
          if (await isKnowledgeGraphEnabled()) {
            await addEntity(opts.userId!, opts.findingType!, {
              source: agentName,
              summary: typeof result === 'string' ? result.slice(0, 500) : undefined,
              latencyMs,
              createdAt: new Date().toISOString(),
            });
          }
        } catch { /* swallow */ }
      })();
    }
    if (success && opts.okrUpdate) {
      void (async () => {
        try {
          const next = opts.okrUpdate!.current
            ?? (opts.okrUpdate!.delta ? undefined : undefined);
          if (typeof next === 'number') {
            await updateOKRProgress(opts.okrUpdate!.okrId, opts.okrUpdate!.krIndex, next);
          } else if (typeof opts.okrUpdate!.delta === 'number') {
            // delta-based: requires read-modify-write inside the store layer
            const { getOKR } = await import('@/src/lib/okr/okr-store');
            const okr: any = await getOKR(opts.okrUpdate!.okrId);
            const cur = okr?.keyResults?.[opts.okrUpdate!.krIndex]?.current || 0;
            await updateOKRProgress(opts.okrUpdate!.okrId, opts.okrUpdate!.krIndex, cur + opts.okrUpdate!.delta);
          }
        } catch { /* swallow */ }
      })();
    }

    void logAgentGeneration({
      trace: opts.trace,
      agent: agentName,
      model: opts.model || 'unknown',
      input: opts.input,
      output: result,
      latencyMs,
      success,
    });
  }
}
