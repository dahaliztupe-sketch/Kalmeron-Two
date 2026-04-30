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
  BenchmarkContext,
  BenchmarkSummary,
} from './types';

export { auditCodeQuality }    from './modules/01-code-quality';
export { auditSecurity }       from './modules/02-security';
export { auditAuthentication } from './modules/03-authentication';
export { auditFrontend }       from './modules/04-frontend';
export { auditBackend }        from './modules/05-backend';
export { auditStorage }        from './modules/06-storage';
export { auditPerformance }    from './modules/07-performance';
export { auditSEO }            from './modules/08-seo';
export { auditAIAgents }       from './modules/09-ai-agents';
export { auditBusiness }       from './modules/10-business';
export { auditAccessibility }  from './modules/11-accessibility';
export { auditI18n }           from './modules/12-i18n';
export { auditObservability }  from './modules/13-observability';
export { auditTesting }        from './modules/14-testing';
export { auditDevOps }         from './modules/15-devops';
export { auditDocumentation }  from './modules/16-documentation';
export { auditPayments }       from './modules/17-payments';
export { auditPwaMobile }      from './modules/18-pwa-mobile';
export { auditDataPrivacy }    from './modules/19-data-privacy';
export { auditBenchmarks }     from './modules/20-benchmarks';
export { auditLLMProviders }  from './modules/21-llm-providers';

export { applyAutoFixes }       from './fixers/auto-fixer';
export { generateFixSuggestions } from './fixers/fix-suggestions';
