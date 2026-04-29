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

export async function auditDataPrivacy(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── Privacy policy page ──
  const privacyPaths = [
    'app/privacy/page.tsx',
    'app/(marketing)/privacy/page.tsx',
    'app/legal/privacy/page.tsx',
    'app/privacy-policy/page.tsx',
  ];
  if (!privacyPaths.some(existsSync)) {
    findings.push({
      id: 'PRIV-001',
      category: 'data-privacy',
      severity: 'critical',
      title: 'صفحة سياسة الخصوصية مفقودة',
      description: 'مطلوبة قانونياً (GDPR, PDPL مصر، CCPA) — وجوداً قبل أي جمع بيانات',
      fix: 'أنشئ app/privacy/page.tsx تشرح: ما البيانات، لماذا، كم، حقوق المستخدم',
      autoFixable: false,
      references: ['https://gdpr.eu/privacy-notice/'],
    });
  }

  // ── Terms of service ──
  const termsPaths = [
    'app/terms/page.tsx',
    'app/(marketing)/terms/page.tsx',
    'app/legal/terms/page.tsx',
    'app/terms-of-service/page.tsx',
  ];
  if (!termsPaths.some(existsSync)) {
    findings.push({
      id: 'PRIV-002',
      category: 'data-privacy',
      severity: 'high',
      title: 'صفحة شروط الاستخدام مفقودة',
      description: 'بدون terms: لا يحق لك تعليق حسابات أو الحد من المسؤولية',
      fix: 'أنشئ app/terms/page.tsx',
      autoFixable: false,
    });
  }

  // ── Consent / Cookie banner ──
  const consentRaw = safeExec(
    `rg -l "CookieBanner|ConsentBanner|cookie.*consent|cookiesAccepted|Consent" app components 2>/dev/null`
  );
  if (!consentRaw.trim()) {
    findings.push({
      id: 'PRIV-003',
      category: 'data-privacy',
      severity: 'high',
      title: 'لا يوجد Consent / Cookie Banner',
      description: 'مطلوب قانونياً قبل تفعيل analytics وأي tracking',
      fix: 'أنشئ components/CookieBanner.tsx مع خيارات: قبول الكل / رفض / إدارة',
      autoFixable: false,
      references: ['https://gdpr.eu/cookies/'],
    });
  } else {
    // Granular consent check
    const granular = safeExec(
      `rg -n "analytics|marketing|functional|necessary" app components -g "*.tsx" 2>/dev/null | wc -l`
    ).trim();
    if (Number(granular) < 5) {
      findings.push({
        id: 'PRIV-004',
        category: 'data-privacy',
        severity: 'medium',
        title: 'Consent banner قد يكون "all-or-nothing"',
        description: 'GDPR يطلب consent دقيق لكل فئة (analytics/marketing/functional)',
        fix: 'اعرض toggles منفصلة لكل فئة + احفظ الاختيارات في localStorage / cookie',
        autoFixable: false,
      });
    }
  }

  // ── Data export / DSR ──
  const dsrRoutes = safeExec(
    `rg -l "data.*export|export.*data|user.*download|deleteAccount|delete.*user.*data" app/api 2>/dev/null`
  ).split('\n').filter(Boolean).length;
  if (dsrRoutes < 1) {
    findings.push({
      id: 'PRIV-005',
      category: 'data-privacy',
      severity: 'high',
      title: 'لا يوجد Data Subject Rights endpoints (export / delete)',
      description: 'GDPR Article 15 (الوصول) و 17 (المحو) إجباريان',
      fix: 'أنشئ /api/account/export-data و /api/account/delete-account',
      autoFixable: false,
      references: ['https://gdpr.eu/right-to-be-forgotten/'],
    });
  }

  // ── Data retention policy ──
  const retentionRaw = safeExec(
    `rg -l "retention|TTL|deleteAfter|expireAt|cleanup" app src services -g "*.ts" 2>/dev/null`
  ).split('\n').filter(Boolean).length;
  if (retentionRaw < 2) {
    findings.push({
      id: 'PRIV-006',
      category: 'data-privacy',
      severity: 'medium',
      title: 'لا توجد سياسة retention / TTL واضحة',
      description: 'تخزين بيانات إلى ما لا نهاية يخالف "data minimization" في GDPR',
      fix: 'حدد TTL لـ logs, sessions, AI conversations وأنشئ cron للحذف',
      autoFixable: false,
    });
  }

  // ── PII in logs ──
  const piiInLogs = Number(safeExec(
    `rg -n "console\\.(log|info).*(email|password|phone|token|address)" app src -g "*.ts" 2>/dev/null | wc -l`
  ).trim() || '0');
  if (piiInLogs > 0) {
    findings.push({
      id: 'PRIV-007',
      category: 'data-privacy',
      severity: 'high',
      title: `${piiInLogs} حالة تسجيل محتمل لـ PII في console`,
      description: 'logs قد تحتوي على email/password/token — مخاطر تسرب',
      fix: 'استخدم pino مع redaction: { paths: ["email","password","token"] }',
      autoFixable: false,
      references: ['https://github.com/pinojs/pino/blob/master/docs/redaction.md'],
    });
  }

  // ── Encryption at rest mention ──
  const encryptionMention = safeExec(
    `rg -l "encrypt|cipher|AES|crypto\\." app src services -g "*.ts" 2>/dev/null`
  ).split('\n').filter(Boolean).length;
  if (encryptionMention < 1) {
    findings.push({
      id: 'PRIV-008',
      category: 'data-privacy',
      severity: 'low',
      title: 'لا يوجد encryption صريح في الكود',
      description: 'البيانات الحساسة (API keys, tokens) قد تُحفظ كنص عادي',
      fix: 'استخدم Cloud KMS / Firebase Secret Manager للأسرار، شفّر PII الحساس قبل التخزين',
      autoFixable: false,
    });
  }

  // ── Third-party trackers ──
  const trackers = [
    { name: 'Google Analytics', pattern: 'gtag|google-analytics|GA_MEASUREMENT' },
    { name: 'Facebook Pixel', pattern: 'fbq|facebook.*pixel' },
    { name: 'Hotjar', pattern: 'hotjar' },
    { name: 'Mixpanel', pattern: 'mixpanel' },
  ];
  for (const t of trackers) {
    const found = safeExec(
      `rg -l "${t.pattern}" app components src 2>/dev/null`
    ).split('\n').filter(Boolean).length;
    if (found > 0) {
      // Check if loaded conditionally on consent
      const conditional = safeExec(
        `rg -l "consent.*${t.pattern}|${t.pattern}.*consent" app components 2>/dev/null`
      ).split('\n').filter(Boolean).length;
      if (conditional === 0) {
        findings.push({
          id: `PRIV-TRACKER-${t.name.replace(/\s/g, '')}`,
          category: 'data-privacy',
          severity: 'high',
          title: `${t.name} يبدو يُحمّل بدون consent`,
          description: `tracker ${t.name} موجود لكنه قد يُحمّل قبل موافقة المستخدم — مخالفة GDPR`,
          fix: `حمّل ${t.name} فقط بعد قبول المستخدم في cookie banner`,
          autoFixable: false,
        });
      }
    }
  }

  // ── DPA / GDPR mention in privacy ──
  const privacyFile = privacyPaths.find(existsSync);
  if (privacyFile) {
    try {
      const content = readFileSync(privacyFile, 'utf8');
      if (!/GDPR|PDPL|151.*2020|DPA|Data Protection/i.test(content)) {
        findings.push({
          id: 'PRIV-009',
          category: 'data-privacy',
          severity: 'medium',
          title: 'سياسة الخصوصية لا تذكر GDPR / PDPL صراحةً',
          description: 'يجب الإشارة للقوانين المرجعية (GDPR للأوروبيين، PDPL مصر 151/2020)',
          location: privacyFile,
          fix: 'أضف قسم "الإطار القانوني" يذكر القوانين المعمول بها',
          autoFixable: false,
        });
      }
    } catch { /* */ }
  }

  return findings;
}
