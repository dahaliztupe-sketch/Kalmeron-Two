export interface AgentContext {
  id: string;
  role: 'admin' | 'user' | 'guest';
  allowedTools: string[];
}

export interface ResourceContext {
  owner?: string;
  type?: string;
}

export type AgentAction = 'read' | 'write' | 'delete' | 'execute';

export interface PolicyResult {
  allowed: boolean;
  reason: string;
  policy: string;
}

export interface PolicyInput {
  agent: AgentContext;
  action: AgentAction;
  resource: ResourceContext;
  tool?: string;
}

class AgentOSImpl {
  /**
   * Evaluates all applicable policies in order:
   * 1. least-privilege — role/action/ownership check
   * 2. tool-restriction — if a tool is specified, it must be in agent.allowedTools
   *
   * Returns the first denial encountered, or an allow if all policies pass.
   */
  evaluatePolicy(input: PolicyInput): PolicyResult {
    const leastPrivilege = this.evaluateLeastPrivilege(input);
    if (!leastPrivilege.allowed) return leastPrivilege;

    if (input.tool !== undefined) {
      const toolRestriction = this.evaluateToolRestriction(input.agent, input.tool);
      if (!toolRestriction.allowed) return toolRestriction;
    }

    return { allowed: true, reason: 'All policies satisfied', policy: 'all' };
  }

  private evaluateLeastPrivilege(input: PolicyInput): PolicyResult {
    const { agent, action, resource } = input;

    if (agent.role === 'admin') {
      return { allowed: true, reason: 'Admin role has full access', policy: 'least-privilege' };
    }

    if (agent.role === 'user') {
      if (action === 'read') {
        // Ownership is required — missing owner means unclaimable resource, deny.
        if (resource.owner === agent.id) {
          return { allowed: true, reason: 'User can read own resources', policy: 'least-privilege' };
        }
        const ownerDesc = resource.owner ?? '(no owner)';
        return {
          allowed: false,
          reason: `User ${agent.id} cannot read resources owned by ${ownerDesc}`,
          policy: 'least-privilege',
        };
      }
      return {
        allowed: false,
        reason: `User role cannot perform action: ${action}`,
        policy: 'least-privilege',
      };
    }

    return {
      allowed: false,
      reason: 'Guest role has no permissions',
      policy: 'least-privilege',
    };
  }

  private evaluateToolRestriction(agent: AgentContext, toolName: string): PolicyResult {
    if (agent.allowedTools.includes(toolName)) {
      return {
        allowed: true,
        reason: `Tool ${toolName} is in agent's allowedTools`,
        policy: 'tool-restriction',
      };
    }
    return {
      allowed: false,
      reason: `Tool ${toolName} is not in agent's allowedTools: [${agent.allowedTools.join(', ')}]`,
      policy: 'tool-restriction',
    };
  }
}

export const agentOS = new AgentOSImpl();
