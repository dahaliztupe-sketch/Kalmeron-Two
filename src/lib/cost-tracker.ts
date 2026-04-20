// @ts-nocheck
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function trackAICost(params: {
  userId: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costCents: number;
  feature: string;
}) {
  await addDoc(collection(db, 'ai_usage_logs'), {
    ...params,
    timestamp: new Date(),
  });
  
  // التحقق من تجاوز الحد اليومي
  await checkDailyLimit(params.userId);
}

async function checkDailyLimit(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const q = query(
    collection(db, 'ai_usage_logs'),
    where('userId', '==', userId),
    where('timestamp', '>=', today)
  );
  
  const logs = await getDocs(q);
  
  const totalCost = logs.docs.reduce((sum, doc) => sum + doc.data().costCents, 0) / 100;
  
  if (totalCost > 5) { // $5 حد يومي للمستخدم
    console.warn(`⚠️ User ${userId} exceeded daily cost threshold: $${totalCost}`);
    // يمكن إرسال إشعار للمستخدم أو للمشرف هنا
  }
}
