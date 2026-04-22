/**
 * Arize Phoenix client — متعمّداً No-Op في الـ JS.
 * Phoenix رسمياً مكتبة Python فقط (`arize-phoenix`)؛ لا توجد حزمة
 * `@arize-ai/phoenix` على npm. يبقى الكائن متوفّراً كي تستهلكه شيفرات
 * أخرى دون انكسار، مع إمكانية تصدير اللوجز إلى مجمع Phoenix الخاص بك
 * عبر OpenTelemetry لاحقاً (نقطة تكامل موضّحة أدناه).
 */
const PHOENIX_ENDPOINT = process.env.PHOENIX_ENDPOINT; // مثل http://localhost:6006
const isEnabled = Boolean(PHOENIX_ENDPOINT);

export const phoenix = {
  log: async (params: any) => {
    if (!isEnabled) return;
    // نقطة تكامل: إرسال HTTP بسيط لـ Phoenix collector.
    try {
      await fetch(`${PHOENIX_ENDPOINT}/v1/traces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  },
  evaluate: async (_params: any) => ({ accuracy: null }),
  getAlerts: async (_params: any) => [],
};

export const isPhoenixEnabled = isEnabled;

export async function logAgentInteraction(
  agentName: string,
  userId: string,
  input: string,
  output: string,
  metadata: Record<string, any> = {}
) {
  await phoenix.log({
    agentName,
    userId,
    input,
    output,
    timestamp: new Date().toISOString(),
    metadata,
  });
}
