import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { COFOUNDER_COACH_PROMPT } from './prompt';

export interface CofounderHealthInput {
  founders: Array<{
    name: string;
    role: string;
    equity: number;
    answers: {
      visionAlignment: number;
      roleClarity: number;
      communicationQuality: number;
      conflictResolution: number;
      commitmentLevel: number;
      decisionMaking: number;
    };
  }>;
  companyStage: string;
  specificChallenges?: string;
}

export async function cofounderHealthCheckAction(input: CofounderHealthInput): Promise<string> {
  return instrumentAgent(
    'cofounder_coach',
    async () => {
      c

      const baseSystem = COFOUNDER_COACH_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;

      const foundersText = input.founders.map(f => {
        const avg = Object.values(f.answers).reduce((a, b) => a + b, 0) / Object.keys(f.answers).length;
        return `**${f.name}** (${f.role} — ${f.equity}٪):
- توافق الرؤية: ${f.answers.visionAlignment}/5
- وضوح الدور: ${f.answers.roleClarity}/5
- جودة التواصل: ${f.answers.communicationQuality}/5
- حل النزاعات: ${f.answers.conflictResolution}/5
- مستوى الالتزام: ${f.answers.commitmentLevel}/5
- اتخاذ القرار: ${f.answers.decisionMaking}/5
- متوسط الصحة: ${avg.toFixed(1)}/5`;
      }).join('\n\n');

      const prompt = `مرحلة الشركة: ${input.companyStage}
${input.specificChallenges ? `تحديات محددة: ${input.specificChallenges}` : ''}

تقييمات المؤسسين:
${foundersText}

قدّم تقرير صحة الفريق:

## 🌡️ التشخيص الكلي
(درجة صحة الفريق من ١٠ مع تبرير موجز)

## ✅ نقاط القوة الجوهرية
(ما الذي يعمل جيداً في هذا الفريق؟)

## ⚠️ مناطق الخطر
(لكل خطر: ما هو؟ لماذا مهم؟ ما التأثير المتوقع لو لم يُعالج؟)

## 🔧 خطة العمل (٣٠ يوماً)
(٣-٥ خطوات محددة وقابلة للتنفيذ فوراً)

## 📋 محادثات يجب أن تحدث هذا الأسبوع
(محاور الحوار الحرج التي يجب أن يجريها المؤسسون الآن)

## 🛡️ اتفاقيات الوقاية
(بنود يجب إضافتها أو مراجعتها في اتفاقية المؤسسين)

## 📅 متى تطلبون وساطة خارجية؟
(العلامات الحمراء التي تتطلب مستشاراً محايداً)`;

      const { text } = await generateText({ model: MODELS.PRO, system, prompt });
      return text;
    },
    { model: 'gemini-pro', input: { stage: input.companyStage, founderCount: input.founders.length }, toolsUsed: ['cofounder.health', 'cofounder.dynamics'] }
  );
}
