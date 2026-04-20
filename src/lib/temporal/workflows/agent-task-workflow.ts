import { proxyActivities } from '@temporalio/workflow';

const { executeStepOne, executeStepTwo, updateTaskStatus } = proxyActivities<{
  executeStepOne(input: any): Promise<any>;
  executeStepTwo(input: any): Promise<any>;
  updateTaskStatus(taskId: string, status: string, result?: any): Promise<void>;
}>({ startToCloseTimeout: '1 hour' });

export async function agentTaskWorkflow(taskId: string, initialInput: any): Promise<any> {
  await updateTaskStatus(taskId, 'in_progress');
  
  const stepOneResult = await executeStepOne(initialInput);
  
  // انتظار دون استهلاك موارد (Durable Execution Supported)
  // await sleep('1h');
  
  const finalResult = await executeStepTwo(stepOneResult);
  
  await updateTaskStatus(taskId, 'completed', finalResult);
  return finalResult;
}
