// @ts-nocheck
import { generateObject } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { z } from 'zod';
import { AgentTrace } from './tracer';

export async function evaluateTraceWithCourt(trace: AgentTrace) {
  // Simple ensemble logic: run judge 3 times and average
  const judgePrompt = `أنت قاضٍ موضوعي. قيّم أداء الوكيل: ${trace.agentName} بناءً على المسار: ${JSON.stringify(trace)}. أعطِ درجة من 0-100 وتبريراً.`;
  
  const evaluations = await Promise.all([
      generateObject({ model: MODELS.FLASH, schema: z.object({ score: z.number(), reasoning: z.string() }), prompt: judgePrompt }),
      generateObject({ model: MODELS.FLASH, schema: z.object({ score: z.number(), reasoning: z.string() }), prompt: judgePrompt }),
      generateObject({ model: MODELS.FLASH, schema: z.object({ score: z.number(), reasoning: z.string() }), prompt: judgePrompt })
  ]);

  const scores = evaluations.map(e => e.object.score);
  const finalScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  return { finalScore, reasoning: evaluations[0].object.reasoning };
}
