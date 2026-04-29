export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Category =
  | 'code-quality' | 'security' | 'authentication'
  | 'frontend' | 'backend' | 'storage'
  | 'performance' | 'seo' | 'ai-agents' | 'business'
  | 'accessibility' | 'i18n' | 'observability' | 'testing'
  | 'devops' | 'documentation' | 'payments' | 'pwa-mobile'
  | 'data-privacy' | 'benchmarks';

export interface AuditFinding {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  location?: string;
  evidence?: string;
  fix?: string;
  autoFixable: boolean;
  references?: string[];
  benchmark?: BenchmarkContext;
}

export interface BenchmarkContext {
  competitor: string;
  competitorUrl?: string;
  theyHave: string;
  weHave: string;
  gap: 'missing' | 'partial' | 'behind';
  impact: 'critical' | 'high' | 'medium' | 'low';
}

export interface ModuleResult {
  module: string;
  category: Category;
  score: number;
  findings: AuditFinding[];
  duration: number;
  passed: number;
  failed: number;
}

export interface BenchmarkSummary {
  competitor: string;
  competitorUrl?: string;
  totalChecks: number;
  weHave: number;
  weMiss: number;
  parityPct: number;
  notes: string;
}

export interface AuditReport {
  id: string;
  timestamp: string;
  projectName: string;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  modules: ModuleResult[];
  criticalCount: number;
  autoFixCount: number;
  manualFixCount: number;
  topPriorities: AuditFinding[];
  summary: string;
  benchmarks?: BenchmarkSummary[];
}
