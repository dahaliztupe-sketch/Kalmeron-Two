// @ts-nocheck
import { StateGraph, Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

// ---------------------------------------------------------------------------
// No-Code Visual Builder to LangGraph Compiler (Implementation for Kalmeron Two)
// Translates React Flow JSON representing nodes/edges into an executable LangGraph.
// ---------------------------------------------------------------------------

export interface ReactFlowNode {
  id: string;
  type: 'trigger' | 'ai_prompt' | 'ai_condition' | 'knowledge_base' | 'action';
  data: unknown;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string; // e.g., 'True', 'False' for condition edges
}

const DynamicGraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: (a, b) => a.concat(b) }),
  contextData: Annotation<Record<string, unknown>>(),
  currentNode: Annotation<string>(), // Tracks which node we are evaluating
});

export function compileFlowToLangGraph(nodes: ReactFlowNode[], edges: ReactFlowEdge[]) {
  const workflow = new StateGraph(DynamicGraphState);

  // 1. Register nodes dynamically based on blocks
  nodes.forEach(node => {
    workflow.addNode(node.id, async (state: typeof DynamicGraphState.State) => {
      console.log(`[Dynamic Compiler] Executing node: ${node.id} of type (${node.type})`);
      
      // The logic here binds to node.data configurations
      // e.g., if type === 'ai_prompt', call Gemini with node.data.promptTemplate
      
      return { 
        currentNode: node.id,
        contextData: { ...state.contextData, [`${node.id}_result`]: "Simulation Output" } 
      };
    });
  });

  // 2. Register edges dynamically
  // We identify condition structures vs simple sequential edges
  const conditionNodes = nodes.filter(n => n.type === 'ai_condition');

  edges.forEach(edge => {
    const isSourceCondition = conditionNodes.some(n => n.id === edge.source);
    
    if (isSourceCondition) {
        // Handled via single addConditionalEdges call per condition node below
    } else {
        workflow.addEdge(edge.source, edge.target);
    }
  });

  // 3. Setup Conditional Edges
  conditionNodes.forEach(node => {
     const outgoingEdges = edges.filter(e => e.source === node.id);
     
     // Route based on the output of the condition node (mocking logic)
     workflow.addConditionalEdges(node.id, (state: typeof DynamicGraphState.State) => {
         // Evaluates state.contextData[`${node.id}_result`] to pick route
         // E.g., true/false mapped to edge labels
         return outgoingEdges[0]?.target || '__end__'; // Fallback
     });
  });

  // 4. Define entry point based on 'trigger'
  const startNode = nodes.find(n => n.type === 'trigger');
  if (startNode) {
     workflow.addEdge('__start__', startNode.id);
  }

  // 5. Compile the executable dynamic agent!
  return workflow.compile();
}
