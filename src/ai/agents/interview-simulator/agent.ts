// @ts-nocheck
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { Persona } from '../persona-generator/types';

export async function simulateInterview(persona: Persona, ideaDescription: string, questions: string[]): Promise<string[]> {
  const responses: string[] = [];
  
  for (const question of questions) {
    const { text } = await generateText({
      model: MODELS.FLASH,
      system: `أنت خبير في إجراء مقابلات اكتشاف العملاء. مهمتك هي التظاهر بأنك الشخصية التالية: 
      الاسم: ${persona.name}
      العمر: ${persona.age}
      المهنة: ${persona.occupation}
      الأهداف: ${persona.goals.join(', ')}
      نقاط الألم: ${persona.painPoints.join(', ')}
      
      أجب على أسئلة رائد الأعمال حول فكرة منتجه: "${ideaDescription}"
      أجب بشكل طبيعي وصادق كما لو كنت شخصًا حقيقيًا. لا تقدم إجابات مثالية. عبر عن شكوكك واعتراضاتك الحقيقية.`,
      prompt: `السؤال: ${question}`
    });
    responses.push(text);
  }
  return responses;
}

export async function simulateFocusGroup(ideaDescription: string, personas: Persona[], questions: string[]) {
  const groupResults = await Promise.all(
    personas.map(persona => simulateInterview(persona, ideaDescription, questions))
  );
  
  return personas.map((persona, index) => ({
    personaId: persona.id,
    name: persona.name,
    responses: groupResults[index]
  }));
}
