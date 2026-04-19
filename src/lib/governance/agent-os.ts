import { AgentOS } from '@agentmesh/sdk';

export const agentOS = new AgentOS({
  policyEngine: 'opa', 
  policies: [
    {
      name: 'least-privilege',
      rule: `
        package agentmesh.policy
        default allow = false
        allow {
          input.agent.role == "admin"
          input.action in ["read", "write", "delete"]
        }
        allow {
          input.agent.role == "user"
          input.action == "read"
          input.resource.owner == input.agent.id
        }
      `,
    },
    {
      name: 'tool-restriction',
      rule: `
        package agentmesh.policy
        allow {
          input.tool in input.agent.allowed_tools
        }
      `,
    },
  ],
});
