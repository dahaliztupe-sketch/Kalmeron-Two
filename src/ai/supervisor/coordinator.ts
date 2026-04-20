// @ts-nocheck
import { AgentRegistry } from '../agents/registry';
import { logTrace } from '../meta/tracer';

export async function runCoordinator(userGoal: string) {
  // اختيار الوكيل المناسب بناءً على الهدف
  const agentKeys = Object.keys(AgentRegistry);
  const selectedAgentKey = agentKeys[0] || 'idea-validator';
  const selectedAgent = AgentRegistry[selectedAgentKey as keyof typeof AgentRegistry];

  let result: string;
  try {
    result = await selectedAgent.action.execute({
      task: userGoal,
      userId: 'coordinator',
    });
  } catch {
    result = `تعذّر تنفيذ المهمة: ${userGoal}`;
  }

  await logTrace({
    traceId: Math.random().toString(36),
    agentName: 'coordinator',
    userId: 'anonymous',
    timestamp: new Date(),
    input: userGoal,
    finalOutput: result,
    metrics: { totalDuration: 0, tokensUsed: 0, costCents: 0 },
  });

  return result;
}
