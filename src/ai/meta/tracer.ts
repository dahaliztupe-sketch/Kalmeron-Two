// @ts-nocheck
import { db } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export interface AgentTrace {
  traceId: string;
  agentName: string;
  userId: string;
  timestamp: Date;
  input: any;
  finalOutput: any;
  metrics: {
    totalDuration: number;
    tokensUsed: number;
    costCents: number;
  };
  flaggedForReview?: boolean;
}

export async function logTrace(trace: AgentTrace) {
  // Logic for detecting failures
  const flaggedForReview = 
    JSON.stringify(trace.finalOutput).includes("عذرًا") || 
    JSON.stringify(trace.finalOutput).length < 50;

  await addDoc(collection(db, 'agent_traces'), {
    ...trace,
    timestamp: new Date(),
    flaggedForReview
  });
}
