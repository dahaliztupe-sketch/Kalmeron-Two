// Placeholder for Galileo.
// Replace with actual @galileo-ai/sdk when available.
export const galileo = {
  evaluate: async (params: any) => ({
    hallucination: { score: 0.05, explanation: 'Low' },
  }),
};

export async function evaluateAgentOutput(agentName: string, input: string, output: string, context?: string) {
  return await galileo.evaluate({ agentName, input, output, context });
}
