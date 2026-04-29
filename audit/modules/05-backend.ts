import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import type { AuditFinding } from '../types';

function safeExec(cmd: string, opts: { timeout?: number } = {}): string {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: opts.timeout ?? 30_000,
    });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditBackend(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── Zod input validation coverage ──
  const apiRoutesRaw = safeExec('find app/api -name "route.ts" 2>/dev/null');
  const apiRoutes = apiRoutesRaw.split('\n').filter(Boolean);

  let zodCount = 0;
  let totalPOST = 0;

  for (const route of apiRoutes) {
    if (!existsSync(route)) continue;
    const content = readFileSync(route, 'utf8');
    if (
      content.includes('export async function POST') ||
      content.includes('export async function PUT') ||
      content.includes('export async function PATCH')
    ) {
      totalPOST++;
      if (
        content.includes('zod') ||
        content.includes('z.object') ||
        content.includes('z.string') ||
        content.includes('.parse(')
      ) {
        zodCount++;
      }
    }
  }

  if (totalPOST > 0 && zodCount < totalPOST * 0.7) {
    findings.push({
      id: 'BE-001',
      category: 'backend',
      severity: 'high',
      title: `${totalPOST - zodCount} من ${totalPOST} POST/PUT/PATCH route بدون Zod validation`,
      description: 'Input غير مُتحقق منه يفتح باب لـ injection و crashes',
      fix: 'أضف zod schema لكل POST/PUT/PATCH route',
      autoFixable: false,
      references: ['https://zod.dev/'],
    });
  }

  // ── Webhook signature verification ──
  const webhookFiles = [
    'app/api/webhooks/stripe/route.ts',
    'app/api/webhooks/route.ts',
    'app/api/stripe/webhook/route.ts',
  ];

  for (const webhookFile of webhookFiles) {
    if (existsSync(webhookFile)) {
      const content = readFileSync(webhookFile, 'utf8');
      if (
        !content.includes('constructEvent') &&
        !content.includes('signature') &&
        !content.includes('webhook_secret') &&
        !content.includes('WEBHOOK_SECRET')
      ) {
        findings.push({
          id: `BE-002-${webhookFile.replace(/[/]/g, '-')}`,
          category: 'backend',
          severity: 'critical',
          title: 'Webhook بدون signature verification',
          description: `${webhookFile}: Webhook يقبل أي طلب بدون تحقق من المصدر`,
          location: webhookFile,
          fix: 'أضف stripe.webhooks.constructEvent() مع STRIPE_WEBHOOK_SECRET',
          autoFixable: false,
          references: ['https://stripe.com/docs/webhooks/best-practices'],
        });
      }
    }
  }

  // ── try/catch coverage in API routes ──
  let routesWithoutTryCatch = 0;
  for (const route of apiRoutes) {
    if (!existsSync(route)) continue;
    const content = readFileSync(route, 'utf8');
    if (!content.includes('try {') && !content.includes('try{')) {
      routesWithoutTryCatch++;
    }
  }
  if (routesWithoutTryCatch > 5) {
    findings.push({
      id: 'BE-003',
      category: 'backend',
      severity: 'medium',
      title: `${routesWithoutTryCatch} API route بدون try/catch`,
      description: 'أخطاء unhandled قد تُظهر stack traces للمستخدم',
      fix: 'أضف try/catch لكل API route مع NextResponse.json({error: ...}, {status: 500})',
      autoFixable: false,
    });
  }

  // ── Python sidecars health ──
  const sidecars = [
    { name: 'PDF Worker', port: 8000, slug: 'pdf-worker' },
    { name: 'Egypt Calc', port: 8008, slug: 'egypt-calc' },
    { name: 'LLM Judge', port: 8080, slug: 'llm-judge' },
    { name: 'Embeddings Worker', port: 8099, slug: 'embeddings-worker' },
  ];

  for (const sidecar of sidecars) {
    try {
      execSync(
        `curl -s --max-time 3 -o /dev/null -w "%{http_code}" http://localhost:${sidecar.port}/health`,
        { encoding: 'utf8', timeout: 5_000 }
      );
    } catch {
      findings.push({
        id: `BE-SIDECAR-${sidecar.port}`,
        category: 'backend',
        severity: 'high',
        title: `${sidecar.name} (port ${sidecar.port}) لا يستجيب`,
        description: `خدمة Python ${sidecar.name} غير مشغّلة أو تتعطل`,
        fix: `شغّل: cd services/${sidecar.slug} && uvicorn main:app --port ${sidecar.port}`,
        autoFixable: false,
      });
    }
  }

  // ── CORS wildcard ──
  const corsRaw = safeExec(
    `rg -n "Access-Control-Allow-Origin" app/api -g "*.ts" 2>/dev/null`
  );
  const corsWildcard = corsRaw
    .split('\n')
    .filter(line => line.includes("'*'") || line.includes('"*"'))
    .length;

  if (corsWildcard > 0) {
    findings.push({
      id: 'BE-004',
      category: 'backend',
      severity: 'high',
      title: 'CORS wildcard (*) في production',
      description: 'Allow-Origin: * يسمح لأي موقع بالوصول لـ API',
      fix: 'حدد domains صريحة: https://kalmeron.ai, https://kalmeron-two.vercel.app',
      autoFixable: false,
      references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'],
    });
  }

  return findings;
}
