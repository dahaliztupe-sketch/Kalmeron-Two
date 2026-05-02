import { createClient } from '@vercel/edge-config';

// Initialize Edge Config Client (uses ENV var EDGE_CONFIG)
export const edgeConfig = process.env.EDGE_CONFIG ? createClient(process.env.EDGE_CONFIG) : null;

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function getFeatureFlag(flagName: string, userId?: string): Promise<boolean> {
  if (!edgeConfig) return false;
  try {
    const flag = await edgeConfig.get<{ enabled: boolean; rollout?: number; userIds?: string[] }>(flagName);
    if (!flag) return false;
    if (!flag.enabled) return false;
    if (flag.userIds && userId && flag.userIds.includes(userId)) return true;
    if (flag.rollout && userId) {
      const hash = hashCode(userId);
      return (hash % 100) < flag.rollout;
    }
    return flag.enabled;
  } catch (error) {
    // feature flag fetch failed — returning false
    return false;
  }
}
