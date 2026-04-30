/**
 * LLM Providers audit — connectivity & configuration check for the
 * multi-provider stack (Gemini, OpenRouter, Groq, Anthropic, OpenAI).
 *
 * For each provider we record one finding describing whether it is enabled
 * (env key present), and — when configured — whether a lightweight HEAD/GET
 * probe to the public health URL succeeds. Probes are skipped in CI by
 * setting `KALMERON_AUDIT_SKIP_NET=1`.
 */
import type { AuditFinding } from '../types';

interface Probe {
  id: string;
  envKey: string;
  // Optional public probe URL to verify the network path; HEAD when possible.
  probeUrl?: string;
  /** Used only for the human-friendly finding title. */
  display: string;
}

const PROBES: Probe[] = [
  { id: 'gemini',     envKey: 'GEMINI_API_KEY',         display: 'Google Gemini',
    probeUrl: 'https://generativelanguage.googleapis.com/v1beta/models' },
  { id: 'gemini',     envKey: 'GOOGLE_GENERATIVE_AI_API_KEY', display: 'Google Gemini (Studio key)' },
  { id: 'openrouter', envKey: 'OPENROUTER_API_KEY',     display: 'OpenRouter',
    probeUrl: 'https://openrouter.ai/api/v1/models' },
  { id: 'groq',       envKey: 'GROQ_API_KEY',           display: 'Groq',
    probeUrl: 'https://api.groq.com/openai/v1/models' },
  { id: 'anthropic',  envKey: 'ANTHROPIC_API_KEY',      display: 'Anthropic',
    probeUrl: 'https://api.anthropic.com/v1/messages' },
  { id: 'openai',     envKey: 'OPENAI_API_KEY',         display: 'OpenAI',
    probeUrl: 'https://api.openai.com/v1/models' },
];

async function reachable(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    // HEAD fails on some endpoints (Anthropic) so use GET with a tiny range.
    const res = await fetch(url, { method: 'GET', signal: ctrl.signal });
    clearTimeout(t);
    // Even 401/403 means the host is up — we just don't have credentials in
    // this audit context. That's still "reachable" for our purposes.
    return res.status > 0 && res.status < 600;
  } catch {
    return false;
  }
}

export async function auditLLMProviders(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const skipNet = process.env.KALMERON_AUDIT_SKIP_NET === '1';
  const enabled = PROBES.filter((p) => Boolean(process.env[p.envKey]));

  if (enabled.length === 0) {
    findings.push({
      id: 'LLM-PROV-NONE',
      category: 'ai-agents',
      severity: 'high',
      title: 'لا يوجد أي مزود LLM مُهيأ',
      description:
        'لم يتم ضبط أي من مفاتيح GEMINI_API_KEY / OPENROUTER_API_KEY / GROQ_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY. ' +
        'الواجهة ستعمل في وضع stub فقط.',
      autoFixable: false,
      fix: 'أضف على الأقل مفتاحاً واحداً لمزود مجاني (مثلاً OPENROUTER_API_KEY) في .env.local.',
    });
    return findings;
  }

  findings.push({
    id: 'LLM-PROV-ENABLED',
    category: 'ai-agents',
    severity: 'info',
    title: `عدد المزودين النشطين: ${enabled.length}`,
    description: `المزودون المُهيؤون: ${enabled.map((p) => p.display).join('، ')}`,
    autoFixable: false,
  });

  if (skipNet) return findings;

  // Probe each enabled provider in parallel.
  const probes = await Promise.all(
    enabled
      .filter((p) => p.probeUrl)
      .map(async (p) => ({ probe: p, ok: await reachable(p.probeUrl!) })),
  );
  for (const { probe, ok } of probes) {
    if (!ok) {
      findings.push({
        id: `LLM-PROV-${probe.id.toUpperCase()}-UNREACHABLE`,
        category: 'ai-agents',
        severity: 'medium',
        title: `لا يمكن الوصول إلى ${probe.display}`,
        description: `فشل فحص الاتصال إلى ${probe.probeUrl}. تحقق من اتصال الإنترنت أو إعدادات الـ proxy.`,
        autoFixable: false,
      });
    }
  }
  return findings;
}
