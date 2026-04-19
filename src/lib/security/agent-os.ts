import { generateText } from 'ai';

// --------------------------------------------------------------------------
// Microsoft Agent Governance Toolkit (Agent OS) Concept implementation
// --------------------------------------------------------------------------

export enum ExecutionRing {
  RING_0 = 'RING_0', // Core System / High Security (e.g., Delete Database, Payments)
  RING_1 = 'RING_1', // Trusted Internal Services (e.g., Internal API, User Data Mutate)
  RING_2 = 'RING_2', // External Safe APIs (e.g., Weather, Generic Web Search)
  RING_3 = 'RING_3', // Untrusted / Sandbox (e.g., Parsing untrusted user HTML)
}

export interface SecurityPolicy {
  toolName: string;
  requiredRing: ExecutionRing;
  description: string;
}

// OWASP Top 10 Agent Policies Mapping
export const OWASP_AGENT_POLICIES: Record<string, SecurityPolicy> = {
  'delete_data': { requiredRing: ExecutionRing.RING_0, description: 'Deletes system or user data' },
  'send_email': { requiredRing: ExecutionRing.RING_1, description: 'Sends email on behalf of user' },
  'read_web_page': { requiredRing: ExecutionRing.RING_2, description: 'Reads external URL' },
  'parse_untrusted_file': { requiredRing: ExecutionRing.RING_3, description: 'Parses unsafe content' },
};

export class AgentSRE {
  private errorCount: number = 0;
  private readonly errorBudget: number = 5;
  private circuitOpen: boolean = false;
  private killSwitchActivated: boolean = false;

  constructor() {}

  public recordError(errorDetails: string) {
    this.errorCount++;
    console.warn(`[Agent SRE] Error recorded: ${errorDetails}. Count: ${this.errorCount}`);
    if (this.errorCount >= this.errorBudget) {
      this.tripCircuitBreaker();
    }
  }

  public tripCircuitBreaker() {
    this.circuitOpen = true;
    console.error('[Agent SRE] Circuit Breaker TRIPPED. Agent operations suspended.');
  }

  public activateKillSwitch() {
    this.killSwitchActivated = true;
    console.error('[Agent SRE] KILL SWITCH ACTIVATED. Immediate termination of agent.');
  }

  public isHealthy(): boolean {
    return !this.circuitOpen && !this.killSwitchActivated;
  }
  
  public reset() {
    this.errorCount = 0;
    this.circuitOpen = false;
    this.killSwitchActivated = false;
  }
}

export const globalAgentSRE = new AgentSRE();

// Agent OS kernel interceptor (Firewall)
export async function agentOSIntercept(toolName: string, requestedRing: ExecutionRing): Promise<boolean> {
  if (!globalAgentSRE.isHealthy()) {
    throw new Error('Agent OS: Execution blocked due to Circuit Breaker or Kill Switch.');
  }
  
  const policy = OWASP_AGENT_POLICIES[toolName];
  if (!policy) return true; // Unregulated tool

  // Ring check based on priority
  const ringPriority = { 'RING_0': 0, 'RING_1': 1, 'RING_2': 2, 'RING_3': 3 };
  if (ringPriority[requestedRing] < ringPriority[policy.requiredRing]) { // Requires more privilege than available
    globalAgentSRE.recordError(`Privilege escalation attempt for tool ${toolName}`);
    throw new Error(`Agent OS Blocked: ${toolName} requires tighter ring than requested.`);
  }

  return true;
}
