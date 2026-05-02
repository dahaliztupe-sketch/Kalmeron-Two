// @ts-nocheck
import { initAiSdkCostTelemetry, consoleSink } from 'ai-sdk-cost';
import { db } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { callbackSink } from 'ai-sdk-cost';

export const telemetry = initAiSdkCostTelemetry({
  sink: callbackSink(async (log) => {
    // Log to console for observability
    // AI cost logged to Firestore below
    // Log to Firestore for persistence
    await addDoc(collection(db, 'ai_usage_logs'), {
      ...log,
      timestamp: new Date(),
    });
  }),
});
