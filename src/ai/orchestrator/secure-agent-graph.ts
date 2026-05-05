import { StateGraph, Annotation, MemorySaver } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { ExecutionRing, agentOSIntercept } from '@/src/lib/security/agent-os';
import { globalAgentSRE } from '@/src/lib/governance/agent-sre';

// XOA Classifications
type TaskClass = 'Blind' | 'Schema-Inferable' | 'Read-Required';

export const SecureAgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: (a: BaseMessage[], b: BaseMessage[]) => a.concat(b) }),
  userQuery: Annotation<string>(),
  taskClassification: Annotation<TaskClass>(),
  allowedTools: Annotation<string[]>(),
  trajectoryPlan: Annotation<string>(),
  pendingToolCall: Annotation<{ name: string; args: unknown } | null>(),
  toolVerified: Annotation<boolean>(),
  sandboxResult: Annotation<string>(),
  maskedMemory: Annotation<string>(),
  finalOutput: Annotation<string>(),
});

type SecureAgentStateType = typeof SecureAgentState.State;

// 1. Task Classifier (XOA + CaMeL)
async function classifyTaskNode(state: SecureAgentStateType): Promise<Partial<SecureAgentStateType>> {
  const { text } = await generateText({
    model: MODELS.FLASH,
    prompt: `Classify this task into ONE of these categories: 
    - 'Blind' (only utilizes tools, no external data parsing)
    - 'Schema-Inferable' (needs data processing but can be done via structured script, avoiding context pollution)
    - 'Read-Required' (must load external text into LLM context, very risky). 
    Return ONLY the category name. Task: ${state.userQuery}`,
  });

  let classification: TaskClass = 'Read-Required';
  if (text.includes('Blind')) classification = 'Blind';
  else if (text.includes('Schema-Inferable')) classification = 'Schema-Inferable';

  return { taskClassification: classification };
}

// 2. Secure Planner (DRIFT)
async function securePlanNode(state: SecureAgentStateType): Promise<Partial<SecureAgentStateType>> {
  const { text: plan } = await generateText({
    model: MODELS.FLASH,
    prompt: `Create a safe trajectory plan and allowed tool whitelist for this task: "${state.userQuery}". 
    Format:
    ALLOWED_TOOLS: read_web_page, send_email, delete_data (choose only appropriate ones)
    PLAN: step 1...`,
  });

  const allowedTools = plan.match(/ALLOWED_TOOLS:\s*(.*)/)?.[1].split(',').map((s: string) => s.trim()) ?? [];
  return { trajectoryPlan: plan, allowedTools };
}

// 3. Dynamic Validator (DRIFT)
async function validateStepNode(state: SecureAgentStateType): Promise<Partial<SecureAgentStateType>> {
  if (!globalAgentSRE.isHealthy()) {
    return { finalOutput: 'Agent operations suspended by SRE Circuit Breaker.' };
  }

  const toolCall = state.pendingToolCall;
  if (toolCall && !state.allowedTools.includes(toolCall.name)) {
    globalAgentSRE.recordError(`Dynamic Validator: Tool ${toolCall.name} not in allowed schema.`);
    return { toolVerified: false };
  }

  return { toolVerified: true };
}

// 4. Causal Verifier (AttriGuard)
async function verifyToolCallNode(state: SecureAgentStateType): Promise<Partial<SecureAgentStateType>> {
  const toolCall = state.pendingToolCall;
  if (!toolCall) return { toolVerified: true };

  if (!state.toolVerified) return { toolVerified: false };

  // Control-Attenuated View: "Shadow run" without untrusted external context
  let verifies = 0;
  for (let i = 0; i < 3; i++) {
    const { text } = await generateText({
      model: MODELS.FLASH,
      prompt: `Given ONLY the user's original query: "${state.userQuery}". Should we legitimately execute the tool "${toolCall.name}" to help the user? Answer YES or NO.`,
    });
    if (text.includes('YES')) verifies++;
  }

  // Fuzzy Survival Criterion (needs majority)
  if (verifies >= 2) {
    try {
      await agentOSIntercept(toolCall.name, ExecutionRing.RING_2);
      return { toolVerified: true };
    } catch {
      return { toolVerified: false };
    }
  } else {
    globalAgentSRE.recordError(
      `Causal Verifier: Tool ${toolCall.name} execution prevented (Likely Prompt Injection).`,
    );
    return { toolVerified: false };
  }
}

// Logic Router
function routeAfterValidation(state: SecureAgentStateType): string {
  if (state.finalOutput) return '__end__';
  if (!state.toolVerified && state.pendingToolCall) return 'injection_isolator';
  return 'execute_tool';
}

// 5. Injection Isolator (DRIFT)
async function injectionIsolatorNode(state: SecureAgentStateType): Promise<Partial<SecureAgentStateType>> {
  return {
    maskedMemory: `Masked malicious attempt to use ${state.pendingToolCall?.name}`,
    pendingToolCall: null,
  };
}

// Execute Tool Placeholder
async function executeToolNode(state: SecureAgentStateType): Promise<Partial<SecureAgentStateType>> {
  if (state.taskClassification === 'Schema-Inferable') {
    return { sandboxResult: 'Executed via sandbox script without reading untrusted data.' };
  }
  return { sandboxResult: 'Tool executed successfully.' };
}

export const secureAgentWorkflow = new StateGraph(SecureAgentState)
  .addNode('classify_task', classifyTaskNode)
  .addNode('secure_plan', securePlanNode)
  .addNode('validate_step', validateStepNode)
  .addNode('verify_tool_call', verifyToolCallNode)
  .addNode('injection_isolator', injectionIsolatorNode)
  .addNode('execute_tool', executeToolNode)

  .addEdge('__start__', 'classify_task')
  .addEdge('classify_task', 'secure_plan')
  .addEdge('secure_plan', 'validate_step')
  .addEdge('validate_step', 'verify_tool_call')
  .addConditionalEdges('verify_tool_call', routeAfterValidation)
  .addEdge('injection_isolator', 'secure_plan')
  .addEdge('execute_tool', '__end__');

const checkpointer = new MemorySaver();

export const secureAgentGraph = secureAgentWorkflow.compile({
  checkpointer,
});
