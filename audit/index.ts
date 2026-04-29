export { runFullAudit } from './runner';
export { calculateScore, getGrade } from './scorer';
export { generateHTMLReport } from './reporter';
export { config } from './config';
export type {
  AuditFinding,
  AuditReport,
  ModuleResult,
  Category,
  Severity,
} from './types';

export { auditCodeQuality } from './modules/01-code-quality';
export { auditSecurity } from './modules/02-security';
export { auditAuthentication } from './modules/03-authentication';
export { auditFrontend } from './modules/04-frontend';
export { auditBackend } from './modules/05-backend';
export { auditStorage } from './modules/06-storage';
export { auditPerformance } from './modules/07-performance';
export { auditSEO } from './modules/08-seo';
export { auditAIAgents } from './modules/09-ai-agents';
export { auditBusiness } from './modules/10-business';

export { applyAutoFixes } from './fixers/auto-fixer';
export { generateFixSuggestions } from './fixers/fix-suggestions';
