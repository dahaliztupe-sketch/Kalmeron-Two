/**
 * Thin instrumented runners for admin Mastra agents so any invocation
 * appears in the drift dashboard and Langfuse traces automatically.
 */
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { complianceAgent } from './compliance-agent';
import { dashboardMonitorAgent } from './dashboard-monitor-agent';
import { securityAgent } from './security-agent';
import { uxMonitorAgent } from './ux-monitor-agent';

export async function runAdminComplianceAgent(prompt: string) {
  return instrumentAgent('admin.compliance_agent', async () => {
    const res: unknown = await complianceAgent.generate(prompt);
    return res?.text ?? res;
  }, { model: 'gemini-pro', input: prompt, toolsUsed: ['mastra.generate'] });
}

export async function runAdminDashboardMonitorAgent(prompt: string) {
  return instrumentAgent('admin.dashboard_monitor_agent', async () => {
    const res: unknown = await dashboardMonitorAgent.generate(prompt);
    return res?.text ?? res;
  }, { model: 'gemini-flash-lite', input: prompt, toolsUsed: ['mastra.generate'] });
}

export async function runAdminSecurityAgent(prompt: string) {
  return instrumentAgent('admin.security_agent', async () => {
    const res: unknown = await securityAgent.generate(prompt);
    return res?.text ?? res;
  }, { model: 'gemini-pro', input: prompt, toolsUsed: ['mastra.generate'] });
}

export async function runAdminUxMonitorAgent(prompt: string) {
  return instrumentAgent('admin.ux_monitor_agent', async () => {
    const res: unknown = await uxMonitorAgent.generate(prompt);
    return res?.text ?? res;
  }, { model: 'gemini-flash', input: prompt, toolsUsed: ['mastra.generate'] });
}
