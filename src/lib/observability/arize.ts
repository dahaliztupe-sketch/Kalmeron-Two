// Placeholder for Arize Phoenix. 
// Replace with actual @arize-ai/phoenix when available.
export const phoenix = {
  log: async (params: any) => console.log('Log interaction', params),
  evaluate: async (params: any) => ({ accuracy: 0.95 }),
  getAlerts: async (params: any) => [],
};

export async function logAgentInteraction(agentName: string, userId: string, input: string, output: string, metadata: Record<string, any> = {}) {
  await phoenix.log({ agentName, userId, input, output, timestamp: new Date(), metadata });
}
