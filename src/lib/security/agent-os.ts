// @ts-nocheck
/**
 * Microsoft Agent Governance Toolkit (Agent OS) concept implementation.
 *
 * - Execution rings classify tools by privilege.
 * - `agentOSIntercept` is the kernel firewall called before tool execution.
 * - `AgentSRE` tracks an error budget and exposes a circuit breaker + kill
 *   switch so a misbehaving agent can be quarantined without taking the rest
 *   of the platform down.
 *
 * All operational events flow through the structured logger so they end up
 * in Sentry / Langfuse / pino sinks instead of stdout.
 */
import { logger } from '@/src/lib/logger';

const sreLogger = logger.child({ component: 'agent-sre' });

export enum ExecutionRing {
  RING_0 = 'RING_0', // Core System / High Security (e.g., Delete Database, Payments)
  RING_1 = 'RING_1', // Trusted Internal Services (e.g., Internal API, User Data Mutate)
  RING_2 = 'RING_2', // External Safe APIs (e.g., Weather, Generic Web Search)
  RING_3 = 'RING_3', // Untrusted / Sandbox (e.g., Parsing untrusted user HTML)
}

export interface SecurityPolicy {
  toolName?: string;
  requiredRing: ExecutionRing;
  description: string;
}

// OWASP Top 10 Agent Policies Mapping
export const OWASP_AGENT_POLICIES: Record<string, SecurityPolicy> = {
  delete_data: { requiredRing: ExecutionRing.RING_0, description: 'Deletes system or user data' },
  send_email: { requiredRing: ExecutionRing.RING_1, description: 'Sends email on behalf of user' },
  read_web_page: { requiredRing: ExecutionRing.RING_2, description: 'Reads external URL' },
  parse_untrusted_file: { requiredRing: ExecutionRing.RING_3, description: 'Parses unsafe content' },
};

export class AgentSRE {
  private errorCount: number = 0;
  private readonly errorBudget: number = 5;
  private circuitOpen: boolean = false;
  private killSwitchActivated: boolean = false;

  constructor() {}

  public recordError(errorDetails: string) {
    this.errorCount++;
    sreLogger.warn(
      { event: 'agent_sre_error_recorded', errorCount: this.errorCount, errorDetails },
      'agent_sre_error_recorded',
    );
    if (this.errorCount >= this.errorBudget) {
      this.tripCircuitBreaker();
    }
  }

  public tripCircuitBreaker() {
    this.circuitOpen = true;
    sreLogger.error(
      { event: 'agent_sre_circuit_open', errorCount: this.errorCount, budget: this.errorBudget },
      'agent_sre_circuit_open',
    );
  }

  public activateKillSwitch() {
    this.killSwitchActivated = true;
    sreLogger.error({ event: 'agent_sre_killswitch' }, 'agent_sre_killswitch');
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
  const ringPriority = { RING_0: 0, RING_1: 1, RING_2: 2, RING_3: 3 };
  if (ringPriority[requestedRing] < ringPriority[policy.requiredRing]) {
    globalAgentSRE.recordError(`Privilege escalation attempt for tool ${toolName}`);
    throw new Error(`Agent OS Blocked: ${toolName} requires tighter ring than requested.`);
  }

  return true;
}
