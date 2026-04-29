import { readFileSync, existsSync } from 'fs';
import type { AuditFinding } from '../types';

export async function auditStorage(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // ── firestore.rules existence ──
  if (!existsSync('firestore.rules')) {
    findings.push({
      id: 'STOR-001',
      category: 'storage',
      severity: 'critical',
      title: 'firestore.rules ملف مفقود',
      description: 'بدون rules: Firestore قد يكون مفتوحاً للعموم',
      fix: 'أنشئ firestore.rules مع deny-all default',
      autoFixable: false,
    });
    return findings;
  }

  const rules = readFileSync('firestore.rules', 'utf8');

  // ── deny-all default ──
  if (
    !rules.includes('allow read, write: if false') &&
    !rules.includes('allow read,write: if false') &&
    !rules.includes('allow read, write: if false;')
  ) {
    findings.push({
      id: 'STOR-002',
      category: 'storage',
      severity: 'critical',
      title: 'Firestore: لا يوجد deny-all default rule',
      description: 'بدون rule افتراضي لـ deny، قد تكون بعض collections مكشوفة',
      location: 'firestore.rules',
      fix: 'أضف في النهاية: match /{document=**} { allow read, write: if false; }',
      autoFixable: false,
    });
  }

  // ── allow write: if true (خطر) ──
  const openWrites = (rules.match(/allow\s+write:\s*if\s+true/g) || []).length;
  if (openWrites > 0) {
    findings.push({
      id: 'STOR-003',
      category: 'storage',
      severity: 'critical',
      title: `${openWrites} collection مفتوح للكتابة للجميع`,
      description: '"allow write: if true" يسمح لأي شخص بالكتابة',
      location: 'firestore.rules',
      fix: 'استبدل "if true" بـ "if request.auth != null" أو rule أكثر تحديداً',
      autoFixable: false,
    });
  }

  // ── user_credits client-write check ──
  if (rules.includes('user_credits')) {
    const creditSection = rules.split('user_credits')[1]?.slice(0, 400) || '';
    if (
      creditSection.includes('allow write') &&
      !creditSection.includes('if false')
    ) {
      findings.push({
        id: 'STOR-004',
        category: 'storage',
        severity: 'critical',
        title: 'user_credits قابل للتعديل من العميل',
        description: 'المستخدم يمكنه تعديل رصيده بنفسه — خطر احتيال',
        location: 'firestore.rules',
        fix: 'اضبط user_credits: allow read: if isOwner(); allow write: if false;',
        autoFixable: false,
      });
    }
  }

  // ── Backup strategy ──
  const hasBackupCron =
    existsSync('app/api/cron/firestore-backup/route.ts') ||
    (existsSync('vercel.json') && readFileSync('vercel.json', 'utf8').includes('firestore-backup'));
  if (!hasBackupCron) {
    findings.push({
      id: 'STOR-005',
      category: 'storage',
      severity: 'medium',
      title: 'لا يوجد Firestore backup مجدول',
      description: 'فقدان البيانات ممكن بدون نسخ احتياطية منتظمة',
      fix: 'أضف cron job يشغّل Firestore export يومياً',
      autoFixable: false,
    });
  }

  // ── firestore.indexes.json ──
  if (!existsSync('firestore.indexes.json')) {
    findings.push({
      id: 'STOR-006',
      category: 'storage',
      severity: 'low',
      title: 'firestore.indexes.json مفقود',
      description: 'queries معقدة قد تفشل بدون composite indexes',
      fix: 'أنشئ firestore.indexes.json مع الـ indexes اللازمة',
      autoFixable: false,
    });
  }

  // ── storage.rules existence ──
  if (!existsSync('storage.rules')) {
    findings.push({
      id: 'STOR-007',
      category: 'storage',
      severity: 'high',
      title: 'storage.rules مفقود',
      description: 'بدون قواعد Storage: قد يستطيع أي مستخدم رفع/حذف ملفات',
      fix: 'أنشئ storage.rules مع default deny + قواعد مالك صريحة',
      autoFixable: false,
    });
  } else {
    const storageRules = readFileSync('storage.rules', 'utf8');
    if (!storageRules.includes('allow read, write: if false') && !storageRules.match(/match\s+\/\{[^}]+=\*\*\}/)) {
      findings.push({
        id: 'STOR-008',
        category: 'storage',
        severity: 'medium',
        title: 'Storage rules بدون default deny صريح',
        description: 'يُنصح بإضافة catch-all deny في النهاية',
        location: 'storage.rules',
        fix: 'أضف match /{allPaths=**} { allow read, write: if false; }',
        autoFixable: false,
      });
    }
  }

  return findings;
}
