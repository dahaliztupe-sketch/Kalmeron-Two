import { generateObject } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { z } from 'zod';
import { Persona } from './types';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { PERSONA_GENERATOR_PROMPT } from './prompt';

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
  return instrumentAgent('persona_generator', async () => {
    const { object } = await generateObject({
      model: MODELS.FLASH,
      temperature: 0.8,
      system: PERSONA_GENERATOR_PROMPT,
      prompt: `قم بتوليد ${count} شخصية لعملاء محتملين لهذا السوق: "${marketDescription}"`,
      schema: z.object({
          personas: z.array(PersonaSchema)
      })
    });

    return object.personas;
  }, { model: 'gemini-flash', input: { marketDescription, count }, toolsUsed: ['generate.object'] });
}
