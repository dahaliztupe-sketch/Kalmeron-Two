export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type CheckStatus = 'pass' | 'fail' | 'warning' | 'skip';
export type FixStatus = 'fixed' | 'partial' | 'manual_required' | 'not_applicable';

export interface Device {
  width: number;
  height: number;
  ua: string;
  label: string;
}

export interface CheckResult {
  id: string;
  name: string;
  page: string;
  device: string;
  status: CheckStatus;
  severity: Severity;
  message: string;
  details?: string;
  selector?: string;
  screenshot?: string;
  autoFixable: boolean;
  fixApplied?: boolean;
  fixStatus?: FixStatus;
  duration: number;
  timestamp: string;
}

export interface PageReport {
  url: string;
  device: string;
  loadTimeMs: number;
  checks: CheckResult[];
  passed: number;
  failed: number;
  warnings: number;
  criticalCount: number;
}

export interface QAReport {
  runId: string;
  timestamp: string;
  baseUrl: string;
  totalPages: number;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  criticalIssues: CheckResult[];
  autoFixed: number;
  manualRequired: CheckResult[];
  pageReports: PageReport[];
  summary: string;
  score: number;
}
