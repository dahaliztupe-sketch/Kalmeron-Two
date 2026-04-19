import { generateObject } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { z } from 'zod';
import { Persona } from './types';

export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  occupation: z.string(),
  incomeLevel: z.enum(['low', 'medium', 'high']),
  location: z.string(),
  goals: z.array(z.string()),
  painPoints: z.array(z.string()),
  interests: z.array(z.string()),
  decisionFactors: z.array(z.string()),
});

export async function generatePersonas(marketDescription: string, count: number): Promise<Persona[]> {
  const { object } = await generateObject({
    model: MODELS.FLASH,
    temperature: 0.8,
    system: `أنت خبير في أبحاث السوق وعلم نفس المستهلك. مهمتك هي توليد شخصيات افتراضية (Buyer Personas) واقعية ومتعددة الأبعاد بناءً على وصف السوق المستهدف. كل شخصية يجب أن تكون قابلة للاستخدام في محاكاة اكتشاف العملاء. تجنب الصور النمطية تماماً.`,
    prompt: `قم بتوليد ${count} شخصية لعملاء محتملين لهذا السوق: "${marketDescription}"`,
    schema: z.object({
        personas: z.array(PersonaSchema)
    })
  });
  
  return object.personas;
}
