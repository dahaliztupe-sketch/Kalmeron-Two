import { NextResponse } from 'next/server';
import { ENTERPRISE_EXECUTIVES, ENTERPRISE_DEPARTMENTS } from '@/src/ai/organization/enterprise/hierarchy';
import { AgentRegistry } from '@/src/ai/agents/registry';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const executives = Object.values(ENTERPRISE_EXECUTIVES).map(exec => ({
      role: exec.role,
      agentId: exec.agentId,
      nameAr: exec.nameAr,
      titleAr: exec.titleAr,
      department: exec.department,
      directReports: exec.directReports,
      mandate: exec.mandate,
      kpis: exec.kpis,
      escalatesTo: exec.escalatesTo,
      agent: AgentRegistry[exec.agentId] ? {
        displayNameAr: AgentRegistry[exec.agentId].displayNameAr,
        description: AgentRegistry[exec.agentId].description,
        preferredModel: AgentRegistry[exec.agentId].preferredModel,
        capabilities: AgentRegistry[exec.agentId].capabilities,
      } : null,
    }));

    const departments = Object.values(ENTERPRISE_DEPARTMENTS).map(dept => ({
      id: dept.id,
      nameAr: dept.nameAr,
      head: dept.head,
      agentCount: dept.agents.length,
      agents: dept.agents.map(agentId => ({
        id: agentId,
        displayNameAr: AgentRegistry[agentId]?.displayNameAr || agentId,
        description: AgentRegistry[agentId]?.description || '',
        preferredModel: AgentRegistry[agentId]?.preferredModel,
      })),
      capabilities: dept.capabilities,
    }));

    const totalAgents = Object.keys(AgentRegistry).length;
    const csuite = executives.filter(e => e.escalatesTo !== null);

    return NextResponse.json({
      executives,
      departments,
      stats: {
        totalExecutives: executives.length,
        totalDepartments: departments.length,
        totalAgents,
        csuiteDirect: csuite.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch org chart' }, { status: 500 });
  }
}
