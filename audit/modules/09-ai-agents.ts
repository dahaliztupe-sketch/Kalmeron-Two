import type { AuditFinding } from '../types';
import { config } from '../config';

const AGENTS = [
  'general', 'cfo', 'legal', 'marketing', 'sales', 'hr',
  'operations', 'product', 'investor', 'customer-voice',
  'idea-validator', 'plan-builder', 'mistake-shield',
  'success-museum', 'opportunity-radar', 'real-estate',
];

export async function auditAIAgents(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const BASE_URL = config.baseUrl;
  const AUTH_TOKEN = config.authToken ?? '';

  for (const agent of AGENTS) {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/api/agents/${agent}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'مرحباً، عرّف بنفسك في جملة واحدة.' }],
          stream: false,
        }),
        signal: AbortSignal.timeout(12_000),
      });

      const duration = Date.now() - start;

      if (!response.ok && response.status !== 401) {
        findings.push({
          id: `AI-${agent.toUpperCase().replace(/-/g, '_')}-DOWN`,
          category: 'ai-agents',
          severity: 'critical',
          title: `وكيل "${agent}" لا يستجيب (${response.status})`,
          description: `API route /api/agents/${agent} يُعطي ${response.status}`,
          location: `app/api/agents/${agent}/route.ts`,
          fix: 'تحقق من الملف وأضف stub response عند غياب GEMINI_API_KEY',
          autoFixable: false,
        });
        continue;
      }

      if (duration > 10_000) {
        findings.push({
          id: `AI-${agent.toUpperCase().replace(/-/g, '_')}-SLOW`,
          category: 'ai-agents',
          severity: 'medium',
          title: `وكيل "${agent}" بطيء: ${duration}ms`,
          description: 'استجابة > 10 ثوانٍ تُزعج المستخدم',
          fix: 'تحقق من model tier وأضف timeout + fallback',
          autoFixable: false,
        });
      }

      if (response.ok && AUTH_TOKEN) {
        const data = await response.json().catch(() => null);
        const content = (data?.content ?? data?.message ?? data?.text ?? data?.response ?? '') as string;
        if (content && !/[\u0600-\u06FF]/.test(content)) {
          findings.push({
            id: `AI-${agent.toUpperCase().replace(/-/g, '_')}-LANG`,
            category: 'ai-agents',
            severity: 'high',
            title: `وكيل "${agent}" لا يرد بالعربية`,
            description: 'الوكيل يرد بالإنجليزية بدلاً من العربية',
            location: `src/ai/agents/${agent}/`,
            fix: 'تحقق من system prompt وتأكد أنه يطلب الرد بالعربية صراحةً',
            autoFixable: false,
          });
        }
      }
    } catch (error: any) {
      findings.push({
        id: `AI-${agent.toUpperCase().replace(/-/g, '_')}-ERROR`,
        category: 'ai-agents',
        severity: 'critical',
        title: `خطأ في الوكيل "${agent}": ${String(error?.message ?? error).slice(0, 80)}`,
        description: 'فشل في الاتصال بالوكيل (الخادم غير مشغّل أو timeout)',
        location: `app/api/agents/${agent}/route.ts`,
        fix: 'تحقق من الملف وأضف error handling. تأكد أن الخادم مشغّل على QA_BASE_URL',
        autoFixable: false,
      });
    }
  }

  return findings;
}
