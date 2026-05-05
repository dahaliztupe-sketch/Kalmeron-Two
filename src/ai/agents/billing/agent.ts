import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { BILLING_PROMPT } from './prompt';

export const billingAgent = new Agent({
  id: 'billing-agent',
  name: 'Billing Agent',
  instructions: BILLING_PROMPT,
  model: google('gemini-2.5-flash'),
});

export async function billingAgentRun(prompt: string) {
  return instrumentAgent('billing_agent', async () => {
    const res = await billingAgent.generate(prompt) as { text?: string };
    return res?.text ?? res;
  }, { model: 'gemini-2.5-flash', input: { prompt }, toolsUsed: ['mastra.generate'] });
}
