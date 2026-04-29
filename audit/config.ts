import type { Category } from './types';

export interface AuditConfig {
  baseUrl: string;
  authToken?: string;
  modules?: Category[];
  reportsDir: string;
  failOnCritical: boolean;
  lighthouseTimeout: number;
}

const ALL_CATEGORIES: Category[] = [
  'code-quality', 'security', 'authentication', 'frontend', 'backend',
  'storage', 'performance', 'seo', 'ai-agents', 'business',
  'accessibility', 'i18n', 'observability', 'testing',
  'devops', 'documentation', 'payments', 'pwa-mobile',
  'data-privacy', 'benchmarks',
];

function parseModules(raw: string | undefined): Category[] | undefined {
  if (!raw) return undefined;
  const mapAlias: Record<string, Category> = {
    auth: 'authentication',
    code: 'code-quality',
    api: 'backend',
    fe: 'frontend',
    be: 'backend',
    perf: 'performance',
    agents: 'ai-agents',
    biz: 'business',
    a11y: 'accessibility',
    obs: 'observability',
    test: 'testing',
    ci: 'devops',
    docs: 'documentation',
    pay: 'payments',
    pwa: 'pwa-mobile',
    mobile: 'pwa-mobile',
    privacy: 'data-privacy',
    gdpr: 'data-privacy',
    bench: 'benchmarks',
    benchmark: 'benchmarks',
    compare: 'benchmarks',
  };
  return raw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .map(s => (ALL_CATEGORIES.includes(s as Category) ? (s as Category) : mapAlias[s]))
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
