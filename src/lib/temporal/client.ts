// ts-nocheck: reason=temporal-sdk has no TypeScript types; awaiting @temporalio/client upgrade
// @ts-nocheck
import { Client, Connection } from '@temporalio/client';
import { logger } from '@/src/lib/logger';

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client | null> {
  if (client) return client;
  try {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_HOST || 'localhost:7233',
    });
    client = new Client({ connection });
    return client;
  } catch (err) {
    logger.warn({
      event: 'temporal_unavailable',
      reason: err instanceof Error ? err.message : String(err),
      message: 'Temporal server unreachable — running in degraded mode without durable workflows.',
    });
    return null;
  }
}
