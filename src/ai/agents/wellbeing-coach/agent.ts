import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { WELLBEING_COACH_PROMPT } from './prompt';

export interface WellbeingAssessment {
  scores: {
    energy: number;
    sleep: number;
    focus: number;
    stress: number;
    purpose: number;
    social: number;
  };
  context?: string;
}

export async function wellbeingCoachAction(assessment: WellbeingAssessment): Promise<string> {
  return instrumentAgent(
    'wellbeing_coach',
    async () => {
      const totalScore = Object.values(assessment.scores).reduce((a, b) => a + b, 0);
      const maxScore = Object.keys(assessment.scores).length * 5;
      const percentage = Math.round((totalScore / maxScore) * 100);

      const level =
        percentage >= 75 ? 'مزدهر' :
        percentage >= 50 ? 'مستقر' :
        percentage >= 30 ? 'تحت ضغط' : 'في خطر';

      c

      const baseSystem = WELLBEING_COACH_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;

      const scoresText = Object.entries(assessment.scores)
        .map(([k, v]) => {
          const labels: Record<string, string> = {
            energy: 'الطاقة', sleep: 'النوم', focus: 'التركيز',
            stress: 'مستوى الضغط (عكسي)', purpose: 'الهدف والمعنى', social: 'الدعم الاجتماعي'
          };
          return `${labels[k] || k}: ${v}/5`;
        })
        .join('، ');

      const prompt = `تقييم رائد الأعمال: ${scoresText}
المجموع: ${percentage}٪ — المستوى: ${level}
${assessment.context ? `السياق الإضافي: ${assessment.context}` : ''}

قدّم تحليلاً دافئاً وعملياً يشمل:
1. **قراءة حالتك الآن** — ما تعيشه بكلمات إنسانية حقيقية
2. **أهم ٣ خطوات عملية** لهذا الأسبوع (محددة وقابلة للتطبيق)
3. **تقنية واحدة** للتطبيق الفوري (تنفس، تأمل، ممارسة بدنية — مناسبة لجدول رائد الأعمال)
4. **جملة تحفيزية** من تجربة رائد أعمال عربي ناجح مر بنفس الموقف
5. **متى تطلب مساعدة متخصص؟** (بوضوح وبدون وصمة)

استخدم نبرة المرشد الحكيم الذي يفهم ضغوط الريادة.`;

      const { text } = await generateText({ model: MODELS.FLASH, system, prompt });
      return text;
    },
    { model: 'gemini-flash', input: assessment, toolsUsed: ['wellbeing.assessment', 'wellbeing.recommendations'] }
  );
}

export async function quickCheckInAction(mood: string): Promise<string> {
  return instrumentAgent(
    'wellbeing_coach_checkin',
    async () => {
      const system = `أنت مدرب الرفاه النفسي في كلميرون. رد بإيجاز دافئ (٥٠-١٠٠ كلمة) على حالة رائد الأعمال. كن عملياً وداعماً.`;
      const { text } = await generateText({
        model: MODELS.FLASH,
        system,
        prompt: `رائد الأعمال يقول: "${mood}". قدّم رداً داعماً وعملياً.`,
      });
      return text;
    },
    { model: 'gemini-flash', input: { mood }, toolsUsed: ['wellbeing.checkin'] }
  );
}
