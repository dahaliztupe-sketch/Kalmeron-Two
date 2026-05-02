/**
 * OpenMeter tracking for real-time usage metrics.
 * Ensure OPENMETER_API_KEY and OPENMETER_BASE_URL are set in environment.
 * When not configured, calls are no-ops.
 */

interface OpenMeterClient {
  ingest(event: {
    specversion: string;
    type: string;
    source: string;
    subject: string;
    data: Record<string, unknown>;
  }): Promise<void>;
}

interface OpenMeterConstructor {
  new (config: { apiKey: string; baseUrl: string }): OpenMeterClient;
}

let _client: OpenMeterClient | null = null;

async function getClient(): Promise<OpenMeterClient | null> {
  if (!process.env['OPENMETER_API_KEY']) return null;
  if (_client) return _client;
  try {
    const { OpenMeter } = await import('@openmeter/sdk') as { OpenMeter: OpenMeterConstructor };
    _client = new OpenMeter({
      apiKey: process.env['OPENMETER_API_KEY']!,
      baseUrl: process.env['OPENMETER_BASE_URL'] ?? 'https://openmeter.cloud',
    });
    return _client;
  } catch {
    return null;
  }
}

export async function trackAgentUsage(
  userId: string,
  agentName: string,
  model: string,
  tokens: number,
): Promise<void> {
  const client = await getClient();
  if (!client) return;
  try {
    await client.ingest({
      specversion: '1.0',
      type: 'agent_execution',
      source: 'kalmeron-two',
      subject: userId,
      data: { agentName, model, tokens },
    });
  } catch (error) {
    // best-effort telemetry — swallow silently
  }
}
