import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { COMPLIANCE_PROMPT } from './prompt';

export const complianceAgent = new Agent({
  id: 'compliance-agent',
  name: 'Compliance Agent',
  instructions: COMPLIANCE_PROMPT,
  model: google('gemini-2.5-pro'),
});

export async function complianceAgentRun(prompt: string) {
  return instrumentAgent('compliance_agent', async () => {
    const res = await complianceAgent.generate(prompt) as { text?: string };
    return res?.text ?? res;
  }, { model: 'gemini-pro', input: prompt, toolsUsed: ['mastra.generate'] });
}
