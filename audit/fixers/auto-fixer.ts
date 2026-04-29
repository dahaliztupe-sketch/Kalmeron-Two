import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { AuditFinding } from '../types';

export interface AutoFixResult {
  id: string;
  title: string;
  applied: boolean;
  message: string;
}

/**
 * تطبيق الإصلاحات الآمنة تلقائياً.
 * يقتصر على الإصلاحات منخفضة المخاطر فقط (lint --fix, npm audit fix, إضافة attribute بسيط).
 * أي إصلاح يلمس قواعد Firestore أو الكود الإنتاجي يجب أن يبقى يدوياً.
 */
export async function applyAutoFixes(
  findings: AuditFinding[],
  opts: { dryRun?: boolean } = {},
): Promise<AutoFixResult[]> {
  const results: AutoFixResult[] = [];
  const dryRun = opts.dryRun ?? false;

  const fixable = findings.filter(f => f.autoFixable);

  for (const f of fixable) {
    try {
      switch (f.id) {
        case 'CQ-002': {
          if (dryRun) {
            results.push({ id: f.id, title: f.title, applied: false, message: '[dry-run] eslint --fix' });
          } else {
            execSync('npx eslint . --fix', { stdio: 'inherit', timeout: 120_000 });
            results.push({ id: f.id, title: f.title, applied: true, message: 'eslint --fix executed' });
          }
          break;
        }

        case 'CQ-003': {
          if (dryRun) {
            results.push({ id: f.id, title: f.title, applied: false, message: '[dry-run] npm audit fix' });
          } else {
            execSync('npm audit fix', { stdio: 'inherit', timeout: 180_000 });
            results.push({ id: f.id, title: f.title, applied: true, message: 'npm audit fix executed' });
          }
          break;
        }

        case 'FE-001':
        case 'FE-002': {
          const layoutFile = 'app/layout.tsx';
          if (!existsSync(layoutFile)) {
            results.push({ id: f.id, title: f.title, applied: false, message: 'app/layout.tsx غير موجود' });
            break;
          }
          let content = readFileSync(layoutFile, 'utf8');
          let modified = false;

          if (f.id === 'FE-001' && !content.includes('dir="rtl"') && !content.includes("dir='rtl'")) {
            content = content.replace(/<html(\s|>)/, '<html dir="rtl"$1');
            modified = true;
          }
          if (f.id === 'FE-002' && !content.includes('lang="ar"') && !content.includes("lang='ar'")) {
            content = content.replace(/<html(\s|>)/, '<html lang="ar"$1');
            modified = true;
          }

          if (modified && !dryRun) {
            writeFileSync(layoutFile, content, 'utf8');
            results.push({ id: f.id, title: f.title, applied: true, message: `${f.id}: تم التحديث في ${layoutFile}` });
          } else {
            results.push({
              id: f.id,
              title: f.title,
              applied: false,
              message: dryRun ? '[dry-run] would update layout.tsx' : 'لا تغيير مطلوب',
            });
          }
          break;
        }

        default:
          results.push({
            id: f.id,
            title: f.title,
            applied: false,
            message: `لا يوجد auto-fixer مسجّل لـ ${f.id} — راجع الإصلاح اليدوي`,
          });
      }
    } catch (err: any) {
      results.push({
        id: f.id,
        title: f.title,
        applied: false,
        message: `فشل: ${String(err?.message ?? err).slice(0, 200)}`,
      });
    }
  }

  return results;
}
