// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { Persona } from '../persona-generator/types';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { INTERVIEW_SIMULATOR_PROMPT } from './prompt';

export async function simulateInterview(persona: Persona, ideaDescription: string, questions: string[]): Promise<string[]> {
  return instrumentAgent(
    'interview_simulator',
    async () => {
      const responses: string[] = [];
      for (const question of questions) {
        const personaContext = `
الاسم: ${persona.name}
العمر: ${persona.age}
المهنة: ${persona.occupation}
الأهداف: ${persona.goals.join(', ')}
نقاط الألم: ${persona.painPoints.join(', ')}
مستوى الدخل: ${persona.incomeLevel}
الموقع: ${persona.location}
عوامل القرار: ${persona.decisionFactors?.join(', ') || 'غير محددة'}

فكرة المنتج التي تُقيّمها: "${ideaDescription}"`;

        const { text } = await generateText({
          model: MODELS.FLASH,
          system: `${INTERVIEW_SIMULATOR_PROMPT}

## الشخصية التي تؤديها الآن:
${personaContext}`,
          prompt: `السؤال: ${question}`,
        });
        responses.push(text);
      }
      return responses;
    },
    { model: 'gemini-flash', input: { personaId: persona?.id, ideaDescription, questionsCount: questions?.length }, toolsUsed: ['generate.text'] }
  );
}

export async function simulateFocusGroup(ideaDescription: string, personas: Persona[], questions: string[]) {
  return instrumentAgent(
    'interview_simulator.focus_group',
    async () => {
      const groupResults = await Promise.all(
        personas.map(persona => simulateInterview(persona, ideaDescription, questions))
      );

      return personas.map((persona, index) => ({
        personaId: persona.id,
        name: persona.name,
        responses: groupResults[index],
      }));
    },
    { model: 'gemini-flash', input: { ideaDescription, personasCount: personas?.length }, toolsUsed: ['focus_group.simulate'] }
  );
}
