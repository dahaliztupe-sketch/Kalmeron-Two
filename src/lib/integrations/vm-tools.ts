// @ts-nocheck
/**
 * Agent tools backed by the Virtual Office VM.
 * Each tool auto-provisions a VM for the calling agent if needed.
 */
import { getAgentVM, provisionVM, runTaskOnVM } from '@/src/lib/virtual-office/vm-manager';

async function ensureVM(agentId: string, departmentId = 'general') {
  const existing = await getAgentVM(agentId);
  if (existing) return existing;
  return provisionVM(agentId, departmentId);
}

export async function browse_web(agentId: string, url: string, action: 'fetch' | 'screenshot' = 'fetch') {
  const vm = await ensureVM(agentId);
  return runTaskOnVM(vm.id!, { kind: 'browse', payload: { url, action } }, 45_000);
}

export async function send_email_from_vm(
  agentId: string,
  args: { to: string; subject: string; body: string; from?: string }
) {
  const vm = await ensureVM(agentId);
  return runTaskOnVM(vm.id!, { kind: 'email', payload: args }, 30_000);
}

export async function read_file_from_vm(agentId: string, path: string) {
  const vm = await ensureVM(agentId);
  return runTaskOnVM(vm.id!, { kind: 'fs-read', payload: { path } }, 15_000);
}

export async function write_file_to_vm(agentId: string, path: string, content: string) {
  const vm = await ensureVM(agentId);
  return runTaskOnVM(vm.id!, { kind: 'fs-write', payload: { path, content } }, 15_000);
}
