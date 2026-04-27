import type { CheckResult } from '../types';
import { AGENTS } from '../config';

const TEST_MESSAGE = 'مرحباً، ما دورك وكيف تساعدني؟';

export async function checkAgents(
  baseUrl: string,
  authToken: string
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const agent of AGENTS) {
    const start = Date.now();

    try {
      const response = await fetch(`${baseUrl}/api/agents/${agent.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: TEST_MESSAGE }],
          stream: false,
        }),
        signal: AbortSignal.timeout(15000),
      });

      const duration = Date.now() - start;

      if (!response.ok) {
        results.push({
          id: `agent_fail_${agent.id}`,
          name: `وكيل "${agent.name}" لا يستجيب`,
          page: `/api/agents/${agent.id}`,
          device: 'server',
          status: 'fail',
          severity: 'critical',
          message: `الوكيل "${agent.name}" (${agent.id}) يُعطي status ${response.status}`,
          autoFixable: false,
          duration,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const data = (await response.json().catch(() => null)) as
        | { content?: string; message?: string; text?: string }
        | null;

      const content = data?.content || data?.message || data?.text || '';
      if (!content || content.length < 10) {
        results.push({
          id: `agent_empty_${agent.id}`,
          name: `وكيل "${agent.name}" يُعيد رداً فارغاً`,
          page: `/api/agents/${agent.id}`,
          device: 'server',
          status: 'fail',
          severity: 'high',
          message: `الوكيل "${agent.name}" يُعيد رداً فارغاً أو قصيراً جداً`,
          autoFixable: false,
          duration,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const hasArabic = /[\u0600-\u06FF]/.test(content);
      if (!hasArabic) {
        results.push({
          id: `agent_lang_${agent.id}`,
          name: `وكيل "${agent.name}" يرد بغير العربية`,
          page: `/api/agents/${agent.id}`,
          device: 'server',
          status: 'warning',
          severity: 'medium',
          message: `الوكيل "${agent.name}" يرد بالإنجليزية بدلاً من العربية`,
          details: content.slice(0, 100),
          autoFixable: false,
          duration,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      if (duration > 10000) {
        results.push({
          id: `agent_slow_${agent.id}`,
          name: `وكيل "${agent.name}" بطيء جداً`,
          page: `/api/agents/${agent.id}`,
          device: 'server',
          status: 'warning',
          severity: 'medium',
          message: `الوكيل "${agent.name}" استغرق ${duration}ms (الحد المقبول: 10000ms)`,
          autoFixable: false,
          duration,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        id: `agent_error_${agent.id}`,
        name: `خطأ في الاتصال بوكيل "${agent.name}"`,
        page: `/api/agents/${agent.id}`,
        device: 'server',
        status: 'fail',
        severity: 'critical',
        message: `خطأ تقني في الوكيل "${agent.name}": ${message}`,
        autoFixable: false,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
}
