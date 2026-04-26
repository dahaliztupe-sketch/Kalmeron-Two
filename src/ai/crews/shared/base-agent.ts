// @ts-nocheck
import { Agent } from 'crewai';

export interface CrewAgentConfig {
  role: string;
  goal: string;
  backstory: string;
  tools?: unknown[];
  verbose?: boolean;
}

export function createCrewAgent(config: CrewAgentConfig): Agent {
  // Fallback to avoid breaking if crewai doesn't exist locally
  try {
    return new Agent({
      role: config.role,
      goal: config.goal,
      backstory: config.backstory,
      tools: config.tools || [],
      verbose: config.verbose || false,
      allowDelegation: true,
    });
  } catch (e) {
    return { ...config, allowDelegation: true };
  }
}
