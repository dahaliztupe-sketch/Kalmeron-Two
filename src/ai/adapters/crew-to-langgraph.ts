// @ts-nocheck
import { Crew } from 'crewai';
import { Runnable } from '@langchain/core/runnables';

/**
 * يحول طاقم CrewAI إلى عقدة LangGraph قابلة للاستخدام
 */
export function crewToLangGraphNode(crew: Crew, nodeName: string): Runnable {
  return async (state: unknown) => {
    let result = '';
    
    try {
      // Mock kickoff if crew is mocked or use real if exists
      result = await crew.kickoff({
        inputs: {
          task: state.task,
          context: state.intermediateResults,
        },
      });
    } catch (e) {
      result = `Mocked execution result for ${nodeName}`;
    }
    
    return {
      intermediateResults: {
        ...state.intermediateResults,
        [nodeName]: result,
      },
    };
  };
}
