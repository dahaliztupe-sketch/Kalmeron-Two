// @ts-nocheck
import { langfuse } from './langfuse';

export async function recordAgentMetric(
  agentName: string,
  metric: string,
  value: number,
  tags: Record<string, string> = {}
) {
  // Mapping to Langfuse score as a fallback
  await langfuse.score({
    name: metric,
    value,
    comment: JSON.stringify(tags),
  });
}

export const AgentMetrics = {
  accuracy: (agentName: string, value: number) => recordAgentMetric(agentName, 'accuracy', value),
  latency: (agentName: string, value: number) => recordAgentMetric(agentName, 'latency_ms', value),
  userSatisfaction: (agentName: string, value: number) => recordAgentMetric(agentName, 'user_satisfaction', value),
  hallucinationRate: (agentName: string, value: number) => recordAgentMetric(agentName, 'hallucination_rate', value),
};
