import type { Category } from './types';

export interface AuditConfig {
  baseUrl: string;
  authToken?: string;
  modules?: Category[];
  reportsDir: string;
  failOnCritical: boolean;
  lighthouseTimeout: number;
}

function parseModules(raw: string | undefined): Category[] | undefined {
  if (!raw) return undefined;
  const valid: Category[] = [
    'code-quality', 'security', 'authentication', 'frontend', 'backend',
    'storage', 'performance', 'seo', 'ai-agents', 'business',
  ];
  const mapAlias: Record<string, Category> = {
    auth: 'authentication',
    code: 'code-quality',
    api: 'backend',
    fe: 'frontend',
    be: 'backend',
    perf: 'performance',
    agents: 'ai-agents',
    biz: 'business',
  };
  return raw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .map(s => (valid.includes(s as Category) ? (s as Category) : mapAlias[s]))
    .filter((m): m is Category => Boolean(m));
}

export const config: AuditConfig = {
  baseUrl: process.env.QA_BASE_URL ?? 'http://localhost:5000',
  authToken: process.env.QA_AUTH_TOKEN,
  modules: parseModules(process.env.QA_MODULES),
  reportsDir: 'audit/reports',
  failOnCritical: process.env.QA_FAIL_ON_CRITICAL !== 'false',
  lighthouseTimeout: Number(process.env.QA_LIGHTHOUSE_TIMEOUT ?? 120000),
};
