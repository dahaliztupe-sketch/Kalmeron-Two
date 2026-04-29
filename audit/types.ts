export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Category =
  | 'code-quality' | 'security' | 'authentication'
  | 'frontend' | 'backend' | 'storage'
  | 'performance' | 'seo' | 'ai-agents' | 'business';

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
}
