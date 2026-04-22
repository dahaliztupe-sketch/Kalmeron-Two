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

export interface InstrumentOptions {
  model?: string;
  input?: any;
  toolsUsed?: string[];
  trace?: any;
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
