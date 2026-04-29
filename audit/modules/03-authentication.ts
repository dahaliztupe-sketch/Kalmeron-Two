import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import type { AuditFinding } from '../types';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30_000 });
  } catch (err: any) {
    return err.stdout?.toString?.() ?? '';
  }
}

export async function auditAuthentication(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── Firebase Admin SDK ──
  const adminFiles = [
    'src/lib/firebase-admin.ts',
    'lib/firebase-admin.ts',
    'src/lib/firebase/admin.ts',
  ];
  const adminFile = adminFiles.find(existsSync);

  if (!adminFile) {
    findings.push({
      id: 'AUTH-001',
      category: 'authentication',
      severity: 'critical',
      title: 'Firebase Admin SDK غير موجود',
      description: 'ملف firebase-admin.ts مفقود — المصادقة server-side لن تعمل',
      fix: 'أنشئ src/lib/firebase-admin.ts مع initializeApp صحيح',
      autoFixable: false,
    });
  } else {
    const content = readFileSync(adminFile, 'utf8');

    if (!content.includes('getApps()') && !content.includes('getApp(')) {
      findings.push({
        id: 'AUTH-002',
        category: 'authentication',
        severity: 'high',
        title: 'Firebase Admin قد يُهيَّأ مرات متعددة',
        description: 'بدون فحص getApps() قد ينهار التطبيق عند Hot Reload',
        location: adminFile,
        fix: 'استخدم: if (!getApps().length) { initializeApp(...) }',
        autoFixable: true,
      });
    }

    if (
      !content.includes('FIREBASE_ADMIN_PRIVATE_KEY') &&
      !content.includes('process.env') &&
      !content.includes('applicationDefault')
    ) {
      findings.push({
        id: 'AUTH-003',
        category: 'authentication',
        severity: 'critical',
        title: 'Firebase Admin credentials قد تكون hard-coded',
        description: 'بيانات الاعتماد ليست من env vars',
        location: adminFile,
        fix: 'استخدم process.env.FIREBASE_ADMIN_PRIVATE_KEY أو applicationDefault()',
        autoFixable: false,
      });
    }
  }

  // ── AuthContext ──
  const authContextFiles = [
    'contexts/AuthContext.tsx',
    'src/contexts/AuthContext.tsx',
    'context/AuthContext.tsx',
    'contexts/auth-context.tsx',
  ];
  const authContext = authContextFiles.find(existsSync);

  if (!authContext) {
    findings.push({
      id: 'AUTH-004',
      category: 'authentication',
      severity: 'critical',
      title: 'AuthContext غير موجود',
      description: 'لا يوجد Context لإدارة حالة المصادقة على العميل',
      fix: 'أنشئ contexts/AuthContext.tsx',
      autoFixable: false,
    });
  }

  // ── Protected routes via proxy.ts ──
  const proxyFile = ['proxy.ts', 'middleware.ts'].find(existsSync);
  if (!proxyFile) {
    findings.push({
      id: 'AUTH-006',
      category: 'authentication',
      severity: 'critical',
      title: 'proxy.ts / middleware.ts غير موجود',
      description: 'لا يوجد Edge Middleware لحماية المسارات',
      fix: 'أنشئ proxy.ts (Next.js 16) أو middleware.ts مع AuthGuard',
      autoFixable: false,
    });
  } else {
    const proxyContent = readFileSync(proxyFile, 'utf8');
    const criticalPaths = ['/dashboard', '/admin', '/billing', '/settings'];

    for (const path of criticalPaths) {
      if (!proxyContent.includes(path)) {
        findings.push({
          id: `AUTH-005-${path.replace('/', '')}`,
          category: 'authentication',
          severity: 'high',
          title: `المسار "${path}" قد لا يكون محمياً`,
          description: `لم يُعثر على "${path}" في قائمة المسارات المحمية في ${proxyFile}`,
          location: proxyFile,
          fix: `أضف "${path}" لقائمة PROTECTED_PATHS في ${proxyFile}`,
          autoFixable: true,
        });
      }
    }
  }

  // ── Session security ──
  if (authContext) {
    try {
      const authContent = readFileSync(authContext, 'utf8');
      if (authContent.includes('localStorage') && !authContent.includes('httpOnly')) {
        findings.push({
          id: 'AUTH-007',
          category: 'authentication',
          severity: 'medium',
          title: 'Session token محتمل في localStorage',
          description: 'تخزين tokens في localStorage عُرضة لـ XSS',
          fix: 'استخدم httpOnly cookies أو Firebase Auth onAuthStateChanged فقط',
          autoFixable: false,
          references: ['https://owasp.org/www-community/HttpOnly'],
        });
      }
    } catch { /* */ }
  }

  // ── Token verification coverage in API routes ──
  const apiRoutesOut = safeExec('find app/api -name "route.ts" 2>/dev/null');
  const apiRoutes = apiRoutesOut.split('\n').filter(Boolean).length;
  const verifyOut = safeExec(
    'rg -l "verifyIdToken|getAuthenticatedUser|withAuth|requireAuth" app/api 2>/dev/null'
  );
  const verifyCount = verifyOut.split('\n').filter(Boolean).length;

  if (apiRoutes > 0 && verifyCount < apiRoutes * 0.6) {
    findings.push({
      id: 'AUTH-008',
      category: 'authentication',
      severity: 'high',
      title: `${apiRoutes - verifyCount} من ${apiRoutes} API route بدون تحقق هوية واضح`,
      description: 'كثير من API routes لا تستدعي verifyIdToken أو withAuth',
      fix: 'أضف getAuthenticatedUser() أو withAuth() لكل route محمي',
      autoFixable: false,
    });
  }

  return findings;
}
