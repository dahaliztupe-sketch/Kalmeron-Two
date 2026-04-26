// @ts-nocheck
import { proxyActivities } from '@temporalio/workflow';

const { executeStepOne, executeStepTwo, updateTaskStatus } = proxyActivities<{
  executeStepOne(input: unknown): Promise<unknown>;
  executeStepTwo(input: unknown): Promise<unknown>;
  updateTaskStatus(taskId: string, status: string, result?: unknown): Promise<void>;
}>({ startToCloseTimeout: '1 hour' });

export async function agentTaskWorkflow(taskId: string, initialInput: unknown): Promise<unknown> {
  await updateTaskStatus(taskId, 'in_progress');
  
  const stepOneResult = await executeStepOne(initialInput);
  
  // انتظار دون استهلاك موارد (Durable Execution Supported)
  // await sleep('1h');
  
  const finalResult = await executeStepTwo(stepOneResult);
  
  await updateTaskStatus(taskId, 'completed', finalResult);
  return finalResult;
}
