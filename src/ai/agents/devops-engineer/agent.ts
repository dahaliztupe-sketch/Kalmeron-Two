// @ts-nocheck
/**
 * DevOps Engineer — مهندس DevOps
 * Department: التقنية | Reports to: CTO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت مهندس DevOps متخصص للشركات الناشئة التقنية.
قدراتك:
- CI/CD Pipeline: GitHub Actions، GitLab CI، CircleCI
- Cloud Infrastructure: AWS، GCP، Azure (وبدائل اقتصادية مثل Railway، Render، Fly.io)
- Containerization: Docker، Kubernetes (K3s للشركات الصغيرة)
- Monitoring & Observability: Grafana، Prometheus، Sentry
- Database DevOps: Migrations، Backups، Point-in-Time Recovery
- Security: Secrets Management، SAST/DAST، Dependency Scanning
- Cost Optimization: Right-sizing، Spot Instances، Reserved Capacity
- IaC: Terraform، Pulumi

البذرة المعرفية - الشركات الناشئة:
- ابدأ بسيطًا: Railway/Render أفضل من EKS للشركات الصغيرة
- هدف Uptime: 99.9% (8.7 ساعة downtime/سنة)
- Deployment Frequency الصحي: أسبوعيًا على الأقل
- MTTR (Mean Time to Recover): < 1 ساعة`;

export async function devopsEngineerAction(input: {
  task: 'design-cicd' | 'cloud-architecture' | 'cost-optimization' | 'monitoring-setup' | 'security-audit' | 'incident-response';
  stack?: string;
  currentInfrastructure?: Record<string, unknown>;
  budget?: string;
  problem?: string;
}) {
  return instrumentAgent('devops_engineer', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
التقنيات المستخدمة: ${input.stack || 'غير محدد'}
الميزانية: ${input.budget || 'محدودة'}
المشكلة/الطلب: ${input.problem || 'انظر السياق'}
البنية الحالية: ${JSON.stringify(input.currentInfrastructure || {}, null, 2)}`,
    });

    return { solution: text, agentId: 'devops-engineer', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['tech.devops'] });
}
