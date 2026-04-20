export const AGENT_IDENTITIES: Record<string, { id: string; role: string; allowedTools: string[] }> = {
  'idea-validator': { id: 'agent-001', role: 'validator', allowedTools: ['analyze_market', 'search_competitors'] },
  'plan-builder': { id: 'agent-002', role: 'builder', allowedTools: ['generate_plan', 'create_financial_model'] },
  'cfo-agent': { id: 'agent-003', role: 'finance', allowedTools: ['forecast', 'analyze_cashflow'] },
  'legal-guide': { id: 'agent-004', role: 'legal', allowedTools: ['check_compliance', 'generate_nda'] },
};

export function validateAgentAccess(agentName: string, toolName: string): boolean {
  const agent = AGENT_IDENTITIES[agentName];
  if (!agent) return false;
  return agent.allowedTools.includes(toolName);
}
