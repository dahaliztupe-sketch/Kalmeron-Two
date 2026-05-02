import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function checkDailyCostThreshold(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logsRef = collection(db, 'ai_usage_logs');
  const q = query(logsRef, where('userId', '==', userId), where('timestamp', '>=', today));
  
  const logs = await getDocs(q);

  const totalCost = logs.docs.reduce((sum, doc) => sum + (doc.data().cost_cents || 0), 0) / 100;

  if (totalCost > 5) { // Threshold: $5
    // daily cost threshold exceeded — implement notification here
  }
}
