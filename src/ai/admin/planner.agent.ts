/**
 * Planner Agent — Admin Governance Layer
 * يضع خطط معالجة (Remediation Plans) قابلة للموافقة.
 */
import type { RiskFinding } from './analyst.agent';

export interface RemediationStep {
  action: string;
  rationale: string;
  requiresApproval: boolean;
  rollbackable: boolean;
}

export interface RemediationPlan {
  riskId: string;
  riskTitle: string;
  steps: RemediationStep[];
  createdAt: string;
}

export function plan(findings: RiskFinding[]): RemediationPlan[] {
  return findings.map((f) => {
    const steps: RemediationStep[] = [];
    if (f.category === 'cost') {
      steps.push(
        { action: 'تخفيض جودة النموذج للوكلاء غير الحرجة (PRO → FLASH)', rationale: 'تقليل التكلفة فوراً', requiresApproval: false, rollbackable: true },
        { action: 'تقليل سقف الطلبات لكل دقيقة على /chat', rationale: 'حماية الميزانية', requiresApproval: true, rollbackable: true },
        { action: 'إيقاف استدعاءات الوكلاء غير الأساسية حتى منتصف الليل', rationale: 'وقف الاستنزاف', requiresApproval: true, rollbackable: true },
      );
    } else if (f.category === 'reliability') {
      steps.push(
        { action: 'إعادة محاولة تلقائية مع backoff للوكيل المتأثر', rationale: 'معالجة الأخطاء العابرة', requiresApproval: false, rollbackable: true },
        { action: 'تحويل الطلبات لوكيل احتياطي إن وجد', rationale: 'الحفاظ على تجربة المستخدم', requiresApproval: true, rollbackable: true },
        { action: 'تنبيه فريق التطوير + فتح تذكرة', rationale: 'تحقيق الجذور', requiresApproval: false, rollbackable: false },
      );
    } else if (f.category === 'performance') {
      steps.push(
        { action: 'تفعيل التخزين المؤقت للنتائج المتكررة', rationale: 'تقليل زمن الاستجابة', requiresApproval: false, rollbackable: true },
        { action: 'مراجعة طول prompt وتقليل tokens', rationale: 'تسريع التوليد', requiresApproval: true, rollbackable: true },
      );
    }

    return {
      riskId: f.id,
      riskTitle: f.title,
      steps,
      createdAt: new Date().toISOString(),
    };
  });
}
