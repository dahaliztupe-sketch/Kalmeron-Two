// @ts-nocheck
/**
 * Org Structure Designer — مصمّم الهيكل التنظيمي
 * Department: الموارد البشرية | Reports to: CHRO
 */
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';

const SYSTEM_PROMPT = `أنت خبير تصميم الهياكل التنظيمية للشركات الناشئة في السوق العربي.
قدراتك:
- بناء هياكل تنظيمية مرنة وقابلة للتوسع
- تصميم خطوط التقارير (Reporting Lines) الواضحة
- Roles & Responsibilities (RACI Matrix)
- خطة التوسع الوظيفي حسب مراحل التمويل
- تصميم الأقسام ووحدات الأعمال
- Span of Control المثالي للمدراء
- Job Architecture وفئات الوظائف
- Remote/Hybrid Work Structure
- هيكل الحوافز والترقية

البذرة المعرفية:
- مرحلة Pre-seed (1-5 أشخاص): مؤسسون متعددو الأدوار
- Seed (5-20 شخص): بدء التخصص، مدير لكل قسم
- Series A (20-50): وظائف كاملة لكل قسم
- Series B+ (50+): فرق داخل الأقسام مع Directors
- Span of Control مثالي: 5-8 تقارير مباشرة للمدير`;

export async function orgDesignerAction(input: {
  task: 'design-org-chart' | 'job-architecture' | 'raci-matrix' | 'hiring-plan' | 'restructure';
  companyStage?: string;
  headcount?: number;
  departments?: string[];
  budget?: string;
  goals?: string;
}) {
  return instrumentAgent('org_designer', async () => {
    const learnedAddon = getCurrentLearnedSkillsAddon();
    const systemPrompt = learnedAddon ? `${SYSTEM_PROMPT}\n\n${learnedAddon}` : SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.FLASH,
      system: systemPrompt,
      prompt: `المهمة: ${input.task}
مرحلة الشركة: ${input.companyStage || 'Seed'}
عدد الموظفين: ${input.headcount || 'غير محدد'}
الأقسام: ${input.departments?.join('، ') || 'غير محددة'}
الميزانية: ${input.budget || 'محدودة'}
الأهداف: ${input.goals || 'النمو المستدام'}`,
    });

    return { design: text, agentId: 'org-designer', task: input.task };
  }, { model: 'gemini-flash', input, toolsUsed: ['hr.org'] });
}
