import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import type { AuditFinding } from '../types';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30_000 });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditObservability(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  const pkg = existsSync('package.json')
    ? JSON.parse(readFileSync('package.json', 'utf8'))
    : { dependencies: {}, devDependencies: {} };
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  // ── Sentry / error tracking ──
  const hasSentry = !!deps['@sentry/nextjs'] || !!deps['@sentry/node'];
  if (!hasSentry) {
    findings.push({
      id: 'OBS-001',
      category: 'observability',
      severity: 'high',
      title: 'لا يوجد نظام تتبع أخطاء (Sentry / Datadog)',
      description: 'بدون error tracking: لا تعرف أن المستخدمين يواجهون مشاكل',
      fix: 'npm i @sentry/nextjs ثم npx @sentry/wizard@latest -i nextjs',
      autoFixable: false,
      references: ['https://docs.sentry.io/platforms/javascript/guides/nextjs/'],
    });
  } else {
    const cfgFiles = ['sentry.client.config.ts', 'sentry.server.config.ts', 'sentry.edge.config.ts'];
    const missing = cfgFiles.filter(f => !existsSync(f));
    if (missing.length > 0) {
      findings.push({
        id: 'OBS-002',
        category: 'observability',
        severity: 'medium',
        title: `إعدادات Sentry ناقصة (${missing.length})`,
        description: 'ملفات إعداد Sentry مفقودة: ' + missing.join(', '),
        fix: 'أنشئ ملفات الإعداد عبر npx @sentry/wizard@latest -i nextjs',
        autoFixable: false,
      });
    }
    // SENTRY_DSN env var
    const envExample = existsSync('.env.example') ? readFileSync('.env.example', 'utf8') : '';
    if (!envExample.includes('SENTRY')) {
      findings.push({
        id: 'OBS-003',
        category: 'observability',
        severity: 'low',
        title: 'متغير SENTRY_DSN غير موثّق في .env.example',
        description: 'المساهمون الجدد لا يعرفون أن المشروع يستخدم Sentry',
        fix: 'أضف NEXT_PUBLIC_SENTRY_DSN= في .env.example',
        autoFixable: true,
      });
    }
  }

  // ── Structured logger (pino / winston) ──
  const hasLogger = !!deps['pino'] || !!deps['winston'] || !!deps['bunyan'];
  if (!hasLogger) {
    findings.push({
      id: 'OBS-004',
      category: 'observability',
      severity: 'medium',
      title: 'لا يوجد logger مهيكل (pino / winston)',
      description: 'console.log لا يدعم structured logs ولا levels ولا redaction',
      fix: 'npm i pino pino-pretty وأنشئ src/lib/logger.ts',
      autoFixable: false,
    });
  } else {
    // Check console.log usage in API routes (should use logger instead)
    const consoleInApi = safeExec(
      `rg -l "console\\.(log|warn|error)" app/api -g "*.ts" 2>/dev/null | wc -l`
    ).trim();
    if (Number(consoleInApi) > 5) {
      findings.push({
        id: 'OBS-005',
        category: 'observability',
        severity: 'low',
        title: `${consoleInApi} ملف API يستخدم console بدلاً من logger`,
        description: 'API routes يجب أن تستخدم pino logger للـ structured JSON logs',
        fix: 'استبدل console.* بـ logger.* المهيكل',
        autoFixable: false,
      });
    }
  }

  // ── OpenTelemetry / tracing ──
  const hasOtel = !!deps['@opentelemetry/api'] || !!deps['@vercel/otel'];
  const hasInstrumentation = existsSync('instrumentation.ts') || existsSync('instrumentation.js');
  if (!hasOtel) {
    findings.push({
      id: 'OBS-006',
      category: 'observability',
      severity: 'low',
      title: 'OpenTelemetry / distributed tracing غير مفعّل',
      description: 'تتبع الطلبات عبر الخدمات (LangChain, sidecars) صعب بدون tracing',
      fix: 'npm i @vercel/otel @opentelemetry/api وأنشئ instrumentation.ts',
      autoFixable: false,
      references: ['https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry'],
    });
  } else if (!hasInstrumentation) {
    findings.push({
      id: 'OBS-007',
      category: 'observability',
      severity: 'medium',
      title: 'OpenTelemetry موجود في dependencies لكن instrumentation.ts مفقود',
      description: 'Next.js يقرأ instrumentation.ts عند البدء لتفعيل OTel',
      fix: 'أنشئ instrumentation.ts في الجذر',
      autoFixable: false,
    });
  }

  // ── Health endpoint ──
  if (!existsSync('app/api/health/route.ts') && !existsSync('app/api/healthz/route.ts')) {
    findings.push({
      id: 'OBS-008',
      category: 'observability',
      severity: 'medium',
      title: 'لا يوجد /api/health endpoint',
      description: 'load balancers و uptime monitors يحتاجون healthcheck endpoint',
      fix: 'أنشئ app/api/health/route.ts يعيد {status:"ok"} مع تحقق من DB',
      autoFixable: true,
    });
  }

  // ── Web Vitals reporting ──
  const hasWebVitals = !!deps['web-vitals'];
  const webVitalsUsage = safeExec(
    `rg -l "onCLS|onFCP|onLCP|onINP|reportWebVitals" app components -g "*.ts" -g "*.tsx" 2>/dev/null`
  ).split('\n').filter(Boolean).length;
  if (hasWebVitals && webVitalsUsage === 0) {
    findings.push({
      id: 'OBS-009',
      category: 'observability',
      severity: 'low',
      title: 'web-vitals مثبت لكن غير مُستخدم',
      description: 'لن تجمع بيانات أداء من المستخدمين الفعليين (RUM)',
      fix: 'أضف Analytics component يستدعي onCLS/onLCP/onINP ويرسلها لـ /api/analytics',
      autoFixable: false,
    });
  }

  // ── AI cost / token tracking ──
  const aiCostTracking = safeExec(
    `rg -l "ai-sdk-cost|langfuse|tokens|cost.*track|usage.*track" app src -g "*.ts" 2>/dev/null`
  ).split('\n').filter(Boolean).length;
  if (aiCostTracking < 3 && (deps['ai'] || deps['@ai-sdk/google'])) {
    findings.push({
      id: 'OBS-010',
      category: 'observability',
      severity: 'high',
      title: 'تتبع تكاليف AI / Tokens غير كافٍ',
      description: 'بدون تتبع: قد تنفق آلاف الدولارات على API بدون أن تعرف لماذا',
      fix: 'استخدم langfuse أو ai-sdk-cost لتتبع كل استدعاء LLM',
      autoFixable: false,
      references: ['https://langfuse.com/docs'],
    });
  }

  // ── Alerting / on-call ──
  const hasAlerting = existsSync('.github/workflows/alerts.yml') ||
    safeExec(`rg -l "PagerDuty|Opsgenie|slack.*alert|alertmanager" . -g "*.yml" -g "*.yaml" 2>/dev/null`).length > 0;
  if (!hasAlerting) {
    findings.push({
      id: 'OBS-011',
      category: 'observability',
      severity: 'low',
      title: 'لا يوجد قنوات تنبيه (Slack/PagerDuty) للإنتاج',
      description: 'إذا انهار الخادم في الليل، لن يعرف أحد قبل الصباح',
      fix: 'أعد Sentry alerts → Slack channel، وأضف uptime monitor خارجي',
      autoFixable: false,
    });
  }

  return findings;
}
