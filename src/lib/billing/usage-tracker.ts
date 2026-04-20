import { OpenMeter } from '@openmeter/sdk';

/**
 * OpenMeter tracking for real-time usage metrics.
 * Ensure OPENMETER_API_KEY and OPENMETER_BASE_URL are set in environment.
 */
const openmeter = new OpenMeter({
  apiKey: process.env.OPENMETER_API_KEY || 'dummy-key',
  baseUrl: process.env.OPENMETER_BASE_URL || 'https://openmeter.local',
});

export async function trackAgentUsage(userId: string, agentName: string, model: string, tokens: number): Promise<void> {
  try {
    await openmeter.ingest({
      specversion: '1.0',
      type: 'agent_execution',
      source: 'kalmeron-two',
      subject: userId,
      data: { agentName, model, tokens },
    });
  } catch (error) {
    console.error('Failed to ingest usage into OpenMeter:', error);
  }
}
