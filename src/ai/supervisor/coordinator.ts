import { runTeam, Team } from '@jackchen_me/open-multi-agent';
import { AgentRegistry } from '../agents/registry';
import { logTrace } from '../meta/tracer';
import { monitorDrift } from '../meta/cognitive-companion';

// Define the coordinator team
const team: Team = {
  agents: Object.values(AgentRegistry).map(agent => ({
    name: agent.name,
    description: agent.description,
    action: agent.action, // Wrapped actions
  })),
};

export async function runCoordinator(userGoal: string) {
  const result = await runTeam(team, userGoal);
  
  // Implicitly log the trace
  await logTrace({
      traceId: Math.random().toString(36),
      agentName: 'coordinator',
      userId: 'anonymous',
      timestamp: new Date(),
      input: userGoal,
      finalOutput: result,
      metrics: { totalDuration: 0, tokensUsed: 0, costCents: 0 }
  });

  return result;
}
