// @ts-nocheck
import { db } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function sendAlert(agentName: string, message: string) {
  await addDoc(collection(db, 'agent_alerts'), {
    agentName,
    message,
    timestamp: new Date()
  });
  // alert written to Firestore above
}
