// @ts-nocheck
import { Supervisor } from '@mastra/core';
import { ideaValidator } from '@/src/agents/idea-validator/agent';
import { planBuilder } from '@/src/agents/plan-builder/agent';
import { cfoAgent } from '@/src/ai/agents/cfo-agent/agent';
import { legalGuideAgent } from '@/src/ai/agents/legal-guide/agent';
import { marketingCrew } from '@/src/crews/prototypes/marketing-crew';

// NOTE: This assumes the agents are properly initialized/exported from their modules.
// In newer Mastra versions, you might need to structure these differently.

export const supervisor = new Supervisor({
  agents: [ideaValidator, planBuilder, cfoAgent, legalGuideAgent, marketingCrew],
  delegationHook: async (task, agent) => {
    console.log(`Delegating task ${task} to agent ${agent.name}`);
  },
  completionScoring: true,
  memoryIsolation: true,
  bailMechanism: true,
});

export async function orchestrateComplexTask(userGoal: string) {
  // Mastra Supervisor 1.x+ API might differ; ensuring this follows the provided pattern.
  return await supervisor.stream(userGoal);
}
