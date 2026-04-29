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

function flatten(obj: any, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

export async function auditI18n(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── Translation files exist ──
  const arPath = 'messages/ar.json';
  const enPath = 'messages/en.json';
  if (!existsSync(arPath)) {
    findings.push({
      id: 'I18N-001',
      category: 'i18n',
      severity: 'critical',
      title: 'ملف الترجمة العربي مفقود (messages/ar.json)',
      description: 'بدون ملف ar.json: التطبيق العربي لن يعمل',
      fix: 'أنشئ messages/ar.json بهيكل next-intl',
      autoFixable: false,
    });
    return findings;
  }
  if (!existsSync(enPath)) {
    findings.push({
      id: 'I18N-002',
      category: 'i18n',
      severity: 'high',
      title: 'ملف الترجمة الإنجليزي مفقود',
      description: 'العملاء الدوليون والمستثمرون لن يفهموا التطبيق',
      fix: 'أنشئ messages/en.json بنفس مفاتيح ar.json',
      autoFixable: false,
    });
  }

  // ── Translation parity ──
  if (existsSync(arPath) && existsSync(enPath)) {
    try {
      const ar = flatten(JSON.parse(readFileSync(arPath, 'utf8')));
      const en = flatten(JSON.parse(readFileSync(enPath, 'utf8')));
      const arKeys = new Set(Object.keys(ar));
      const enKeys = new Set(Object.keys(en));

      const missingInEn = [...arKeys].filter(k => !enKeys.has(k));
      const missingInAr = [...enKeys].filter(k => !arKeys.has(k));

      if (missingInEn.length > 0) {
        findings.push({
          id: 'I18N-003',
          category: 'i18n',
          severity: missingInEn.length > 20 ? 'high' : 'medium',
          title: `${missingInEn.length} مفتاح ترجمة موجود في ar.json ومفقود في en.json`,
          description: 'تباين بين ملفات الترجمة يكسر النسخة الإنجليزية',
          evidence: missingInEn.slice(0, 8).join('\n'),
          fix: 'أضف المفاتيح المفقودة في messages/en.json أو استخدم scripts/i18n-diff.mjs',
          autoFixable: false,
        });
      }
      if (missingInAr.length > 0) {
        findings.push({
          id: 'I18N-004',
          category: 'i18n',
          severity: missingInAr.length > 20 ? 'high' : 'medium',
          title: `${missingInAr.length} مفتاح موجود في en.json ومفقود في ar.json`,
          description: 'مفاتيح إنجليزية بدون ترجمة عربية',
          evidence: missingInAr.slice(0, 8).join('\n'),
          fix: 'أضف ترجمات عربية في messages/ar.json',
          autoFixable: false,
        });
      }

      // ── Untranslated values (English text in ar.json) ──
      const englishOnlyInAr = Object.entries(ar).filter(([_, v]) =>
        v && v.length > 4 && /^[\x00-\x7F\s]+$/.test(v) && /[a-zA-Z]{3,}/.test(v),
      );
      if (englishOnlyInAr.length > 5) {
        findings.push({
          id: 'I18N-005',
          category: 'i18n',
          severity: 'medium',
          title: `${englishOnlyInAr.length} قيمة في ar.json تبدو غير مترجمة (إنجليزية فقط)`,
          description: 'مفاتيح في الملف العربي لا تحتوي على أي حرف عربي',
          evidence: englishOnlyInAr.slice(0, 5).map(([k, v]) => `${k}: ${v}`).join('\n'),
          fix: 'راجع وترجم القيم للعربية',
          autoFixable: false,
        });
      }
    } catch (e: any) {
      findings.push({
        id: 'I18N-006',
        category: 'i18n',
        severity: 'high',
        title: 'فشل قراءة ملفات الترجمة',
        description: String(e?.message ?? e),
        fix: 'تأكد أن ar.json / en.json JSON صالح',
        autoFixable: false,
      });
    }
  }

  // ── Hard-coded Arabic strings outside i18n ──
  const hardcodedRaw = safeExec(
    `rg -n "[\\u0600-\\u06FF]{4,}" app components -g "*.tsx" -g "!*test*" -g "!*spec*" 2>/dev/null | wc -l`
  ).trim();
  const t_usage = safeExec(
    `rg -l "useTranslations|getTranslations|t\\(" app components -g "*.tsx" 2>/dev/null | wc -l`
  ).trim();
  if (Number(hardcodedRaw) > 100 && Number(t_usage) < 20) {
    findings.push({
      id: 'I18N-007',
      category: 'i18n',
      severity: 'high',
      title: `${hardcodedRaw} نص عربي مدمج في الكود مع استخدام محدود لـ useTranslations`,
      description: 'النصوص المدمجة في الكود لا يمكن ترجمتها للإنجليزية للمستثمرين الدوليين',
      fix: 'انقل النصوص إلى messages/ar.json واستدعِها عبر useTranslations()',
      autoFixable: false,
      references: ['https://next-intl-docs.vercel.app/'],
    });
  }

  // ── RTL/LTR mixing ──
  const ltrInRtl = safeExec(
    `rg -n "ml-|mr-|left-|right-|pl-|pr-|text-left|text-right" app components -g "*.tsx" 2>/dev/null | wc -l`
  ).trim();
  const logicalProps = safeExec(
    `rg -n "ms-|me-|ps-|pe-|start-|end-|text-start|text-end" app components -g "*.tsx" 2>/dev/null | wc -l`
  ).trim();
  if (Number(ltrInRtl) > 50 && Number(logicalProps) < Number(ltrInRtl) * 0.3) {
    findings.push({
      id: 'I18N-008',
      category: 'i18n',
      severity: 'medium',
      title: `استخدام كثيف لخصائص فيزيائية (left/right) بدلاً من المنطقية (start/end)`,
      description: `${ltrInRtl} استخدام فيزيائي مقابل ${logicalProps} منطقي — يكسر التبديل بين RTL/LTR`,
      fix: 'استبدل ml-* بـ ms-*, mr-* بـ me-*, text-left بـ text-start (Tailwind logical)',
      autoFixable: false,
      references: ['https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values'],
    });
  }

  // ── i18n routing config ──
  if (!existsSync('i18n/routing.ts') && !existsSync('src/i18n/routing.ts')) {
    findings.push({
      id: 'I18N-009',
      category: 'i18n',
      severity: 'medium',
      title: 'إعدادات routing للـ i18n مفقودة',
      description: 'بدون routing config: لا يوجد /ar/ /en/ في الـ URL',
      fix: 'أنشئ i18n/routing.ts بـ next-intl/routing',
      autoFixable: false,
    });
  }

  // ── Number / Date formatting ──
  const intlFmt = safeExec(
    `rg -l "Intl\\.NumberFormat|Intl\\.DateTimeFormat|formatDate|formatNumber" app components -g "*.tsx" 2>/dev/null`
  ).split('\n').filter(Boolean).length;
  if (intlFmt < 3) {
    findings.push({
      id: 'I18N-010',
      category: 'i18n',
      severity: 'low',
      title: 'تنسيق الأرقام/التواريخ بالـ Locale نادر',
      description: 'التواريخ والأرقام يجب أن تظهر بتنسيق "ar-EG" أو "en-US" حسب اللغة',
      fix: 'استخدم new Intl.NumberFormat(locale) و new Intl.DateTimeFormat(locale)',
      autoFixable: false,
    });
  }

  return findings;
}
